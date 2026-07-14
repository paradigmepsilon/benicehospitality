"use client";

import { useState } from "react";
import { IconClock } from "./Icons";

/**
 * The full walkthrough library on the dashboard: every video the buyer's tier
 * unlocks, as poster cards that expand into an inline player on click. Only the
 * tier-unlocked list is passed in (gating is resolved server-side), and each
 * player hits the tier-gated /api/claimproof/video/<key> route.
 */

export interface WalkthroughItem {
  key: string;
  title: string;
  runtime: string;
}

export default function WalkthroughLibrary({ videos }: { videos: WalkthroughItem[] }) {
  const [playing, setPlaying] = useState<Set<string>>(new Set());
  if (videos.length === 0) return null;

  const play = (key: string) =>
    setPlaying((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((v) => (
        <div
          key={v.key}
          className="overflow-hidden rounded-[1.3rem] border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]"
        >
          <div className="relative aspect-video bg-black">
            {playing.has(v.key) ? (
              <video
                autoPlay
                controls
                playsInline
                poster={`/images/claimproof/portal/wt-${v.key}.jpg`}
                className="h-full w-full"
              >
                <source src={`/api/claimproof/video/${v.key}`} type="video/mp4" />
              </video>
            ) : (
              <button
                onClick={() => play(v.key)}
                aria-label={`Play ${v.title}`}
                className="group absolute inset-0 h-full w-full cursor-pointer"
                style={{
                  backgroundImage: `url(/images/claimproof/portal/wt-${v.key}.jpg)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-colors duration-300 group-hover:from-black/40" />
                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#E19C63] text-[#27262E] shadow-[0_8px_24px_-6px_rgba(225,156,99,0.7)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 font-sans text-[11px] tabular-nums text-white/90 backdrop-blur-sm">
                  <IconClock className="h-3 w-3" />
                  {v.runtime}
                </span>
              </button>
            )}
          </div>
          <p className="px-4 py-3 font-sans text-sm font-semibold text-white">{v.title}</p>
        </div>
      ))}
    </div>
  );
}
