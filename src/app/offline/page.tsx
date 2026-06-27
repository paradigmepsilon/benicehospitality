import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        background: "#f8f6f1",
        color: "#1a1a1a",
      }}
    >
      <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.75rem, 6vw, 2.75rem)", margin: 0 }}>
        You&rsquo;re offline
      </h1>
      <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", maxWidth: "32ch", color: "#3d3d3d" }}>
        This page isn&rsquo;t available without a connection. Reconnect and try again.
      </p>
    </main>
  );
}
