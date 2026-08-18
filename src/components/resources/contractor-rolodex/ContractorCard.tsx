"use client";

import { ChevronDown, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import StarRating, { RatingStars } from "./StarRating";
import {
  CONTRACTOR_SECTIONS,
  displayName,
  formatCost,
  formatDate,
  ratingValue,
  type Contractor,
  type ContractorField,
  type FieldSpec,
} from "@/lib/resources/contractor-rolodex/config";

// 16px on a phone, because anything smaller makes iOS zoom the page on focus —
// and a zoomed viewport is horizontal scroll by another name, which is the one
// thing this rebuild exists to remove. Back to the house 14px from sm up.
const INPUT_CLASS =
  "w-full min-w-0 min-h-11 border border-light-gray rounded-md bg-white px-3 py-2 font-sans text-base sm:text-sm text-near-black placeholder:text-charcoal/35 focus:border-primary-green focus:outline-none focus:ring-1 focus:ring-primary-green/30 transition-colors";

const LABEL_CLASS =
  "block font-sans text-[11px] font-semibold uppercase tracking-wide text-charcoal/55 mb-1.5";

function FieldControl({
  contractor,
  field,
  onChange,
}: {
  contractor: Contractor;
  field: FieldSpec;
  onChange: (key: ContractorField, value: string) => void;
}) {
  const id = `cr-${contractor._id}-${field.key}`;
  const value = contractor[field.key] ?? "";
  const set = (v: string) => onChange(field.key, v);

  if (field.kind === "rating") {
    return (
      <StarRating
        value={value}
        onChange={set}
        label={`Your rating for ${displayName(contractor)}`}
      />
    );
  }

  if (field.kind === "textarea") {
    return (
      <textarea
        id={id}
        rows={3}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => set(e.target.value)}
        className={`${INPUT_CLASS} resize-y leading-relaxed`}
      />
    );
  }

  if (field.kind === "money") {
    // span + input inside .relative is the shape the print stylesheet already
    // knows how to keep the "$" off the digits. Do not restructure it.
    return (
      <div className="relative">
        <span
          aria-hidden
          className="absolute left-2.5 top-1/2 -translate-y-1/2 font-sans text-sm text-charcoal/50 pointer-events-none"
        >
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => set(e.target.value)}
          className={`${INPUT_CLASS} pl-6 tabular-nums`}
        />
      </div>
    );
  }

  const listId = field.suggestions ? `${id}-options` : undefined;

  return (
    <>
      <input
        id={id}
        type={
          field.kind === "tel"
            ? "tel"
            : field.kind === "email"
              ? "email"
              : field.kind === "date"
                ? "date"
                : "text"
        }
        value={value}
        placeholder={field.placeholder}
        autoComplete={field.autoComplete}
        list={listId}
        onChange={(e) => set(e.target.value)}
        className={INPUT_CLASS}
      />
      {field.suggestions && (
        <datalist id={listId}>
          {field.suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </>
  );
}

/**
 * One contractor: a scannable summary that stays out of the way, and the whole
 * record in five labelled sections when you open it.
 *
 * The record is rendered whether or not the card is open — the shared
 * `.collapsed-on-screen` rule is what hides it. That way a printed rolodex is
 * every field of every contractor, not just whichever one happened to be
 * expanded.
 */
export default function ContractorCard({
  contractor,
  open,
  onToggle,
  onChange,
  onDelete,
}: {
  contractor: Contractor;
  open: boolean;
  onToggle: () => void;
  onChange: (key: ContractorField, value: string) => void;
  onDelete: () => void;
}) {
  const name = displayName(contractor);
  const rating = ratingValue(contractor);
  const bodyId = `cr-body-${contractor._id}`;

  const coverage = [contractor.serviceArea, contractor.availability]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" · ");

  const lastJob = [
    contractor.lastJob.trim(),
    formatDate(contractor.lastUsed),
    formatCost(contractor.lastCost),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={`placeholders-are-examples bg-white border rounded-lg break-inside-avoid transition-colors ${
        open ? "border-primary-green/50 shadow-sm" : "border-light-gray"
      }`}
    >
      {/* Summary header. A div, not a button, so the delete control can live
          beside the toggle without nesting one button inside another. */}
      <div className="flex items-start gap-2 p-3 sm:p-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex-1 min-w-0 text-left rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-green"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-near-black leading-snug wrap-break-word min-w-0">
              {name}
            </h3>
            <span className="shrink-0 pt-0.5">
              <RatingStars value={rating} />
            </span>
          </div>

          <div className="no-print mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {contractor.specialty.trim() && (
              <span className="inline-flex items-center rounded-full bg-primary-green/10 text-primary-green px-2.5 py-0.5 font-sans text-[11px] font-semibold tracking-wide wrap-break-word">
                {contractor.specialty.trim()}
              </span>
            )}
            {contractor.poc.trim() && (
              <span className="font-sans text-xs text-charcoal/70 wrap-break-word">
                {contractor.poc.trim()}
              </span>
            )}
          </div>

          {coverage && (
            <p className="no-print mt-1.5 flex items-start gap-1.5 font-sans text-xs text-charcoal/60 wrap-break-word">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
              <span className="min-w-0">{coverage}</span>
            </p>
          )}

          {lastJob && (
            <p className="no-print mt-1 font-sans text-xs text-charcoal/55 wrap-break-word">
              Last job: {lastJob}
            </p>
          )}
        </button>

        <div className="no-print flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Remove ${name} from your rolodex?`)) {
                onDelete();
              }
            }}
            aria-label={`Remove ${name}`}
            className="min-w-11 min-h-11 flex items-center justify-center rounded-md text-charcoal/40 hover:text-terracotta hover:bg-terracotta/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={open ? `Collapse ${name}` : `Edit ${name}`}
            className="min-w-11 min-h-11 flex items-center justify-center rounded-md text-charcoal/50 hover:text-near-black hover:bg-off-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-green transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </div>
      </div>

      {/* Quick contact row — the reason the tool exists, one tap from the list. */}
      {(contractor.phone.trim() || contractor.email.trim()) && (
        <div className="no-print flex flex-wrap gap-2 px-3 sm:px-4 pb-3">
          {contractor.phone.trim() && (
            <a
              href={`tel:${contractor.phone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-1.5 min-h-11 px-3 rounded-md border border-light-gray hover:border-primary-green hover:bg-primary-green/5 font-sans text-sm font-medium text-near-black transition-colors"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="break-all">{contractor.phone.trim()}</span>
            </a>
          )}
          {contractor.email.trim() && (
            <a
              href={`mailto:${contractor.email.trim()}`}
              className="inline-flex items-center gap-1.5 min-h-11 px-3 rounded-md border border-light-gray hover:border-primary-green hover:bg-primary-green/5 font-sans text-sm text-charcoal/80 transition-colors min-w-0"
              aria-label={`Email ${name}`}
            >
              <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="truncate max-w-56">
                {contractor.email.trim()}
              </span>
            </a>
          )}
        </div>
      )}

      {/* The full record. Hidden on screen while collapsed; always printed. */}
      <div
        id={bodyId}
        className={`cr-record border-t border-light-gray ${open ? "" : "collapsed-on-screen"}`}
      >
        {CONTRACTOR_SECTIONS.map((section) => (
          <fieldset
            key={section.id}
            /* min-w-0 is load-bearing: a fieldset's default intrinsic minimum
               width is its content, which makes it refuse to shrink and pushes
               a horizontal scrollbar onto the whole page at 375px. */
            className="min-w-0 w-full m-0 px-3 sm:px-4 py-4 border-x-0 border-t-0 border-b border-light-gray/70 last:border-b-0 break-inside-avoid"
          >
            <legend className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-primary-green">
              {section.title}
            </legend>
            <p className="font-sans text-xs text-charcoal/55 leading-relaxed mt-1 mb-3.5">
              {section.hint}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              {section.fields.map((field) => (
                <div
                  key={field.key}
                  className={`min-w-0 ${field.wide ? "sm:col-span-2" : ""}`}
                >
                  {/* A one-field section titled the same as its field (Notes)
                      would otherwise print the word twice, one line apart.
                      Hide the duplicate from sight, keep it for screen
                      readers, which do not see the legend as a field label. */}
                  <label
                    className={
                      section.fields.length === 1 &&
                      field.label === section.title
                        ? "sr-only"
                        : LABEL_CLASS
                    }
                    htmlFor={
                      field.kind === "rating"
                        ? undefined
                        : `cr-${contractor._id}-${field.key}`
                    }
                  >
                    {field.label}
                  </label>
                  <FieldControl
                    contractor={contractor}
                    field={field}
                    onChange={onChange}
                  />
                  {field.help && (
                    <p className="font-sans text-[11px] text-charcoal/50 mt-1.5">
                      {field.help}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-off-white/60 rounded-b-lg">
          <p className="font-sans text-xs text-charcoal/55">
            Saves as you type.
          </p>
          <button
            type="button"
            onClick={onToggle}
            className="min-h-11 inline-flex items-center bg-primary-green hover:bg-primary-green-dark text-white font-medium text-sm px-5 rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </article>
  );
}
