"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Maximize2, Minimize2, RotateCw } from "lucide-react";

// The slide bundle ships its own 100vw / 100vh / clamp(...,vw,...) typography.
// Those units resolve against the iframe's own viewport, so the only way to
// guarantee headlines, stats, and grids land at design intent is to give the
// iframe a fixed "design" viewport — 1920 × 1080 — and visually scale the
// rendered iframe with CSS transform to fit whatever container we put it in.
// Bundle author can design at 1920 × 1080 forever; we just shrink the output.
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

// Renders a lesson HTML bundle in an iframe and forwards `?slide=N` jumps
// down via postMessage. The iframe content is patched at upload time to
// listen for { kind: 'goToSlide', slide } messages.
//
// `aspect` controls the iframe's outer layout:
//   "slide" — fixed-canvas player scaled to fit. Decks like Lesson 1.2.
//   "page"  — full container width, tall scroll area (workbooks, articles).
export default function BundleFrame({
  src,
  aspect = "slide",
}: {
  src: string;
  aspect?: "slide" | "page";
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const readyRef = useRef(false);
  const pendingSlideRef = useRef<number | null>(null);
  const searchParams = useSearchParams();
  const slideParam = searchParams.get("slide");
  const [scale, setScale] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  function postSlide(slide: number) {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ kind: "goToSlide", slide }, "*");
  }

  // Track ready signal from the patched bundle so we don't fire before the
  // iframe's listener is attached.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data || {};
      if (data?.kind === "bnhg-bundle-ready") {
        readyRef.current = true;
        if (pendingSlideRef.current !== null) {
          postSlide(pendingSlideRef.current);
          pendingSlideRef.current = null;
        }
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Forward URL ?slide changes whenever the param updates.
  useEffect(() => {
    if (!slideParam) return;
    const n = Number(slideParam);
    if (!Number.isFinite(n) || n < 1) return;
    if (readyRef.current) {
      postSlide(n);
    } else {
      pendingSlideRef.current = n;
    }
  }, [slideParam]);

  // Re-scale the iframe whenever the stage resizes. Stage is the visible 16:9
  // box; iframe is locked at 1920×1080 internally and CSS-scaled to fit.
  useEffect(() => {
    if (aspect !== "slide") return;
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const w = stage.clientWidth;
      if (w > 0) setScale(w / DESIGN_WIDTH);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [aspect]);

  // Portrait-mobile detection — drives the "rotate your phone" overlay.
  useEffect(() => {
    if (aspect !== "slide") return;
    const mq = window.matchMedia(
      "(max-width: 768px) and (orientation: portrait)",
    );
    const update = () => setIsPortraitMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [aspect]);

  // Sync fullscreen state + best-effort orientation lock on Android. iOS
  // refuses screen.orientation.lock; we swallow the rejection and rely on
  // the rotate overlay to nudge users.
  useEffect(() => {
    function onChange() {
      const isFs = document.fullscreenElement === wrapperRef.current;
      setIsFullscreen(isFs);
      const orientation = (
        screen as Screen & {
          orientation?: ScreenOrientation & {
            lock?: (o: string) => Promise<void>;
            unlock?: () => void;
          };
        }
      ).orientation;
      if (isFs && orientation?.lock) {
        try {
          orientation.lock("landscape").catch(() => {});
        } catch {
          // Older browsers throw synchronously; ignore.
        }
      } else if (!isFs && orientation?.unlock) {
        try {
          orientation.unlock();
        } catch {
          // Same story.
        }
      }
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = wrapperRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // Browser refused (permissions, unsupported) — silently ignore.
    }
  }, []);

  if (aspect === "page") {
    return (
      <div className="bg-white rounded-lg overflow-hidden border border-light-gray">
        <iframe
          ref={iframeRef}
          src={src}
          title="Lesson content"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          className="block w-full min-h-[80vh] border-0"
        />
      </div>
    );
  }

  // Slide path. Wrapper morphs between embedded and fullscreen layouts; the
  // stage inside is always a 16:9 box that hosts the design-canvas iframe.
  // Keeping refs stable across mode switches means the iframe never reloads,
  // so audio playback / current slide / animation state survive fullscreen.
  return (
    <div
      ref={wrapperRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center"
          : "relative bg-[#0a0a0a] rounded-lg overflow-hidden border border-light-gray w-full max-w-[1280px] mx-auto"
      }
    >
      <div
        ref={stageRef}
        className="relative aspect-[16/9] overflow-hidden"
        style={
          isFullscreen
            ? {
                // Largest 16:9 box that fits the screen.
                width: "min(100vw, calc(100dvh * 16 / 9))",
                maxHeight: "100dvh",
              }
            : { width: "100%" }
        }
      >
        <iframe
          ref={iframeRef}
          src={src}
          title="Lesson player"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          className="absolute top-0 left-0 border-0"
          style={{
            width: `${DESIGN_WIDTH}px`,
            height: `${DESIGN_HEIGHT}px`,
            transformOrigin: "top left",
            transform: `scale(${scale || 0.0001})`,
            visibility: scale > 0 ? "visible" : "hidden",
          }}
        />
      </div>

      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded bg-black/55 text-white/80 hover:bg-black/75 hover:text-white backdrop-blur-sm transition-colors"
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" aria-hidden />
        ) : (
          <Maximize2 className="h-4 w-4" aria-hidden />
        )}
      </button>

      {isPortraitMobile && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0a0a]/95 text-white px-6 text-center">
          <RotateCw
            className="h-12 w-12 mb-4 text-white/75 animate-pulse"
            aria-hidden
          />
          <p className="font-display text-lg font-semibold mb-2">
            Turn your phone sideways
          </p>
          <p className="font-sans text-sm text-white/70 max-w-xs leading-relaxed">
            This lesson is designed for landscape. Rotate your device to start
            the deck.
          </p>
        </div>
      )}
    </div>
  );
}
