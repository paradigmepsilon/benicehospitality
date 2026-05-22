"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BundleAssetUploader, {
  type AssetItem,
} from "@/components/admin/BundleAssetUploader";

interface Lesson {
  id: number;
  courseId: number;
  moduleId: number | null;
  slug: string;
  title: string;
  summary: string;
  body: string;
  position: number;
  durationMin: number | null;
  bodyKind: "text" | "bundle" | "video" | "workbook";
  videoUrl: string | null;
  bundleMainFilename: string | null;
  bundleAspect: "slide" | "page";
  minTier: "self-paced" | "cohort" | "operator" | null;
  isPublished: boolean;
}

const BODY_KIND_OPTIONS: Array<Lesson["bodyKind"]> = [
  "text",
  "bundle",
  "video",
  "workbook",
];

export default function LessonEditor({
  courseSlug,
  lesson,
  modules,
  initialAssets,
}: {
  courseSlug: string;
  lesson: Lesson;
  modules: Array<{ id: number; title: string }>;
  initialAssets: AssetItem[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(lesson);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Lesson>(key: K, value: Lesson[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        slug: form.slug,
        summary: form.summary,
        body: form.body,
        duration_min: form.durationMin,
        body_kind: form.bodyKind,
        video_url: form.videoUrl,
        bundle_main_filename: form.bundleMainFilename,
        bundle_aspect: form.bundleAspect,
        min_tier: form.minTier,
        is_published: form.isPublished,
        module_id: form.moduleId,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Save failed.");
      return;
    }
    setSavedAt(Date.now());
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-light-gray rounded-lg p-6 space-y-5">
        <Field label="Title">
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2 focus:outline-none focus:border-primary-green"
          />
        </Field>
        <Field label="Slug" hint="Used in /account/courses/[slug]/[lessonSlug] URLs.">
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            className="w-full font-mono text-sm border border-light-gray rounded-md px-3 py-2 focus:outline-none focus:border-primary-green"
          />
        </Field>
        <Field label="Summary">
          <textarea
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
            rows={3}
            className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2 focus:outline-none focus:border-primary-green"
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Module">
            <select
              value={form.moduleId ?? ""}
              onChange={(e) =>
                set("moduleId", e.target.value ? Number(e.target.value) : null)
              }
              className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2"
            >
              <option value="">— Unassigned —</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Duration (minutes)">
            <input
              type="number"
              value={form.durationMin ?? ""}
              onChange={(e) =>
                set(
                  "durationMin",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2"
            />
          </Field>
          <Field label="Required tier">
            <select
              value={form.minTier ?? ""}
              onChange={(e) =>
                set(
                  "minTier",
                  (e.target.value || null) as Lesson["minTier"],
                )
              }
              className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2"
            >
              <option value="">All tiers (no gate)</option>
              <option value="self-paced">Self-paced+</option>
              <option value="cohort">Cohort+</option>
              <option value="operator">Operator only</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="bg-white border border-light-gray rounded-lg p-6 space-y-5">
        <Field label="Lesson type">
          <div className="flex flex-wrap gap-2">
            {BODY_KIND_OPTIONS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => set("bodyKind", k)}
                className={[
                  "px-4 py-2 rounded-md font-sans text-sm font-semibold border transition-colors",
                  form.bodyKind === k
                    ? "bg-primary-green text-white border-primary-green"
                    : "bg-white text-charcoal border-light-gray hover:border-primary-green/40",
                ].join(" ")}
              >
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </Field>

        {form.bodyKind === "text" && (
          <Field label="Body (HTML)" hint="Rendered with prose styling on the lesson page.">
            <textarea
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              rows={12}
              className="w-full font-mono text-xs border border-light-gray rounded-md px-3 py-2 focus:outline-none focus:border-primary-green"
              placeholder="<p>Lesson body HTML goes here…</p>"
            />
          </Field>
        )}

        {form.bodyKind === "video" && (
          <Field label="Video URL" hint="YouTube, Vimeo, or direct .mp4. Auto-detected.">
            <input
              value={form.videoUrl ?? ""}
              onChange={(e) => set("videoUrl", e.target.value || null)}
              placeholder="https://vimeo.com/123456789"
              className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2"
            />
          </Field>
        )}

        {form.bodyKind === "bundle" && (
          <div className="space-y-5">
            <Field
              label="Bundle layout"
              hint="Slide = 16:9 letterbox player (decks). Page = full-width, tall scroll area (workbooks, articles, recap pages)."
            >
              <div className="flex flex-wrap gap-2">
                {(["slide", "page"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => set("bundleAspect", a)}
                    className={[
                      "px-4 py-2 rounded-md font-sans text-sm font-semibold border transition-colors",
                      form.bundleAspect === a
                        ? "bg-primary-green text-white border-primary-green"
                        : "bg-white text-charcoal border-light-gray hover:border-primary-green/40",
                    ].join(" ")}
                  >
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
            </Field>
            <p className="font-sans text-sm text-charcoal/75">
              Upload an interactive HTML bundle plus its supporting files
              (audio, images). Mark exactly one file as <strong>main_html</strong>{" "}
              — that&rsquo;s what students will load in the lesson player.
            </p>
            <BundleAssetUploader
              lessonId={lesson.id}
              initialAssets={initialAssets}
              currentMainFilename={form.bundleMainFilename}
              onMainChange={(rel) => set("bundleMainFilename", rel)}
            />
          </div>
        )}

        {form.bodyKind === "workbook" && (
          <div className="space-y-4">
            <Field
              label="Optional intro (HTML)"
              hint="Renders above the download button."
            >
              <textarea
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                rows={6}
                className="w-full font-mono text-xs border border-light-gray rounded-md px-3 py-2"
              />
            </Field>
            <p className="font-sans text-sm text-charcoal/75">
              Upload the workbook file (PDF / DOCX / XLSX) below. The first
              attachment-role file is shown as the download.
            </p>
            <BundleAssetUploader
              lessonId={lesson.id}
              initialAssets={initialAssets}
              currentMainFilename={null}
              onMainChange={() => {}}
              attachmentMode
            />
          </div>
        )}
      </div>

      {(form.bodyKind === "text" ||
        form.bodyKind === "video" ||
        form.bodyKind === "bundle") && (
        <div className="bg-white border border-light-gray rounded-lg p-6">
          <h2 className="font-display text-base font-semibold text-deep-teal mb-3">
            Downloadable resources
          </h2>
          <p className="font-sans text-xs text-charcoal/65 mb-4">
            Files marked as <strong>attachment</strong> show up at the bottom
            of the lesson page for students to download.
          </p>
          <BundleAssetUploader
            lessonId={lesson.id}
            initialAssets={initialAssets}
            currentMainFilename={form.bundleMainFilename}
            onMainChange={(rel) => set("bundleMainFilename", rel)}
            attachmentMode
          />
        </div>
      )}

      <div className="bg-white border border-light-gray rounded-lg p-6">
        <CheckboxField
          label="Published"
          hint="Required for the lesson to appear in the curriculum."
          checked={form.isPublished}
          onChange={(v) => set("isPublished", v)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/account/courses/${courseSlug}/${form.slug}`}
          target="_blank"
          className="font-sans text-xs font-semibold text-primary-green hover:text-primary-green-dark"
        >
          Preview as member →
        </Link>
        <div className="flex items-center gap-3">
          {error && <p className="font-sans text-xs text-red-600">{error}</p>}
          {savedAt && !error && (
            <p className="font-sans text-xs text-primary-green">
              Saved {new Date(savedAt).toLocaleTimeString()}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-green text-white font-sans text-sm font-semibold rounded-md px-5 py-2 hover:bg-primary-green-dark disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save lesson"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65 mb-1.5">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block font-sans text-xs text-charcoal/55 mt-1">
          {hint}
        </span>
      )}
    </label>
  );
}

function CheckboxField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1"
      />
      <div>
        <span className="font-sans text-sm font-semibold text-[#1a1a1a]">{label}</span>
        {hint && (
          <p className="font-sans text-xs text-charcoal/55 mt-0.5">{hint}</p>
        )}
      </div>
    </label>
  );
}
