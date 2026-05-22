"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Star, FileText, Music, Image as ImageIcon, Paperclip } from "lucide-react";

export interface AssetItem {
  id: number;
  filename: string;
  relativePath: string;
  contentType: string;
  sizeBytes: number;
  role: "main_html" | "audio" | "image" | "attachment" | "other";
}

const ROLE_OPTIONS: AssetItem["role"][] = [
  "main_html",
  "audio",
  "image",
  "attachment",
  "other",
];

const ROLE_ICON: Record<AssetItem["role"], React.ComponentType<{ className?: string }>> = {
  main_html: FileText,
  audio: Music,
  image: ImageIcon,
  attachment: Paperclip,
  other: FileText,
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function BundleAssetUploader({
  lessonId,
  initialAssets,
  currentMainFilename,
  onMainChange,
  attachmentMode = false,
}: {
  lessonId: number;
  initialAssets: AssetItem[];
  currentMainFilename: string | null;
  onMainChange: (rel: string | null) => void;
  attachmentMode?: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<string[]>([]); // filenames in flight
  const [error, setError] = useState<string | null>(null);

  const visible = attachmentMode
    ? initialAssets.filter((a) => a.role === "attachment" || a.role === "other")
    : initialAssets;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setError(null);
    for (const file of list) {
      // Use webkitRelativePath when present (folder upload), else flat name.
      const fwrp = file as File & { webkitRelativePath?: string };
      const fullPath = fwrp.webkitRelativePath || file.name;
      // Strip the top-level folder name from webkitRelativePath so the
      // relative_path in DB matches the bundle's internal layout.
      const parts = fullPath.split("/");
      const relativePath = parts.length > 1 ? parts.slice(1).join("/") : fullPath;
      setUploading((u) => [...u, relativePath]);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("lesson_id", String(lessonId));
      fd.append("relative_path", relativePath);
      if (attachmentMode) fd.append("role", "attachment");

      const res = await fetch("/api/admin/lesson-assets", {
        method: "POST",
        body: fd,
      });
      setUploading((u) => u.filter((p) => p !== relativePath));
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(`${relativePath}: ${data?.error ?? "upload failed"}`);
        break;
      }
    }
    router.refresh();
  }

  async function setRole(id: number, role: AssetItem["role"], relativePath: string) {
    await fetch(`/api/admin/lesson-assets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (role === "main_html") {
      onMainChange(relativePath);
    }
    router.refresh();
  }

  async function deleteAsset(id: number) {
    if (!confirm("Remove this file from the lesson?")) return;
    await fetch(`/api/admin/lesson-assets/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border border-dashed border-light-gray rounded-md bg-cream/40 p-6 text-center"
      >
        <Upload className="w-6 h-6 text-charcoal/45 mx-auto mb-2" aria-hidden />
        <p className="font-sans text-sm text-charcoal/75 mb-3">
          Drag &amp; drop files (or a whole folder) here, or click to pick.
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#1a1a1a] text-white font-sans text-xs font-semibold rounded-md px-3 py-1.5 hover:bg-charcoal/90"
        >
          Choose files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          // @ts-expect-error — non-standard but widely supported.
          webkitdirectory=""
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <p className="font-sans text-[10px] text-charcoal/55 mt-2">
          Max 25 MB per file. HTML / audio / image / PDF / Office docs.
        </p>
      </div>

      {error && <p className="font-sans text-xs text-red-600">{error}</p>}

      {uploading.length > 0 && (
        <ul className="space-y-1">
          {uploading.map((p) => (
            <li
              key={p}
              className="font-mono text-xs text-charcoal/65 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse" />
              Uploading {p}…
            </li>
          ))}
        </ul>
      )}

      {visible.length > 0 ? (
        <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-cream/50 border-b border-light-gray">
              <tr>
                <th className="px-3 py-2 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">
                  File
                </th>
                <th className="px-3 py-2 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">
                  Role
                </th>
                <th className="px-3 py-2 text-left font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65">
                  Size
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => {
                const Icon = ROLE_ICON[a.role];
                const isMain =
                  a.role === "main_html" &&
                  a.relativePath === currentMainFilename;
                return (
                  <tr key={a.id} className="border-b border-light-gray last:border-0">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-charcoal/55" aria-hidden />
                        <span className="font-mono text-xs text-charcoal/85 break-all">
                          {a.relativePath}
                        </span>
                        {isMain && (
                          <Star
                            className="w-3.5 h-3.5 text-warm-gold fill-warm-gold"
                            aria-label="Main HTML"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={a.role}
                        onChange={(e) =>
                          setRole(
                            a.id,
                            e.target.value as AssetItem["role"],
                            a.relativePath,
                          )
                        }
                        className="font-sans text-xs border border-light-gray rounded px-2 py-1 bg-white"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-charcoal/55">
                      {formatSize(a.sizeBytes)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => deleteAsset(a.id)}
                        className="text-charcoal/55 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="font-sans text-xs text-charcoal/55 italic">
          No files yet.
        </p>
      )}
    </div>
  );
}
