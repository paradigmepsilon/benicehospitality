import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { requireAuth } from "@/lib/auth";
import { resolveServable } from "@/lib/fleet/doc-files";

export const runtime = "nodejs";

// Added to every HTML document so Alex and Della can fill it in and print it
// to a correctly formatted PDF from the browser. The bar is screen-only. In
// Markdown-built templates the [[slots]] become editable in place; HTML forms
// already carry real inputs. Nothing typed here is sent anywhere: it lives in
// the tab until it is printed.
const TOOLBAR = `
<style>
  #bnhg-bar{position:fixed;top:0;left:0;right:0;z-index:9999;display:flex;gap:10px;align-items:center;padding:10px 16px;background:#1a1a1a;color:#fff;font:500 13px/1.2 "DM Sans",system-ui,sans-serif}
  #bnhg-bar button{font:inherit;font-weight:700;padding:7px 14px;border-radius:6px;border:0;cursor:pointer;background:#5b9a2f;color:#fff}
  #bnhg-bar button.alt{background:transparent;border:1px solid rgba(255,255,255,.4)}
  #bnhg-bar span{opacity:.7}
  body{padding-top:52px}
  .slot[contenteditable]{cursor:text;outline:0}
  .slot[contenteditable]:focus{background:#fff3c4}
  @media print{#bnhg-bar{display:none}body{padding-top:0}.slot{background:none!important;border:0!important}}
</style>
<div id="bnhg-bar">
  <button onclick="window.print()">Print / Save as PDF</button>
  <button class="alt" onclick="if(confirm('Clear everything typed on this page?'))location.reload()">Clear</button>
  <span>Type into any field or highlighted blank, then print. In the print dialog choose "Save as PDF", Letter, no headers and footers. Nothing you type is saved or sent.</span>
</div>
<script>
  document.querySelectorAll(".slot").forEach(function(el){
    el.setAttribute("contenteditable","true");
    el.addEventListener("focus",function(){ if(/^\\[\\[.*\\]\\]$/.test(el.textContent)) { var r=document.createRange(); r.selectNodeContents(el); var s=getSelection(); s.removeAllRanges(); s.addRange(r);} });
  });
</script>`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const target = resolveServable((await params).path);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let data: Buffer;
  try {
    data = await readFile(target.file);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const headers = { "Content-Type": target.type, "Cache-Control": "private, no-store" };
  if (!target.type.startsWith("text/html")) {
    return new NextResponse(new Uint8Array(data), { headers });
  }
  const html = data.toString("utf8");
  const at = html.lastIndexOf("</body>");
  return new NextResponse(at === -1 ? html + TOOLBAR : html.slice(0, at) + TOOLBAR + html.slice(at), { headers });
}
