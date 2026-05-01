import type { AuditData } from "@/lib/types/audit";
import DimensionCard from "@/components/audit/DimensionCard";
import QuickWinsCard from "@/components/audit/QuickWinsCard";
import CTABand from "@/components/audit/CTABand";

interface AuditReportProps {
  token: string;
  data: AuditData;
}

export default function AuditReport({ token, data }: AuditReportProps) {
  const visibilityNote = data.signal_referral_eligible
    ? "Want a deeper read on AI search visibility? Ask about Signal by BNHG during your call."
    : undefined;

  return (
    <div className="space-y-10 md:space-y-14">
      {/* Page 1: 2x2 grid of the first four dimensions */}
      <section aria-labelledby="dimensions-page-1">
        <h2
          id="dimensions-page-1"
          className="font-display text-2xl md:text-3xl font-semibold text-near-black mb-6 md:mb-8"
        >
          Your Seven Dimensions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <DimensionCard title="Revenue Opportunity" data={data.dimensions.revenue_opportunity} />
          <DimensionCard title="Online Reputation" data={data.dimensions.online_reputation} />
          <DimensionCard title="Competitive Position" data={data.dimensions.competitive_position} />
          <DimensionCard title="Guest Personas" data={data.dimensions.guest_personas} />
        </div>
      </section>

      {/* Page 2: 1x3 row */}
      <section aria-labelledby="dimensions-page-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <DimensionCard title="Tech Stack" data={data.dimensions.tech_stack} />
          <DimensionCard
            title="Visibility & Discoverability"
            data={data.dimensions.visibility_discoverability}
            note={visibilityNote}
          />
          <div className="md:col-span-2 lg:col-span-1">
            <QuickWinsCard wins={data.quick_wins} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <CTABand
          token={token}
          hotelName={data.hotel.name}
          signalEligible={data.signal_referral_eligible}
        />
      </section>

      {/* Footer note */}
      <p className="text-xs text-charcoal/50 text-center max-w-2xl mx-auto leading-relaxed">
        This audit is a diagnostic teaser. The prescriptive remediation plan is part of our Tier 1 engagement.
      </p>
    </div>
  );
}
