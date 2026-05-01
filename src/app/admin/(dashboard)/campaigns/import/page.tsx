"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ImportResult {
  campaign_id: number;
  imported_count: number;
  scheduled_count: number;
  quality_rejected: number;
  skipped_unsubscribed: number;
  validation_errors: Array<{ email: string; reason: string }>;
}

export default function CampaignImportPage() {
  const router = useRouter();
  const [json, setJson] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFile(file: File) {
    const text = await file.text();
    setJson(text);
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const parsed = JSON.parse(json);
      const res = await fetch("/api/admin/campaigns/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Import failed (${res.status})`);
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-2xl">
        <Link href="/admin/campaigns" className="text-sm text-[#5b9a2f] hover:underline">← Campaigns</Link>
        <div className="bg-white border border-[#e8e4dd] rounded-lg p-6 mt-4">
          <div className="w-12 h-12 rounded-full bg-[#5b9a2f]/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#5b9a2f]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-semibold text-[#1a1a1a] mb-3">Batch imported</h1>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-[#e8e4dd] pb-2">
              <dt className="text-[#1a1a1a]/60">Imported</dt>
              <dd className="font-medium text-[#1a1a1a]">{result.imported_count}</dd>
            </div>
            <div className="flex justify-between border-b border-[#e8e4dd] pb-2">
              <dt className="text-[#1a1a1a]/60">Scheduled</dt>
              <dd className="font-medium text-[#5b9a2f]">{result.scheduled_count}</dd>
            </div>
            <div className="flex justify-between border-b border-[#e8e4dd] pb-2">
              <dt className="text-[#1a1a1a]/60">Quality rejected</dt>
              <dd className="font-medium text-[#c0674a]">{result.quality_rejected}</dd>
            </div>
            <div className="flex justify-between border-b border-[#e8e4dd] pb-2">
              <dt className="text-[#1a1a1a]/60">Skipped (unsubscribed)</dt>
              <dd className="font-medium text-[#1a1a1a]/60">{result.skipped_unsubscribed}</dd>
            </div>
          </dl>
          {result.validation_errors.length > 0 && (
            <div className="mt-4 bg-[#c0674a]/5 border border-[#c0674a]/20 rounded-lg p-3">
              <p className="text-xs font-semibold text-[#c0674a] uppercase mb-2">Validation errors</p>
              <ul className="text-xs space-y-1">
                {result.validation_errors.map((e, i) => (
                  <li key={i} className="text-[#1a1a1a]/70">
                    {e.email}: {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push(`/admin/campaigns/${result.campaign_id}`)}
              className="px-4 py-2 bg-[#5b9a2f] text-white text-sm font-medium rounded-lg hover:bg-[#4e8528]"
            >
              View campaign
            </button>
            <button
              onClick={() => {
                setResult(null);
                setJson("");
              }}
              className="px-4 py-2 border border-[#e8e4dd] text-sm rounded-lg hover:bg-[#f8f6f1]"
            >
              Import another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/campaigns" className="text-sm text-[#5b9a2f] hover:underline">← Campaigns</Link>
      <h1 className="font-display text-2xl font-semibold text-[#1a1a1a] mt-4 mb-2">
        Import a weekly batch
      </h1>
      <p className="text-sm text-[#1a1a1a]/60 mb-6">
        Paste the JSON output from the <code className="font-mono text-xs bg-[#f8f6f1] px-1.5 py-0.5 rounded">ops-weekly-outreach-batch</code> Claude skill, or upload the file. Quality-failed targets and unsubscribed emails are skipped automatically.
      </p>

      <div className="bg-white border border-[#e8e4dd] rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
            Upload JSON file
          </label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="block w-full text-sm text-[#1a1a1a] file:mr-3 file:px-4 file:py-2 file:border-0 file:text-sm file:font-medium file:bg-[#f8f6f1] file:text-[#1a1a1a] hover:file:bg-[#e8e4dd] file:cursor-pointer cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
            Or paste JSON
          </label>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder='{"batch_id":"...","campaign_name":"...","send_schedule":{...},"targets":[...]}'
            rows={14}
            className="w-full px-3 py-2 border border-[#e8e4dd] rounded-lg text-xs font-mono focus:outline-none focus:border-[#5b9a2f]"
          />
        </div>

        {error && (
          <div className="bg-[#c0674a]/10 border border-[#c0674a]/30 text-[#c0674a] text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={!json.trim() || submitting}
            className="px-4 py-2 bg-[#5b9a2f] text-white text-sm font-medium rounded-lg hover:bg-[#4e8528] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Importing..." : "Import batch"}
          </button>
          <button
            onClick={() => {
              setJson("");
              setError(null);
            }}
            className="px-4 py-2 border border-[#e8e4dd] text-sm rounded-lg hover:bg-[#f8f6f1]"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
