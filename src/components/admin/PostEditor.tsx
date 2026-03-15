"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

const CATEGORIES = [
  "Revenue Strategy",
  "Guest Experience",
  "Hotel Technology",
  "Operations",
  "Industry Trends",
];

const categoryColors: Record<string, string> = {
  "Revenue Strategy": "bg-[#5b9a2f]/10 text-[#5b9a2f]",
  "Guest Experience": "bg-[#f5a623]/15 text-[#d4891a]",
  "Hotel Technology": "bg-[#1a1a1a]/10 text-[#1a1a1a]",
  Operations: "bg-[#5b9a2f]/10 text-[#5b9a2f]",
  "Industry Trends": "bg-[#f5a623]/15 text-[#d4891a]",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface PostData {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image_url: string;
  published: boolean;
  published_at?: string | null;
  meta_description?: string | null;
  target_keyword?: string | null;
  secondary_keywords?: string[];
  hashtags?: string[];
  tags?: string[];
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/uploads", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Upload failed");
  }

  const data = await res.json();
  return data.url;
}

function ToolbarPopover({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 bg-white border border-[#e8e4dd] rounded-lg shadow-lg p-3 z-50 min-w-[280px]"
    >
      {children}
    </div>
  );
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageTab, setImageTab] = useState<"url" | "upload">("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `px-2 py-1.5 text-sm border border-[#e8e4dd] transition-colors ${
      active
        ? "bg-[#1a1a1a] text-white"
        : "bg-white text-[#1a1a1a] hover:bg-[#f8f6f1]"
    }`;

  const inputClass =
    "w-full border border-[#e8e4dd] px-3 py-1.5 text-sm rounded focus:outline-none focus:border-[#5b9a2f] transition-colors";

  function openLinkPopover() {
    if (!editor) return;
    const existing = editor.getAttributes("link").href || "";
    setLinkUrl(existing);
    setLinkOpen(true);
    setImageOpen(false);
  }

  function submitLink() {
    if (!editor) return;
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setLinkUrl("");
    setLinkOpen(false);
  }

  function removeLink() {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setLinkUrl("");
    setLinkOpen(false);
  }

  function openImagePopover() {
    setImageUrl("");
    setImageAlt("");
    setUploadError("");
    setImageTab("upload");
    setImageOpen(true);
    setLinkOpen(false);
  }

  async function handleImageUpload(file: File) {
    if (!editor) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      setImageOpen(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function submitImage() {
    if (!editor) return;
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
    }
    setImageUrl("");
    setImageAlt("");
    setImageOpen(false);
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-[#e8e4dd] bg-[#f8f6f1]">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
      >
        I
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={btnClass(editor.isActive("heading", { level: 2 }))}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        className={btnClass(editor.isActive("heading", { level: 3 }))}
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive("bulletList"))}
      >
        List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive("orderedList"))}
      >
        1. List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive("blockquote"))}
      >
        Quote
      </button>

      {/* Link button with popover */}
      <div className="relative">
        <button
          type="button"
          onClick={openLinkPopover}
          className={btnClass(editor.isActive("link"))}
        >
          Link
        </button>
        <ToolbarPopover open={linkOpen} onClose={() => setLinkOpen(false)}>
          <label className="block text-xs font-medium text-[#1a1a1a]/60 mb-1">
            URL
          </label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); submitLink(); }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            className={inputClass}
            placeholder="https://example.com"
            autoFocus
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={submitLink}
              className="bg-[#5b9a2f] text-white px-3 py-1 text-xs font-medium rounded hover:bg-[#4a7d25] transition-colors"
            >
              {editor.isActive("link") ? "Update" : "Add Link"}
            </button>
            {editor.isActive("link") && (
              <button
                type="button"
                onClick={removeLink}
                className="text-red-500 text-xs font-medium hover:underline"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => setLinkOpen(false)}
              className="text-[#1a1a1a]/40 text-xs ml-auto hover:text-[#1a1a1a]/70"
            >
              Cancel
            </button>
          </div>
        </ToolbarPopover>
      </div>

      {/* Image button with popover */}
      <div className="relative">
        <button
          type="button"
          onClick={openImagePopover}
          className={btnClass(false)}
        >
          Image
        </button>
        <ToolbarPopover open={imageOpen} onClose={() => setImageOpen(false)}>
          {/* Upload / URL tabs */}
          <div className="flex gap-1 mb-3 border-b border-[#e8e4dd] -mx-3 -mt-3 px-3">
            <button
              type="button"
              onClick={() => setImageTab("upload")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${imageTab === "upload" ? "text-[#1a1a1a] border-b-2 border-[#5b9a2f]" : "text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70"}`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setImageTab("url")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${imageTab === "url" ? "text-[#1a1a1a] border-b-2 border-[#5b9a2f]" : "text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70"}`}
            >
              URL
            </button>
          </div>

          {uploadError && (
            <p className="text-xs text-red-500 mb-2">{uploadError}</p>
          )}

          {imageTab === "upload" ? (
            <div>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#e8e4dd] rounded-lg p-4 cursor-pointer hover:border-[#5b9a2f] transition-colors">
                <svg className="w-6 h-6 text-[#1a1a1a]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-[#1a1a1a]/50">
                  {uploading ? "Uploading..." : "Click to select an image"}
                </span>
                <span className="text-[10px] text-[#1a1a1a]/30">Max 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-[#1a1a1a]/60 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setImageOpen(false);
                }}
                className={inputClass}
                placeholder="https://example.com/image.jpg"
                autoFocus
              />
              <label className="block text-xs font-medium text-[#1a1a1a]/60 mb-1 mt-2">
                Alt Text
              </label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); submitImage(); }
                  if (e.key === "Escape") setImageOpen(false);
                }}
                className={inputClass}
                placeholder="Describe the image..."
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={submitImage}
                  className="bg-[#5b9a2f] text-white px-3 py-1 text-xs font-medium rounded hover:bg-[#4a7d25] transition-colors"
                >
                  Insert Image
                </button>
                <button
                  type="button"
                  onClick={() => setImageOpen(false)}
                  className="text-[#1a1a1a]/40 text-xs ml-auto hover:text-[#1a1a1a]/70"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </ToolbarPopover>
      </div>
    </div>
  );
}

function TagInput({
  label,
  placeholder,
  values,
  onChange,
  autoPrefix,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (v: string[]) => void;
  autoPrefix?: string;
}) {
  const [input, setInput] = useState("");

  function addItems(raw: string) {
    const items = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (autoPrefix && !s.startsWith(autoPrefix) ? autoPrefix + s : s));
    const unique = [...new Set([...values, ...items])];
    if (unique.length !== values.length) onChange(unique);
    setInput("");
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
        {label}
      </label>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-[#f8f6f1] border border-[#e8e4dd] text-[#1a1a1a] text-xs px-2.5 py-1 rounded-full"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== item))}
                className="text-[#1a1a1a]/40 hover:text-red-500 transition-colors ml-0.5"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === ",") && input.trim()) {
            e.preventDefault();
            addItems(input);
          }
        }}
        onBlur={() => {
          if (input.trim()) addItems(input);
        }}
        className="w-full border border-[#e8e4dd] px-4 py-2.5 text-sm focus:outline-none focus:border-[#5b9a2f] transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}

function toLocalDatetime(isoStr: string): string {
  const d = new Date(isoStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function Preview({
  title,
  category,
  excerpt,
  featuredImageUrl,
  content,
  publishedAt,
}: {
  title: string;
  category: string;
  excerpt: string;
  featuredImageUrl: string;
  content: string;
  publishedAt: string;
}) {
  const displayDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="border border-[#e8e4dd] rounded-lg overflow-hidden bg-white">
      {/* Hero */}
      <div className="bg-[#1a1a1a] pt-10 pb-8 px-6">
        <div className="max-w-xl mx-auto text-center">
          {category && (
            <span
              className={`inline-block font-sans text-xs font-semibold px-3 py-1 mb-4 ${
                categoryColors[category] || "bg-white/10 text-white/80"
              }`}
            >
              {category}
            </span>
          )}
          <h1 className="font-display text-xl md:text-2xl font-semibold text-white leading-tight mb-3">
            {title || "Untitled Post"}
          </h1>
          <p className="font-sans text-xs text-white/40">{displayDate}</p>
        </div>
      </div>

      {/* Featured Image */}
      {featuredImageUrl && (
        <div className="relative h-40 md:h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={featuredImageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Excerpt */}
      {excerpt && (
        <div className="px-6 pt-6">
          <p className="text-sm text-[#1a1a1a]/50 italic border-l-2 border-[#5b9a2f] pl-4">
            {excerpt}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="py-6 px-6">
        <div
          className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-[#1a1a1a] prose-p:text-[#1a1a1a]/70 prose-a:text-[#5b9a2f] prose-blockquote:border-[#5b9a2f]"
          dangerouslySetInnerHTML={{ __html: content || "<p class='text-[#1a1a1a]/30'>Start writing to see a preview...</p>" }}
        />
      </div>
    </div>
  );
}

export default function PostEditor({ post }: { post?: PostData }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [category, setCategory] = useState(post?.category || CATEGORIES[0]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    post?.featured_image_url || ""
  );
  const [published, setPublished] = useState(post?.published || false);
  const [publishedAt, setPublishedAt] = useState(
    post?.published_at ? toLocalDatetime(post.published_at) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [editorContent, setEditorContent] = useState(post?.content || "");
  const [seoOpen, setSeoOpen] = useState(false);
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || "");
  const [targetKeyword, setTargetKeyword] = useState(post?.target_keyword || "");
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>(post?.secondary_keywords || []);
  const [hashtags, setHashtags] = useState<string[]>(post?.hashtags || []);
  const [tags, setTags] = useState<string[]>(post?.tags || []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: post?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
    },
  });

  const updateSlugFromTitle = useCallback(
    (newTitle: string) => {
      if (!slugManuallyEdited) {
        setSlug(slugify(newTitle));
      }
    },
    [slugManuallyEdited]
  );

  useEffect(() => {
    updateSlugFromTitle(title);
  }, [title, updateSlugFromTitle]);

  async function handleSubmit() {
    setError("");
    setSaving(true);

    const content = editor?.getHTML() || "";
    const body = {
      title,
      slug,
      excerpt,
      content,
      category,
      featured_image_url: featuredImageUrl,
      published,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
      meta_description: metaDescription || null,
      target_keyword: targetKeyword || null,
      secondary_keywords: secondaryKeywords,
      hashtags,
      tags,
    };

    try {
      const url = post?.id
        ? `/api/admin/posts/${post.id}`
        : "/api/admin/posts";
      const method = post?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save post");
        return;
      }

      router.push("/admin/posts");
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "text-[#1a1a1a] border-b-2 border-[#5b9a2f]"
        : "text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70"
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-[#1a1a1a]">
          {post?.id ? "Edit Post" : "New Post"}
        </h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[#1a1a1a]">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="accent-[#5b9a2f]"
            />
            Published
          </label>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#5b9a2f] text-white px-5 py-2 text-sm font-semibold hover:bg-[#4a7d25] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Edit / Preview tabs */}
      <div className="flex border-b border-[#e8e4dd] mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={tabClass(activeTab === "edit")}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={tabClass(activeTab === "preview")}
        >
          Preview
        </button>
      </div>

      {activeTab === "preview" ? (
        <Preview
          title={title}
          category={category}
          excerpt={excerpt}
          featuredImageUrl={featuredImageUrl}
          content={editorContent}
          publishedAt={publishedAt}
        />
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#e8e4dd] px-4 py-2.5 text-sm focus:outline-none focus:border-[#5b9a2f] transition-colors"
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              className="w-full border border-[#e8e4dd] px-4 py-2.5 text-sm text-[#1a1a1a]/60 focus:outline-none focus:border-[#5b9a2f] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[#e8e4dd] px-4 py-2.5 text-sm focus:outline-none focus:border-[#5b9a2f] transition-colors bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
                Featured Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  className="flex-1 border border-[#e8e4dd] px-4 py-2.5 text-sm focus:outline-none focus:border-[#5b9a2f] transition-colors"
                  placeholder="https://... or upload"
                />
                <label className="flex items-center gap-1.5 px-3 py-2 border border-[#e8e4dd] text-sm text-[#1a1a1a]/70 hover:border-[#5b9a2f] hover:text-[#5b9a2f] transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setError("");
                        const url = await uploadImage(file);
                        setFeaturedImageUrl(url);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Upload failed");
                      }
                    }}
                  />
                </label>
              </div>
              {featuredImageUrl && (
                <div className="mt-2 relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImageUrl}
                    alt="Featured preview"
                    className="h-20 rounded border border-[#e8e4dd] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImageUrl("")}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Publish date — only shown when published is checked */}
          {published && (
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
                Publish Date
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full md:w-auto border border-[#e8e4dd] px-4 py-2.5 text-sm focus:outline-none focus:border-[#5b9a2f] transition-colors bg-white"
              />
              <p className="text-xs text-[#1a1a1a]/40 mt-1">
                {publishedAt
                  ? new Date(publishedAt) > new Date()
                    ? `Scheduled — will go live on ${new Date(publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at ${new Date(publishedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                    : "Published"
                  : "Leave empty to publish immediately"}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full border border-[#e8e4dd] px-4 py-2.5 text-sm focus:outline-none focus:border-[#5b9a2f] transition-colors resize-y"
              placeholder="Short description for the blog grid..."
            />
          </div>

          {/* SEO & Social — collapsible */}
          <div className="border border-[#e8e4dd] rounded">
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#1a1a1a] hover:bg-[#f8f6f1] transition-colors"
            >
              <span>SEO &amp; Social</span>
              <svg
                className={`w-4 h-4 text-[#1a1a1a]/40 transition-transform ${seoOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {seoOpen && (
              <div className="border-t border-[#e8e4dd] px-4 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-[#e8e4dd] px-4 py-2.5 text-sm focus:outline-none focus:border-[#5b9a2f] transition-colors resize-y"
                    placeholder="Custom meta description for search engines. Leave blank to use excerpt."
                  />
                  <p className={`text-xs mt-1 ${metaDescription.length > 160 ? "text-red-500" : metaDescription.length > 140 ? "text-[#f5a623]" : "text-[#1a1a1a]/40"}`}>
                    {metaDescription.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
                    Target Keyword
                  </label>
                  <input
                    type="text"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    className="w-full border border-[#e8e4dd] px-4 py-2.5 text-sm focus:outline-none focus:border-[#5b9a2f] transition-colors"
                    placeholder="Primary keyword to target"
                  />
                </div>

                <TagInput
                  label="Secondary Keywords"
                  placeholder="Type a keyword and press Enter or comma to add"
                  values={secondaryKeywords}
                  onChange={setSecondaryKeywords}
                />

                <TagInput
                  label="Tags"
                  placeholder="Type a tag and press Enter or comma to add"
                  values={tags}
                  onChange={setTags}
                />

                <TagInput
                  label="Hashtags"
                  placeholder="Type a hashtag and press Enter or comma to add"
                  values={hashtags}
                  onChange={setHashtags}
                  autoPrefix="#"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1">
              Content
            </label>
            <div className="border border-[#e8e4dd] bg-white">
              <Toolbar editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
