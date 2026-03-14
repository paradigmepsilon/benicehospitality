import Link from "next/link";
import { sql } from "@/lib/db";

async function getDashboardData() {
  const [published, subscribers, pipelineTotal, pipelineProspects, upcomingBookings, recentSubscribers, recentActivity] =
    await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM blog_posts WHERE published = true`,
      sql`SELECT COUNT(*)::int AS count FROM newsletter_subscribers`,
      sql`SELECT COUNT(*)::int AS count FROM pipeline_contacts`,
      sql`SELECT COUNT(*)::int AS count FROM pipeline_contacts WHERE pipeline_stage = 'prospect'`,
      sql`SELECT COUNT(*)::int AS count FROM bookings WHERE status = 'confirmed' AND booking_date >= CURRENT_DATE`,
      sql`SELECT id, email, source, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC LIMIT 5`,
      sql`SELECT pa.id, pa.type, pa.title, pa.created_at, pc.name AS contact_name
          FROM pipeline_activities pa
          JOIN pipeline_contacts pc ON pa.contact_id = pc.id
          ORDER BY pa.created_at DESC LIMIT 5`,
    ]);

  return {
    stats: {
      publishedPosts: published[0].count,
      subscribers: subscribers[0].count,
      pipelineTotal: pipelineTotal[0].count,
      pipelineProspects: pipelineProspects[0].count,
      upcomingBookings: upcomingBookings[0].count,
    },
    recentSubscribers,
    recentActivity,
  };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AdminDashboard() {
  const { stats, recentSubscribers, recentActivity } = await getDashboardData();

  const cards = [
    { label: "Published Posts", value: stats.publishedPosts, color: "border-[#5b9a2f]", href: "/admin/posts" },
    { label: "Subscribers", value: stats.subscribers, color: "border-[#f5a623]", href: "/admin/subscribers" },
    { label: "Pipeline Contacts", value: stats.pipelineTotal, color: "border-[#3b82f6]", href: "/admin/crm" },
    { label: "Prospects", value: stats.pipelineProspects, color: "border-[#8b5cf6]", href: "/admin/crm" },
    { label: "Upcoming Bookings", value: stats.upcomingBookings, color: "border-[#c0674a]", href: "/admin/schedule" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[#1a1a1a] mb-6">
        Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`bg-white border-l-4 ${card.color} border border-[#e8e4dd] p-5 rounded-lg hover:shadow-md transition-shadow group`}
          >
            <p className="text-3xl font-semibold text-[#1a1a1a] group-hover:text-[#5b9a2f] transition-colors">
              {card.value}
            </p>
            <p className="text-sm text-[#1a1a1a]/50 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Activity Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Activity */}
        <div className="bg-white border border-[#e8e4dd] rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e4dd]">
            <h2 className="font-display text-base font-semibold text-[#1a1a1a]">
              CRM Activity
            </h2>
            <Link
              href="/admin/crm"
              className="text-xs font-medium text-[#5b9a2f] hover:underline"
            >
              View all
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#1a1a1a]/40 text-center">
              No CRM activity yet.
            </p>
          ) : (
            <div>
              {recentActivity.map((item: Record<string, string>, i: number) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-5 py-3 ${
                    i !== recentActivity.length - 1 ? "border-b border-[#e8e4dd]" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">
                      {item.contact_name}
                    </p>
                    <p className="text-xs text-[#1a1a1a]/40 truncate">
                      {item.title}
                    </p>
                  </div>
                  <span className="text-xs text-[#1a1a1a]/30 flex-shrink-0">
                    {timeAgo(item.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Subscribers */}
        <div className="bg-white border border-[#e8e4dd] rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e4dd]">
            <h2 className="font-display text-base font-semibold text-[#1a1a1a]">
              Recent Subscribers
            </h2>
            <Link
              href="/admin/subscribers"
              className="text-xs font-medium text-[#5b9a2f] hover:underline"
            >
              View all
            </Link>
          </div>
          {recentSubscribers.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#1a1a1a]/40 text-center">
              No subscribers yet.
            </p>
          ) : (
            <div>
              {recentSubscribers.map((sub: Record<string, string>, i: number) => (
                <div
                  key={sub.id}
                  className={`flex items-center gap-3 px-5 py-3 ${
                    i !== recentSubscribers.length - 1 ? "border-b border-[#e8e4dd]" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-[#f5a623]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">
                      {sub.email}
                    </p>
                    <p className="text-xs text-[#1a1a1a]/40">
                      via {sub.source}
                    </p>
                  </div>
                  <span className="text-xs text-[#1a1a1a]/30 flex-shrink-0">
                    {timeAgo(sub.subscribed_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
