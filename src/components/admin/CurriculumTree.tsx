"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
} from "lucide-react";

interface ModuleItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  phaseLabel: string;
  position: number;
  isPublished: boolean;
}

interface LessonItem {
  id: number;
  moduleId: number | null;
  slug: string;
  title: string;
  summary: string;
  position: number;
  bodyKind: "text" | "bundle" | "video" | "workbook";
  isPublished: boolean;
  minTier: "self-paced" | "cohort" | "operator" | null;
  durationMin: number | null;
}

const BODY_KIND_LABEL: Record<string, string> = {
  text: "Text",
  bundle: "Bundle",
  video: "Video",
  workbook: "Workbook",
};

export default function CurriculumTree({
  courseId,
  initialModules,
  initialLessons,
}: {
  courseId: number;
  initialModules: ModuleItem[];
  initialLessons: LessonItem[];
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [creatingModule, setCreatingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModulePhase, setNewModulePhase] = useState("");
  const [creatingLessonForModule, setCreatingLessonForModule] = useState<number | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [busy, setBusy] = useState(false);

  function toggle(id: number) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function createModule() {
    if (!newModuleTitle.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newModuleTitle,
        phase_label: newModulePhase,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setCreatingModule(false);
      setNewModuleTitle("");
      setNewModulePhase("");
      router.refresh();
    }
  }

  async function reorderModule(id: number, direction: "up" | "down") {
    setBusy(true);
    await fetch(`/api/admin/modules/${id}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    setBusy(false);
    router.refresh();
  }

  async function deleteModule(id: number) {
    if (!confirm("Delete this module? Its lessons will become unassigned.")) return;
    setBusy(true);
    await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  async function createLesson(moduleId: number) {
    if (!newLessonTitle.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/admin/courses/${courseId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newLessonTitle,
        module_id: moduleId,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/courses/${courseId}/lessons/${data.id}`);
    }
  }

  async function reorderLesson(id: number, direction: "up" | "down") {
    setBusy(true);
    await fetch(`/api/admin/lessons/${id}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    setBusy(false);
    router.refresh();
  }

  async function deleteLesson(id: number) {
    if (!confirm("Delete this lesson? Its assets will be removed too.")) return;
    setBusy(true);
    await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  // Group lessons by module.
  const lessonsByModule = new Map<number | "unassigned", LessonItem[]>();
  for (const l of initialLessons) {
    const key: number | "unassigned" = l.moduleId ?? "unassigned";
    const list = lessonsByModule.get(key) ?? [];
    list.push(l);
    lessonsByModule.set(key, list);
  }
  const orphans = lessonsByModule.get("unassigned") ?? [];

  return (
    <div className="space-y-4">
      {initialModules.length === 0 && orphans.length === 0 && (
        <div className="bg-white border border-dashed border-light-gray rounded-lg p-8 text-center">
          <p className="font-sans text-sm text-charcoal/65 mb-3">
            No modules yet. Add one to start building the curriculum.
          </p>
        </div>
      )}

      {initialModules.map((m, idx) => {
        const isExpanded = expanded.has(m.id);
        const lessons = lessonsByModule.get(m.id) ?? [];
        return (
          <div key={m.id} className="bg-white border border-light-gray rounded-lg">
            <div className="flex items-start gap-3 p-4">
              <button
                onClick={() => toggle(m.id)}
                className="text-charcoal/55 hover:text-charcoal mt-0.5"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                {m.phaseLabel && (
                  <p className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-charcoal/50 mb-0.5">
                    {m.phaseLabel}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-base font-semibold text-deep-teal">
                    {m.title}
                  </h3>
                  {!m.isPublished && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-charcoal/10 text-charcoal/60 px-2 py-0.5 rounded">
                      Draft
                    </span>
                  )}
                </div>
                {m.summary && (
                  <p className="font-sans text-xs text-charcoal/65 mt-1 max-w-2xl">
                    {m.summary}
                  </p>
                )}
                <p className="font-sans text-xs text-charcoal/55 mt-1">
                  {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => reorderModule(m.id, "up")}
                  disabled={idx === 0 || busy}
                  className="p-1.5 text-charcoal/55 hover:text-charcoal disabled:opacity-30"
                  title="Move up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => reorderModule(m.id, "down")}
                  disabled={idx === initialModules.length - 1 || busy}
                  className="p-1.5 text-charcoal/55 hover:text-charcoal disabled:opacity-30"
                  title="Move down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteModule(m.id)}
                  disabled={busy}
                  className="p-1.5 text-charcoal/55 hover:text-red-600"
                  title="Delete module"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-light-gray bg-cream/30 p-4">
                {lessons.length === 0 ? (
                  <p className="font-sans text-xs text-charcoal/55 italic mb-3">
                    No lessons yet.
                  </p>
                ) : (
                  <ol className="space-y-2 mb-3">
                    {lessons.map((l, lIdx) => (
                      <li
                        key={l.id}
                        className="flex items-center gap-3 bg-white border border-light-gray rounded-md p-3"
                      >
                        <span className="font-mono text-xs text-charcoal/55 w-6 text-right">
                          {String(lIdx + 1).padStart(2, "0")}
                        </span>
                        <Link
                          href={`/admin/courses/${courseId}/lessons/${l.id}`}
                          className="flex-1 min-w-0"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-sm font-semibold text-deep-teal hover:text-primary-green">
                              {l.title}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-charcoal/10 text-charcoal/65 px-1.5 py-0.5 rounded">
                              {BODY_KIND_LABEL[l.bodyKind]}
                            </span>
                            {!l.isPublished && (
                              <span className="text-[10px] font-semibold uppercase tracking-wider bg-charcoal/10 text-charcoal/65 px-1.5 py-0.5 rounded">
                                Draft
                              </span>
                            )}
                            {l.minTier && (
                              <span className="text-[10px] font-semibold uppercase tracking-wider bg-warm-gold/15 text-warm-gold-dark px-1.5 py-0.5 rounded">
                                {l.minTier}+
                              </span>
                            )}
                          </div>
                          {l.summary && (
                            <p className="font-sans text-xs text-charcoal/55 mt-0.5 line-clamp-1">
                              {l.summary}
                            </p>
                          )}
                        </Link>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => reorderLesson(l.id, "up")}
                            disabled={lIdx === 0 || busy}
                            className="p-1 text-charcoal/55 hover:text-charcoal disabled:opacity-30"
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => reorderLesson(l.id, "down")}
                            disabled={lIdx === lessons.length - 1 || busy}
                            className="p-1 text-charcoal/55 hover:text-charcoal disabled:opacity-30"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteLesson(l.id)}
                            disabled={busy}
                            className="p-1 text-charcoal/55 hover:text-red-600"
                            title="Delete lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}

                {creatingLessonForModule === m.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="New lesson title"
                      className="flex-1 font-sans text-sm border border-light-gray rounded-md px-3 py-1.5"
                      autoFocus
                    />
                    <button
                      onClick={() => createLesson(m.id)}
                      disabled={busy || !newLessonTitle.trim()}
                      className="bg-primary-green text-white font-sans text-xs font-semibold rounded-md px-3 py-1.5 hover:bg-primary-green-dark disabled:opacity-50"
                    >
                      Add lesson
                    </button>
                    <button
                      onClick={() => {
                        setCreatingLessonForModule(null);
                        setNewLessonTitle("");
                      }}
                      className="font-sans text-xs text-charcoal/65 hover:text-charcoal"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setCreatingLessonForModule(m.id);
                      setNewLessonTitle("");
                    }}
                    className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-primary-green hover:text-primary-green-dark"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add lesson
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {orphans.length > 0 && (
        <div className="bg-white border border-light-gray rounded-lg p-4">
          <p className="font-display text-sm font-semibold text-charcoal/70 mb-3">
            Unassigned lessons
          </p>
          <ol className="space-y-2">
            {orphans.map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-3 bg-cream/40 border border-light-gray rounded-md p-3"
              >
                <Link
                  href={`/admin/courses/${courseId}/lessons/${l.id}`}
                  className="flex-1 font-display text-sm font-semibold text-deep-teal hover:text-primary-green"
                >
                  {l.title}
                </Link>
                <button
                  onClick={() => deleteLesson(l.id)}
                  className="p-1 text-charcoal/55 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {creatingModule ? (
        <div className="bg-white border border-light-gray rounded-lg p-4 space-y-3">
          <input
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="Module title (e.g. The MTR + Co-Living Opportunity)"
            className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2"
            autoFocus
          />
          <input
            value={newModulePhase}
            onChange={(e) => setNewModulePhase(e.target.value)}
            placeholder="Phase label, optional (e.g. Phase 1: Foundation)"
            className="w-full font-sans text-sm border border-light-gray rounded-md px-3 py-2"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={createModule}
              disabled={busy || !newModuleTitle.trim()}
              className="bg-primary-green text-white font-sans text-sm font-semibold rounded-md px-4 py-2 hover:bg-primary-green-dark disabled:opacity-50"
            >
              Create module
            </button>
            <button
              onClick={() => {
                setCreatingModule(false);
                setNewModuleTitle("");
                setNewModulePhase("");
              }}
              className="font-sans text-sm text-charcoal/65 hover:text-charcoal"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreatingModule(true)}
          className="inline-flex items-center gap-1.5 bg-[#1a1a1a] text-white font-sans text-sm font-semibold rounded-md px-4 py-2 hover:bg-charcoal/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add module
        </button>
      )}
    </div>
  );
}
