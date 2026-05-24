// Lightweight video embed helper. Detects YouTube / Vimeo IDs and falls
// back to <video> for raw mp4-style URLs. Server component, no JS.

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\//, "") || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      // /embed/{id} or /shorts/{id}
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch {
    return null;
  }
  return null;
}

function vimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    if (id && /^\d+$/.test(id)) return id;
  } catch {
    return null;
  }
  return null;
}

export default function VideoEmbed({ url }: { url: string }) {
  const yt = youtubeId(url);
  if (yt) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden bg-black border border-light-gray" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          src={`https://www.youtube.com/embed/${yt}`}
          title="Lesson video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }
  const vm = vimeoId(url);
  if (vm) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden bg-black border border-light-gray" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          src={`https://player.vimeo.com/video/${vm}`}
          title="Lesson video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black border border-light-gray" style={{ aspectRatio: "16 / 9" }}>
      <video
        src={url}
        controls
        playsInline
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
