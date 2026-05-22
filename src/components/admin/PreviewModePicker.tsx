import { setPreviewMode } from "@/lib/actions/preview";
import type { PreviewMode } from "@/lib/preview-cookie";

// Four-option "view as" switcher used in both AdminShell (top bar) and
// MemberShell (so admin can hop between tiers without bouncing through
// /admin first). Each button is a server-action form with a hidden `target`
// input — no client JS, no useState. The active option gets a filled style;
// the rest stay outlined.

interface Option {
  target: NonNullable<PreviewMode> | "exit";
  label: string;
  shortLabel: string;
}

const OPTIONS: Option[] = [
  { target: "self-paced", label: "Tier 1 · Self-paced", shortLabel: "Tier 1" },
  { target: "cohort", label: "Tier 2 · Cohort", shortLabel: "Tier 2" },
  { target: "operator", label: "Tier 3 · Operator", shortLabel: "Tier 3" },
];

export default function PreviewModePicker({
  active,
  // When rendered inside AdminShell, "exit" is meaningless (admin is already
  // in admin shell). Inside MemberShell, the picker also needs a "return to
  // admin" button so the admin can leave preview entirely.
  showExit = false,
}: {
  active: PreviewMode;
  showExit?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {OPTIONS.map((opt) => {
        const isActive = active === opt.target;
        return (
          <form key={opt.target} action={setPreviewMode}>
            <input type="hidden" name="target" value={opt.target} />
            <button
              type="submit"
              aria-pressed={isActive}
              className={[
                "inline-flex items-center px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded transition-colors",
                isActive
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-transparent text-[#1a1a1a] border border-[#1a1a1a]/15 hover:bg-[#1a1a1a]/5",
              ].join(" ")}
            >
              <span className="hidden md:inline">{opt.label}</span>
              <span className="md:hidden">{opt.shortLabel}</span>
            </button>
          </form>
        );
      })}
      {showExit && (
        <form action={setPreviewMode}>
          <input type="hidden" name="target" value="exit" />
          <button
            type="submit"
            className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#1a1a1a] border border-[#1a1a1a]/15 rounded hover:bg-[#1a1a1a] hover:text-white transition-colors ml-1"
          >
            ← Back to admin
          </button>
        </form>
      )}
    </div>
  );
}
