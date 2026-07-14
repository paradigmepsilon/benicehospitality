import { getWalkthrough } from "@/lib/claim-proof-video";
import { IconClock } from "./Icons";

/**
 * Framed walkthrough player. Renders the native <video> pointed at the tier-
 * gated /api/claimproof/video/<key> endpoint, which redirects to a signed
 * private-blob URL. Server component: no client JS beyond native controls.
 */
export function WalkthroughVideo({
  videoKey,
  eyebrow = "Watch the walkthrough",
}: {
  videoKey: string;
  eyebrow?: string;
}) {
  const video = getWalkthrough(videoKey);
  if (!video) return null;

  return (
    <figure className="cp-rise mb-10 overflow-hidden rounded-[1.5rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
      <div className="rounded-[calc(1.5rem-0.375rem)] bg-[#2A2932] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] sm:p-5">
        <figcaption className="mb-3 flex items-center justify-between gap-3 px-1">
          <span>
            <span className="block font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E19C63]">
              {eyebrow}
            </span>
            <span className="mt-1 block font-display text-lg font-semibold text-white">
              {video.title}
            </span>
          </span>
          <span className="flex flex-none items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 font-sans text-[11px] tabular-nums text-[#8BA5BE]">
            <IconClock className="h-3.5 w-3.5" />
            {video.runtime}
          </span>
        </figcaption>
        <div className="overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
          <video
            controls
            preload="metadata"
            playsInline
            poster={`/images/claimproof/portal/wt-${video.key}.jpg`}
            className="aspect-video h-full w-full"
          >
            <source src={`/api/claimproof/video/${video.key}`} type="video/mp4" />
            Your browser does not support embedded video.
          </video>
        </div>
      </div>
    </figure>
  );
}
