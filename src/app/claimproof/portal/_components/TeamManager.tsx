"use client";

import { useState } from "react";
import { IconCheck, IconLock } from "./Icons";

interface Member {
  userId: number;
  email: string;
  name: string;
  role: "owner" | "member";
  suspended: boolean;
}

type Msg = { kind: "ok" | "err"; text: string };

/**
 * Fleet owner's admin console: seat meter, invite form, and a roster where the
 * owner can edit each teammate's name and login email, suspend/reactivate their
 * account, send them a password-reset email, or remove them. Talks to
 * /api/claimproof/team. The owner's own row is display-only (the server also
 * guards this) so an owner can't lock themselves out.
 */
export default function TeamManager({
  initialMembers,
  seatLimit,
  initialSeatsUsed,
  initialPending,
}: {
  initialMembers: Member[];
  seatLimit: number;
  initialSeatsUsed: number;
  initialPending: number;
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [seatsUsed, setSeatsUsed] = useState(initialSeatsUsed);
  const [pending, setPending] = useState(initialPending);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const taken = seatsUsed + pending;
  const seatsLeft = Math.max(0, seatLimit - taken);

  async function invite() {
    if (!email.trim() || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/claimproof/team", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) {
        setMsg({ kind: "err", text: json.error || "Could not send the invite." });
      } else {
        setMsg({ kind: "ok", text: `Invite sent to ${email.trim()}.` });
        setEmail("");
        setPending((p) => p + 1);
      }
    } catch {
      setMsg({ kind: "err", text: "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  }

  async function patchMember(
    userId: number,
    action: "name" | "email" | "suspend" | "reactivate" | "reset",
    value?: string,
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const r = await fetch("/api/claimproof/team", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) {
        return { ok: false, error: json.error || "Could not save the change." };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error. Try again." };
    }
  }

  // Row actions return a message the row renders next to itself, so feedback
  // lands where the owner clicked (not up in the invite card). null = nothing
  // to say (no-op change or the row is about to unmount).
  async function saveField(
    userId: number,
    field: "name" | "email",
    value: string,
  ): Promise<Msg | null> {
    const current = members.find((m) => m.userId === userId);
    if (!current || value.trim() === current[field]) return null;
    const res = await patchMember(userId, field, value.trim());
    if (res.ok) {
      setMembers((m) =>
        m.map((x) => (x.userId === userId ? { ...x, [field]: value.trim() } : x)),
      );
      return { kind: "ok", text: `${field === "name" ? "Name" : "Email"} updated.` };
    }
    return { kind: "err", text: res.error || "Could not save the change." };
  }

  async function toggleSuspend(m: Member): Promise<Msg | null> {
    const action = m.suspended ? "reactivate" : "suspend";
    if (
      action === "suspend" &&
      !confirm(`Suspend ${m.name}? They're signed out and lose access until you reactivate them.`)
    )
      return null;
    const res = await patchMember(m.userId, action);
    if (res.ok) {
      setMembers((list) =>
        list.map((x) => (x.userId === m.userId ? { ...x, suspended: !x.suspended } : x)),
      );
      return {
        kind: "ok",
        text: m.suspended ? `${m.name} reactivated.` : `${m.name} suspended.`,
      };
    }
    return { kind: "err", text: res.error || "Could not update this teammate." };
  }

  async function sendReset(m: Member): Promise<Msg | null> {
    if (!confirm(`Send a password-reset email to ${m.email}?`)) return null;
    const res = await patchMember(m.userId, "reset");
    if (res.ok) return { kind: "ok", text: `Reset email sent to ${m.email}.` };
    return { kind: "err", text: res.error || "Could not send the reset email." };
  }

  async function remove(userId: number, name: string): Promise<Msg | null> {
    if (!confirm(`Remove ${name} from the team? They lose access to shared claims.`))
      return null;
    try {
      const r = await fetch(`/api/claimproof/team?userId=${userId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (r.ok) {
        // Success: the row unmounts, which is the confirmation. Free the seat.
        setMembers((m) => m.filter((x) => x.userId !== userId));
        setSeatsUsed((s) => Math.max(0, s - 1));
        return null;
      }
      const json = await r.json().catch(() => ({}));
      return { kind: "err", text: json.error || "Could not remove this teammate." };
    } catch {
      return { kind: "err", text: "Network error. Try again." };
    }
  }

  return (
    <div className="space-y-6">
      {/* seat meter */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
        <div>
          <p className="font-sans text-[11px] uppercase tracking-wider text-white/45">
            Seats used
          </p>
          <p className="font-display text-xl font-semibold text-white tabular-nums">
            {taken} / {seatLimit}
          </p>
        </div>
        <div>
          <p className="font-sans text-[11px] uppercase tracking-wider text-white/45">
            Pending invites
          </p>
          <p className="font-display text-xl font-semibold text-[#8BA5BE] tabular-nums">
            {pending}
          </p>
        </div>
        <div className="ml-auto flex-1 basis-full sm:basis-auto">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#E19C63] to-[#EBB183]"
              style={{ width: `${seatLimit ? (taken / seatLimit) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* invite */}
      <div className="rounded-2xl border border-[#E19C63]/25 bg-[#E19C63]/[0.05] p-5">
        <h2 className="mb-3 font-sans font-bold text-white">Invite a teammate</h2>
        {seatsLeft === 0 ? (
          <p className="flex items-center gap-2 font-sans text-sm text-white/60">
            <IconLock className="h-4 w-4 text-white/40" />
            All seats are filled or pending. Remove a member to free one up.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && invite()}
              placeholder="teammate@email.com"
              className="min-w-0 flex-1 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 font-sans text-sm text-white outline-none placeholder:text-white/30 focus:border-[#E19C63]"
            />
            <button
              onClick={invite}
              disabled={!email.trim() || busy}
              className="rounded-full bg-[#E19C63] px-5 py-2 font-sans text-sm font-semibold text-[#27262E] transition-colors hover:bg-[#EBB183] disabled:opacity-40"
            >
              {busy ? "Sending…" : "Send invite"}
            </button>
            <span className="font-sans text-xs text-white/40">
              {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left
            </span>
          </div>
        )}
        {msg && (
          <p
            className={
              "mt-3 flex items-center gap-2 font-sans text-sm " +
              (msg.kind === "ok" ? "text-[#8BA5BE]" : "text-[#E19C63]")
            }
          >
            {msg.kind === "ok" && <IconCheck className="h-4 w-4" />}
            {msg.text}
          </p>
        )}
      </div>

      {/* roster */}
      <div>
        <h2 className="mb-3 font-sans font-bold text-white">Team roster</h2>
        <ul className="space-y-2">
          {members.map((m) =>
            m.role === "owner" ? (
              <li
                key={m.userId}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans text-sm font-semibold text-white">
                    {m.name}
                    <span className="ml-2 rounded-full bg-[#E19C63]/15 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-[#E19C63]">
                      Owner
                    </span>
                    <span className="ml-2 font-sans text-[11px] font-normal text-white/40">
                      (you)
                    </span>
                  </p>
                  <p className="truncate font-sans text-xs text-white/45">{m.email}</p>
                </div>
              </li>
            ) : (
              <MemberRow
                key={m.userId}
                member={m}
                onSaveField={saveField}
                onToggleSuspend={toggleSuspend}
                onSendReset={sendReset}
                onRemove={remove}
              />
            ),
          )}
          {members.filter((m) => m.role === "member").length === 0 && (
            <li className="rounded-xl border border-dashed border-white/12 px-4 py-6 text-center font-sans text-sm text-white/40">
              No teammates yet. Invite one above to share this workspace&rsquo;s claims.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function MemberRow({
  member: m,
  onSaveField,
  onToggleSuspend,
  onSendReset,
  onRemove,
}: {
  member: Member;
  onSaveField: (userId: number, field: "name" | "email", value: string) => Promise<Msg | null>;
  onToggleSuspend: (m: Member) => Promise<Msg | null>;
  onSendReset: (m: Member) => Promise<Msg | null>;
  onRemove: (userId: number, name: string) => Promise<Msg | null>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(m.name);
  const [email, setEmail] = useState(m.email);
  const [rowMsg, setRowMsg] = useState<Msg | null>(null);

  const field =
    "w-full rounded-md border border-white/12 bg-white/[0.04] px-2.5 py-1.5 font-sans text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#E19C63]";

  return (
    <li
      className={
        "rounded-xl border px-4 py-3 " +
        (m.suspended
          ? "border-[#E19C63]/25 bg-[#E19C63]/[0.04]"
          : "border-white/10 bg-white/[0.02]")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-sans text-[11px] text-white/45">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={async () => setRowMsg(await onSaveField(m.userId, "name", name))}
                  className={field}
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-sans text-[11px] text-white/45">Login email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={async () => setRowMsg(await onSaveField(m.userId, "email", email))}
                  className={field}
                />
              </label>
            </div>
          ) : (
            <>
              <p className="truncate font-sans text-sm font-semibold text-white">
                {m.name}
                {m.suspended && (
                  <span className="ml-2 rounded-full bg-[#E19C63]/15 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-[#E19C63]">
                    Suspended
                  </span>
                )}
              </p>
              <p className="truncate font-sans text-xs text-white/45">{m.email}</p>
            </>
          )}
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="flex-none rounded-full border border-white/15 px-3 py-1 font-sans text-[11px] font-semibold text-white/60 transition-colors hover:border-[#8BA5BE] hover:text-[#8BA5BE]"
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-white/8 pt-2.5">
        <button
          onClick={async () => setRowMsg(await onToggleSuspend(m))}
          className="font-sans text-xs text-white/50 underline underline-offset-4 transition-colors hover:text-[#E19C63]"
        >
          {m.suspended ? "Reactivate" : "Suspend"}
        </button>
        <button
          onClick={async () => setRowMsg(await onSendReset(m))}
          className="font-sans text-xs text-white/50 underline underline-offset-4 transition-colors hover:text-[#8BA5BE]"
        >
          Send password reset
        </button>
        <button
          onClick={async () => setRowMsg(await onRemove(m.userId, m.name))}
          className="ml-auto font-sans text-xs text-white/40 underline underline-offset-4 transition-colors hover:text-[#E19C63]"
        >
          Remove
        </button>
      </div>

      {rowMsg && (
        <p
          className={
            "mt-2 flex items-center gap-1.5 font-sans text-xs " +
            (rowMsg.kind === "ok" ? "text-[#8BA5BE]" : "text-[#E19C63]")
          }
        >
          {rowMsg.kind === "ok" && <IconCheck className="h-3.5 w-3.5" />}
          {rowMsg.text}
        </p>
      )}
    </li>
  );
}
