import {
  getOverviewMetrics,
  getDailySignups,
  getDailyLogins,
  listRecentEvents,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<string, string> = {
  "auth.login": "Login",
  "auth.logout": "Logout",
  "lesson.complete": "Lesson completed",
  "forum.thread_create": "Thread created",
  "forum.post_create": "Forum reply",
};

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

interface BarChartProps {
  data: Array<{ day: string; count: number }>;
  label: string;
}

function BarChart({ data, label }: BarChartProps) {
  const width = 720;
  const height = 180;
  const padX = 12;
  const padY = 24;
  const barGap = 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const max = Math.max(1, ...data.map((d) => d.count));
  const barW = (innerW - barGap * (data.length - 1)) / data.length;

  return (
    <div className="bg-white border border-light-gray rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-near-black/65">
          {label}
        </p>
        <p className="text-xs text-near-black/55">
          peak {max} · last {data.length} days
        </p>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[180px]"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label} — last ${data.length} days`}
      >
        {data.map((d, i) => {
          const h = (d.count / max) * innerH;
          const x = padX + i * (barW + barGap);
          const y = height - padY - h;
          return (
            <g key={d.day}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={2}
                fill="#B08D57"
                opacity={d.count === 0 ? 0.2 : 0.9}
              >
                <title>{`${d.day}: ${d.count}`}</title>
              </rect>
            </g>
          );
        })}
        {/* x-axis labels every 5 days */}
        {data.map((d, i) =>
          i % 5 === 0 || i === data.length - 1 ? (
            <text
              key={`label-${d.day}`}
              x={padX + i * (barW + barGap) + barW / 2}
              y={height - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#4B5563"
              fontFamily="system-ui, sans-serif"
            >
              {d.day.slice(5)}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

export default async function AnalyticsPage() {
  const [overview, signups, logins, recent] = await Promise.all([
    getOverviewMetrics(),
    getDailySignups(30),
    getDailyLogins(30),
    listRecentEvents(50),
  ]);

  const cards = [
    { label: "Total members", value: overview.totalMembers },
    { label: "Active last 7d", value: overview.activeLast7d },
    { label: "Signups last 30d", value: overview.signupsLast30d },
    { label: "Course completions", value: overview.courseCompletions },
    { label: "Forum threads", value: overview.forumThreads },
    { label: "Forum posts", value: overview.forumPosts },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-near-black mb-1">
          Analytics
        </h1>
        <p className="text-sm text-near-black/60">
          DB-backed metrics — signups, logins, course progress, forum activity.
          Page-view analytics is a separate add (Plausible / GA).
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white border border-light-gray rounded-lg p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-near-black/60 mb-2">
              {c.label}
            </p>
            <p className="text-2xl font-display font-semibold text-near-black">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <BarChart data={signups} label="Signups (last 30d)" />
        <BarChart data={logins} label="Logins (last 30d)" />
      </div>

      <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
        <div className="bg-cream border-b border-light-gray px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-near-black/65">
            Recent activity ({recent.length})
          </p>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-near-black/55">
            No events yet. Logins and lesson completions land here as they
            happen.
          </div>
        ) : (
          <ul>
            {recent.map((e) => (
              <li
                key={e.id}
                className="border-b border-light-gray last:border-0 px-5 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-sans text-xs font-semibold tracking-wide uppercase text-warm-gold-dark bg-warm-gold/15 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                    {EVENT_LABELS[e.eventType] ?? e.eventType}
                  </span>
                  <p className="text-sm text-near-black truncate">
                    {e.userName ?? e.userEmail ?? "anonymous"}
                  </p>
                </div>
                <p className="text-xs text-near-black/55 whitespace-nowrap">
                  {fmtDateTime(e.occurredAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
