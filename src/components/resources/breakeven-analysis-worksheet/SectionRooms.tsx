"use client";

import { useState } from "react";
import { Copy, Plus, X } from "lucide-react";
import {
  MAX_ROOMS,
  ROOM_FEATURES,
  ROOM_INCLUDED,
  ROOM_SIZE_OPTIONS,
  ROOM_STATUS_LABEL,
  makeRoom,
  type PricingSummary,
  type PropertyInputs,
  type Room,
  type RoomStatus,
} from "@/lib/resources/breakeven-analysis-worksheet/pricing";
import { CheckGroup, Field, TabStrip, Warning, currency } from "./ui";

// Step 2: the rooms, one tab each.
//
// ONE ROOM AT A TIME, BY TAB. This was a stack of accordion rows; Alex asked
// for tabs on 2026-08-11 and they are the better fit anyway. A real house has
// three near-identical bedrooms and one suite, so the job is "set this one up,
// then copy it three times" — which needs the room you are editing to be fully
// visible, not one of five half-open rows competing for a 640px column. The
// tab strip also puts every room's price on screen at once, which the collapsed
// rows only did one line at a time.
//
// Duplicate is the primary lever, and plain Add is deliberately NOT a copy: an
// inherited checkbox set is how a house ends up with five phantom private
// bathrooms.

/**
 * Every room, on paper.
 *
 * Screen shows one room at a time by design, and the strip carrying the other
 * rooms' names and prices is `no-print`. Printing that as-is produced a
 * five-room worksheet whose Rooms page described exactly one room — the
 * printout was missing data, not merely loose. This is the print-side view of
 * what the tabs show: one row per room, with the tick-boxes flattened into the
 * two lists that actually justify each price.
 */
