"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Course {
  id: number;
  slug: string;
  title: string;
  summary: string;
  heroImageUrl: string;
  thumbnailUrl: string;
  categorySlug: string | null;
  displayPosition: number;
  isPublished: boolean;
  isPlaceholder: boolean;
  isPurchasable: boolean;
}

const CATEGORY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "— None —" },
  { value: "str", label: "Short-Term Rentals" },
  { value: "mtr-ltr", label: "Mid- & Long-Term Rentals" },
  { value: "co-living", label: "Co-Living" },
  { value: "auto-turo", label: "Auto / Turo" },
  { value: "hotels", label: "Hotels" },
];

export default function CourseEditor({ course }: { course: Course }) {
  const router = useRouter();
  const [form, setForm] = useState(course);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  function set<K extends keyof Course>(key: K, value: Course[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        slug: form.slug,
        summary: form.summary,
        hero_image_url: form.heroImageUrl,
        thumbnail_url: form.thumbnailUrl,
        category_slug: form.categorySlug || null,
        display_position: form.displayPosition,
        is_published: form.isPublished,
        is_placeholder: form.isPlaceholder,
        is_purchasable: form.isPurchasable,
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

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/courses");
      router.refresh();
    } else {
      setError("Delete failed.");
    }
  }

  async function uploadImage(field: "heroImageUrl" | "thumbnailUrl", file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Upload failed.");
      return;
    }
    set(field, data.url);
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
        <Field label="Slug" hint="URL-safe identifier. Changing this breaks existing course links.">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Category">
            <select
              value={form.categorySlug ?? ""}
              onChange={(e) => set("categorySlug", e.target.value || null)}
              className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2 focus:outline-none focus:border-primary-green"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Display position" hint="Lower numbers appear first in the catalog.">
            <input
              type="number"
              value={form.displayPosition}
              onChange={(e) => set("displayPosition", Number(e.target.value))}
              className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2 focus:outline-none focus:border-primary-green"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ImageField
            label="Thumbnail (16:9 catalog card)"
            url={form.thumbnailUrl}
            onPick={(file) => uploadImage("thumbnailUrl", file)}
            onClear={() => set("thumbnailUrl", "")}
          />
          <ImageField
            label="Hero image (course detail)"
            url={form.heroImageUrl}
            onPick={(file) => uploadImage("heroImageUrl", file)}
            onClear={() => set("heroImageUrl", "")}
          />
        </div>
      </div>

      <div className="bg-white border border-light-gray rounded-lg p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-deep-teal">
          Visibility
        </h2>
        <CheckboxField
          label="Published"
          hint="Required for the course to appear in the catalog."
          checked={form.isPublished}
          onChange={(v) => set("isPublished", v)}
        />
        <CheckboxField
          label="For sale (purchasable)"
          hint="Show Buy buttons. Off = catalog shows the course but no checkout."
          checked={form.isPurchasable}
          onChange={(v) => set("isPurchasable", v)}
        />
        <CheckboxField
          label="Coming soon (placeholder)"
          hint="Treats this as a not-yet-launched course; catalog shows a 'Coming soon' badge."
          checked={form.isPlaceholder}
          onChange={(v) => set("isPlaceholder", v)}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleDelete}
          className="font-sans text-xs font-semibold text-red-600 hover:text-red-800"
        >
          {deleteConfirm ? "Click again to confirm delete" : "Delete course"}
        </button>
        <div className="flex items-center gap-3">
          {error && (
            <p className="font-sans text-xs text-red-600">{error}</p>
          )}
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
            {saving ? "Saving…" : "Save changes"}
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
        <span className="block font-sans text-xs text-charcoal/55 mt-1">{hint}</span>
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
        <span className="font-sans text-sm font-semibold text-[#1a1a1a]">
          {label}
        </span>
        {hint && (
          <p className="font-sans text-xs text-charcoal/55 mt-0.5">{hint}</p>
        )}
      </div>
    </label>
  );
}

function ImageField({
  label,
  url,
  onPick,
  onClear,
}: {
  label: string;
  url: string;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <span className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal/65 mb-1.5">
        {label}
      </span>
      {url ? (
        <div className="relative bg-cream rounded-md border border-light-gray overflow-hidden mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="w-full aspect-[16/9] object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 bg-near-black/80 text-white font-sans text-xs font-semibold px-2 py-1 rounded hover:bg-near-black"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="bg-cream/50 border border-dashed border-light-gray rounded-md aspect-[16/9] mb-2 flex items-center justify-center">
          <span className="font-sans text-xs text-charcoal/55">No image</span>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
        className="block w-full font-sans text-xs"
      />
    </div>
  );
}