function RoomsPrintTable({
  rooms,
  pricing,
}: {
  rooms: Room[];
  pricing: PricingSummary;
}) {
  if (rooms.length === 0) return null;

  const labels = (
    source: { id: string; label: string }[],
    selected: Record<string, boolean>,
  ) =>
    source
      .filter((f) => selected[f.id])
      .map((f) => f.label)
      .join(", ");

  return (
    // The wrapper carries `print-only`, not the table: the print rule flips it
    // to `display: block`, which on a <table> collapses the whole grid.
    <div className="print-only">
      <table className="w-full font-sans text-left tabular-nums">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Room</th>
            <th scope="col">Status</th>
            <th scope="col">Size</th>
            <th scope="col">This room</th>
            <th scope="col">Included</th>
            <th scope="col" className="text-right">
              Rent
            </th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, i) => {
            const res = pricing.rooms.find((p) => p.id === room.id)?.result;
            return (
              <tr key={room.id}>
                <td>{i + 1}</td>
                <td>{room.name}</td>
                <td>{ROOM_STATUS_LABEL[room.status]}</td>
                <td>{room.sizeBand || "—"}</td>
                <td>{labels(ROOM_FEATURES, room.features) || "—"}</td>
                <td>{labels(ROOM_INCLUDED, room.included) || "—"}</td>
                <td className="text-right font-semibold">
                  {room.status === "renting" ? currency(res?.price ?? 0) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6} className="font-semibold">
              Gross scheduled rent
            </td>
            <td className="text-right font-semibold">
              {currency(pricing.grossScheduledRent)}/mo
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function SectionRooms({
  property,
  rooms,
  pricing,
  onRooms,
}: {
  /** Read-only here. The property itself is step 1; this needs it only to know
   *  whether a comp rent exists to price against. */
  property: PropertyInputs;
  rooms: Room[];
  pricing: PricingSummary;
  onRooms: (next: Room[]) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(rooms[0]?.id ?? null);

  // Derived, never corrected in an effect: a removed room, or an analysis
  // switched underneath us, must not leave the tab strip pointing at nothing.
  const active = rooms.find((r) => r.id === activeId) ?? rooms[0] ?? null;
  const activeIdx = active ? rooms.findIndex((r) => r.id === active.id) : -1;

  function patchRoom(id: string, patch: Partial<Room>) {
    onRooms(rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function toggleRoomFlag(id: string, group: "features" | "included", flagId: string) {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    patchRoom(id, { [group]: { ...room[group], [flagId]: !room[group][flagId] } } as Partial<Room>);
  }

  /**
   * Next free `room-N` id. Derived from the ids already present rather than a
   * timestamp or a random value, so it stays pure — and so a saved analysis
   * reloads with ids that still read in order.
   */
  function nextRoomId(): string {
    const used = rooms
      .map((r) => Number(/^room-(\d+)$/.exec(r.id)?.[1]))
      .filter((n) => Number.isInteger(n));
    return `room-${(used.length > 0 ? Math.max(...used) : 0) + 1}`;
  }

  function addRoom() {
    if (rooms.length >= MAX_ROOMS) return;
    // Deliberately a BLANK room, not a copy of the last one. Silently
    // inheriting the previous room's checkboxes is how a house ends up with
    // five phantom private bathrooms. Duplicate is the button for that.
    const id = nextRoomId();
    onRooms([...rooms, { ...makeRoom(rooms.length, id), name: `Room ${rooms.length + 1}` }]);
    setActiveId(id);
  }

  function duplicateRoom(id: string) {
    if (rooms.length >= MAX_ROOMS) return;
    const source = rooms.find((r) => r.id === id);
    if (!source) return;
    const newId = nextRoomId();
    const copy: Room = { ...source, id: newId, name: `Room ${rooms.length + 1}` };
    const at = rooms.findIndex((r) => r.id === id);
    onRooms([...rooms.slice(0, at + 1), copy, ...rooms.slice(at + 1)]);
    setActiveId(newId);
  }

  function removeRoom(id: string) {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    const touched =
      Object.values(room.features).some(Boolean) ||
      Object.values(room.included).some(Boolean) ||
      room.sizeBand !== "" ||
      room.priceOverride !== "";
    if (touched && !window.confirm(`Remove ${room.name}?`)) return;
    const at = rooms.findIndex((r) => r.id === id);
    const next = rooms.filter((r) => r.id !== id);
    onRooms(next);
    // Land on the neighbour rather than dumping the member back at room one.
    if (activeId === id) setActiveId(next[Math.max(0, at - 1)]?.id ?? null);
  }

  const fmvEntered = property.fmv.trim() !== "";
  const r = active ? pricing.rooms.find((p) => p.id === active.id)?.result : undefined;

  return (
    <div className="space-y-5">
      <RoomsPrintTable rooms={rooms} pricing={pricing} />

      <TabStrip
        tabs={rooms.map((room, i) => {
          const res = pricing.rooms.find((p) => p.id === room.id)?.result;
          return {
            id: room.id,
            index: i + 1,
            label: room.name,
            badge: room.status === "renting" ? currency(res?.price ?? 0) : "—",
          };
        })}
        activeId={active?.id ?? ""}
        onSelect={setActiveId}
        onAdd={rooms.length < MAX_ROOMS ? addRoom : undefined}
        addLabel="Add"
      />

      {rooms.length >= MAX_ROOMS && (
        <p className="no-print font-sans text-xs text-charcoal/55">
          {MAX_ROOMS} rooms is the ceiling here. Past that you are running a
          boarding house, and the licensing and the model both change.
        </p>
      )}

      {/* no-print, because RoomsPrintTable above is the printed Rooms page.
          Leaving this in produced a complete table of five rooms followed by a
          panel headed "Room 1 of 5" and no sign of the other four — which reads
          as missing pages, not as detail. */}
      {active && (
        <div className="no-print border border-light-gray rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 bg-cream/50 px-3 py-2 border-b border-light-gray">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/70">
              Room {activeIdx + 1} of {rooms.length}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => duplicateRoom(active.id)}
                disabled={rooms.length >= MAX_ROOMS}
                className="inline-flex items-center gap-1 font-sans text-xs font-medium text-charcoal/70 hover:text-primary-green disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1.5 rounded cursor-pointer transition-colors"
              >
                <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden />
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => removeRoom(active.id)}
                className="inline-flex items-center gap-1 font-sans text-xs font-medium text-charcoal/70 hover:text-terracotta px-2 py-1.5 rounded cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5 shrink-0" aria-hidden />
                Remove
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field
                label="Name"
                type="text"
                value={active.name}
                onChange={(v) => patchRoom(active.id, { name: v })}
                placeholder={`Room ${activeIdx + 1}`}
              />
              <div>
                <label className="block font-sans text-sm font-semibold text-near-black mb-1">
                  Status
                </label>
                <select
                  value={active.status}
                  onChange={(e) => patchRoom(active.id, { status: e.target.value as RoomStatus })}
                  className="w-full min-h-11 border border-light-gray bg-white px-3 py-2 text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green"
                >
                  {(Object.keys(ROOM_STATUS_LABEL) as RoomStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {ROOM_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-near-black mb-1">
                  Size
                </label>
                <select
                  value={active.sizeBand}
                  onChange={(e) => patchRoom(active.id, { sizeBand: e.target.value })}
                  className="w-full min-h-11 border border-light-gray bg-white px-3 py-2 text-sm text-near-black rounded-md focus:outline-none focus:border-primary-green"
                >
                  <option value="">Not sure</option>
                  {ROOM_SIZE_OPTIONS.map((o) => (
                    <option key={o.label} value={o.label}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <CheckGroup
              legend="This room"
              fields={ROOM_FEATURES}
              selected={active.features}
              onToggle={(id) => toggleRoomFlag(active.id, "features", id)}
            />
            <CheckGroup
              legend="Included in this rent"
              fields={ROOM_INCLUDED}
              selected={active.included}
              onToggle={(id) => toggleRoomFlag(active.id, "included", id)}
            />

            {r && (
              <div className="border-t border-light-gray pt-3 space-y-3">
                {/* The whole price, broken into its three parts. Reads left to
                    right as an equation so the number is never a black box,
                    even with per-item values hidden. */}
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-sans text-sm tabular-nums">
                  <span className="text-charcoal/60">Base</span>
                  <span className="font-medium text-near-black">{currency(r.base)}</span>
                  <span className="text-charcoal/35">+</span>
                  <span className="text-charcoal/60">room</span>
                  <span className="font-medium text-near-black">{currency(r.roomPremium)}</span>
                  <span className="text-charcoal/35">+</span>
                  <span className="text-charcoal/60">property</span>
                  <span className="font-medium text-near-black">{currency(r.propertyPremium)}</span>
                  <span className="text-charcoal/35">=</span>
                  <span className="font-display text-lg font-semibold text-primary-green">
                    {currency(r.computed)}
                  </span>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-40">
                    <Field
                      label="Set your own price"
                      prefix="$"
                      value={active.priceOverride}
                      onChange={(v) => patchRoom(active.id, { priceOverride: v })}
                      placeholder={String(r.computed)}
                      hint="Optional"
                    />
                  </div>
                  {r.overridden && (
                    <span className="font-sans text-xs text-charcoal/60 pb-3">
                      Calculated was <s>{currency(r.computed)}</s>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {rooms.length === 0 && (
        <p className="no-print font-sans text-sm text-charcoal/70">
          No rooms yet. Add one to start pricing.
        </p>
      )}

      {/* The total this row carries is the print table's tfoot row on paper. */}
      <div className="no-print flex flex-wrap items-center gap-3 border-t border-light-gray pt-4">
        <button
          type="button"
          onClick={addRoom}
          disabled={rooms.length >= MAX_ROOMS}
          className="inline-flex items-center gap-1.5 border border-light-gray bg-white hover:border-primary-green disabled:opacity-45 disabled:cursor-not-allowed text-near-black font-medium text-sm px-4 py-2 rounded-md cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden />
          Add a room
        </button>
        <span className="ml-auto font-sans text-sm text-charcoal/70">
          Total rent{" "}
          <span className="font-display text-lg font-semibold text-primary-green tabular-nums">
            {currency(pricing.grossScheduledRent)}/mo
          </span>
        </span>
      </div>

      {/* Not an error. Pricing three of five rooms while you decide about the
          other two is a normal thing to be doing; the launch budget still needs
          to buy five beds, which is why the two counts are separate. */}
      {pricing.roomCountMismatch && (
        <p className="font-sans text-sm text-charcoal/80 bg-cream border border-light-gray rounded-md px-3 py-2 leading-snug">
          <span className="font-semibold text-near-black">
            {pricing.roomCount} bedrooms, {pricing.pricedRoomCount} priced.
          </span>{" "}
          That is fine — you budget for {pricing.roomCount}, you earn on{" "}
          {pricing.pricedRoomCount}.
          {pricing.pricedRoomCount < pricing.roomCount && (
            <span className="no-print">
              {" "}
              <button
                type="button"
                onClick={() => {
                  const toAdd = Math.min(
                    pricing.roomCount - pricing.pricedRoomCount,
                    MAX_ROOMS - rooms.length,
                  );
                  if (toAdd <= 0) return;
                  const base = rooms.length;
                  const used = rooms
                    .map((rm) => Number(/^room-(\d+)$/.exec(rm.id)?.[1]))
                    .filter((n) => Number.isInteger(n));
                  let next = (used.length > 0 ? Math.max(...used) : 0) + 1;
                  const added: Room[] = [];
                  for (let i = 0; i < toAdd; i++, next++) {
                    added.push({
                      ...makeRoom(base + i, `room-${next}`),
                      name: `Room ${base + i + 1}`,
                    });
                  }
                  onRooms([...rooms, ...added]);
                }}
                className="font-semibold text-primary-green hover:underline cursor-pointer"
              >
                Add the other {pricing.roomCount - pricing.pricedRoomCount}
              </button>
              .
            </span>
          )}
        </p>
      )}

      {pricing.upliftImplausible && (
        <Warning title={`${pricing.houseUplift?.toFixed(1)}× the whole-house rent.`}>
          Co-living usually lands between 1.3× and 1.8×. Worth a second look.
        </Warning>
      )}

      {!fmvEntered && (
        <p className="no-print font-sans text-sm text-charcoal/60">
          Add a comparable 1-bedroom rent on the property step to price every
          room.
        </p>
      )}
    </div>
  );
}
