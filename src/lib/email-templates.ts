const SITE_URL = "https://www.benicehospitality.com";
const LOGO_URL = `${SITE_URL}/images/logo-horizontal.png`;

function auditLayout({
  preheader,
  bodyHtml,
}: {
  preheader: string;
  bodyHtml: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Be Nice Hospitality Group</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background-color:#e8e4dd;-webkit-font-smoothing:antialiased;">
  <span style="display:none;max-height:0;overflow:hidden;color:transparent;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e8e4dd;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td align="center" style="background-color:#1a1a1a;padding:32px 40px;">
          <img src="${LOGO_URL}" alt="Be Nice Hospitality Group" width="200" style="display:block;max-width:200px;height:auto;" />
        </td></tr>
        <tr><td style="background-color:#ffffff;padding:40px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:15px;color:#3d3d3d;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="background-color:#1a1a1a;padding:24px 40px;text-align:center;">
          <p style="margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;font-size:14px;color:#ffffff;">Be Nice Hospitality Group</p>
          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.4);">&copy; ${new Date().getFullYear()} Be Nice Hospitality Group</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function primaryButton(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
    <tr><td align="center" style="border-radius:6px;background-color:#5b9a2f;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.02em;">${label}</a>
    </td></tr>
  </table>`;
}

function secondaryLink(href: string, label: string) {
  return `<a href="${href}" target="_blank" style="color:#5b9a2f;text-decoration:none;font-weight:600;border-bottom:1px solid #5b9a2f33;">${label}</a>`;
}

function goldDivider() {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr><td style="width:48px;height:2px;background-color:#f5a623;border-radius:1px;"></td></tr>
  </table>`;
}

function scoreCallout({
  hotelName,
  overallScore,
  overallGrade,
}: {
  hotelName: string;
  overallScore: number;
  overallGrade: string;
}) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;background-color:#f8f6f1;border:1px solid #e8e4dd;border-radius:8px;">
    <tr><td style="padding:24px 28px;">
      <p style="margin:0 0 6px;font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:600;color:#f5a623;text-transform:uppercase;letter-spacing:1.5px;">Tier 0 Audit Score</p>
      <p style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:15px;color:#1a1a1a;line-height:1.4;">
        ${hotelName}
      </p>
      <p style="margin:8px 0 0;font-family:'Playfair Display',Georgia,serif;font-size:32px;font-weight:600;color:#1a1a1a;line-height:1;">
        ${overallScore}<span style="font-size:18px;color:#3d3d3d;font-weight:500;"> / 100</span>
        <span style="margin-left:12px;display:inline-block;font-size:14px;color:#5b9a2f;font-weight:600;background:#5b9a2f1a;padding:2px 10px;border-radius:4px;vertical-align:middle;">Grade ${overallGrade}</span>
      </p>
    </td></tr>
  </table>`;
}

export interface AuditEmailPayload {
  hotelName: string;
  overallScore: number;
  overallGrade: string;
  auditUrl: string;
  bookingUrl: string;
}

export function auditReadyEmail(p: AuditEmailPayload) {
  return auditLayout({
    preheader: `${p.hotelName}: ${p.overallScore}/100, Grade ${p.overallGrade}. Your full audit is unlocked.`,
    bodyHtml: `
      <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:600;color:#1a1a1a;line-height:1.3;">Your Tier 0 audit is unlocked</h1>
      ${goldDivider()}
      <p style="margin:0 0 16px;">Hi there,</p>
      <p style="margin:0 0 8px;">Thanks for unlocking your Tier 0 Comprehensive Audit. Here's where you landed across the seven dimensions:</p>
      ${scoreCallout({ hotelName: p.hotelName, overallScore: p.overallScore, overallGrade: p.overallGrade })}
      <p style="margin:0 0 16px;">Your full report is yours to keep. The link stays active for 90 days, so come back any time.</p>
      ${primaryButton(p.auditUrl, "View My Audit")}
      <p style="margin:32px 0 0;font-family:'Playfair Display',Georgia,serif;font-size:18px;color:#1a1a1a;font-weight:600;">What's next?</p>
      <p style="margin:8px 0 0;">A free 40-minute strategy call. You pick the dimension that matters most to ${p.hotelName}, and we'll arrive with a deeper read on that area specifically. No deck, no slides. Just a working session.</p>
      ${primaryButton(p.bookingUrl, "Book My Strategy Call")}
      <p style="margin:32px 0 0;color:#1a1a1a;font-weight:500;">Alex Henry</p>
      <p style="margin:0;color:#3d3d3d;font-size:13px;">Founder, Be Nice Hospitality Group</p>
    `,
  });
}

export function nurtureDay3Email(p: AuditEmailPayload) {
  return auditLayout({
    preheader: `Quick question about your ${p.hotelName} audit.`,
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi there,</p>
      <p style="margin:0 0 16px;">You opened your Tier 0 audit a few days back. Anything jump out?</p>
      <p style="margin:0 0 16px;">If one of the seven dimensions felt like it deserved more attention, that's exactly what our 40-minute strategy call is for. You pick the dimension at booking, we run a deeper analysis before the call, and you walk away with a clearer view of your highest-impact next move.</p>
      <p style="margin:0 0 16px;">Free, no commitment. ${secondaryLink(p.auditUrl, "Re-open your audit")} if you want to refresh the context first.</p>
      ${primaryButton(p.bookingUrl, "Book My Strategy Call")}
      <p style="margin:32px 0 0;color:#1a1a1a;font-weight:500;">Alex</p>
    `,
  });
}

export interface NurtureDay7Payload extends AuditEmailPayload {
  lowestDimensionLabel: string;
  lowestFinding: string;
}

export function nurtureDay7Email(p: NurtureDay7Payload) {
  return auditLayout({
    preheader: `${p.hotelName}'s biggest gap is ${p.lowestDimensionLabel}.`,
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi there,</p>
      <p style="margin:0 0 16px;">Your audit flagged <strong>${p.lowestDimensionLabel}</strong> as the area with the most room to grow.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-left:3px solid #f5a623;background-color:#fafaf8;">
        <tr><td style="padding:14px 18px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#3d3d3d;line-height:1.6;">
          <strong style="color:#1a1a1a;">Headline finding:</strong> ${p.lowestFinding}
        </td></tr>
      </table>
      <p style="margin:0 0 16px;">If you want a deeper read on ${p.lowestDimensionLabel} specifically, that's where we'd start the call. Pick that dimension at booking, and we'll arrive with a remediation outline.</p>
      ${primaryButton(p.bookingUrl, `Focus the call on ${p.lowestDimensionLabel}`)}
      <p style="margin:24px 0 0;font-size:13px;color:#3d3d3d;">Or ${secondaryLink(p.auditUrl, "review the full audit")} again.</p>
      <p style="margin:32px 0 0;color:#1a1a1a;font-weight:500;">Alex</p>
    `,
  });
}

export function nurtureDay14Email(p: AuditEmailPayload) {
  return auditLayout({
    preheader: `Last note on your ${p.hotelName} audit. The door's open.`,
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi there,</p>
      <p style="margin:0 0 16px;">I won't keep filling your inbox. Just a final note: your audit URL stays active for 90 days, and the strategy call offer stands.</p>
      <p style="margin:0 0 16px;">If now isn't the right time, no problem. The audit is yours to keep. If anything in it sparked an idea down the road, the door's open whenever you want to talk.</p>
      ${primaryButton(p.bookingUrl, "Book My Strategy Call")}
      <p style="margin:24px 0 0;font-size:13px;color:#3d3d3d;">Or just reply to this email with a question. I read every reply.</p>
      <p style="margin:32px 0 0;color:#1a1a1a;font-weight:500;">Alex</p>
    `,
  });
}

export interface DailyApprovalNotificationPayload {
  campaignName: string;
  targetCount: number;
  approvalUrl: string;
  targets: Array<{
    hotelName: string;
    contactEmail: string;
    overallScore: number;
    overallGrade: string;
    subject: string;
  }>;
}

export function dailyApprovalNotificationEmail(p: DailyApprovalNotificationPayload) {
  const targetRows = p.targets
    .map(
      (t) => `
      <tr><td style="padding:10px 14px;border-bottom:1px solid #e8e4dd;font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#3d3d3d;">
        <strong style="color:#1a1a1a;">${t.hotelName}</strong>
        <span style="color:#888;"> · ${t.contactEmail} · ${t.overallScore}/${t.overallGrade}</span><br />
        <span style="color:#888;font-size:12px;">${t.subject}</span>
      </td></tr>`
    )
    .join("");

  return auditLayout({
    preheader: `${p.targetCount} sends ready for your morning approval — ${p.campaignName}`,
    bodyHtml: `
      <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:600;color:#1a1a1a;">${p.targetCount} sends ready for your morning approval</h1>
      ${goldDivider()}
      <p style="margin:0 0 12px;">Campaign: <strong>${p.campaignName}</strong></p>
      <p style="margin:0 0 18px;color:#3d3d3d;">Click below to review and approve. Nothing sends until you click.</p>
      ${primaryButton(p.approvalUrl, "Review Today's Batch")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border:1px solid #e8e4dd;border-radius:8px;overflow:hidden;">
        ${targetRows}
      </table>
      <p style="margin:18px 0 0;font-size:12px;color:#888;">If you don't approve by end of day, this batch rolls over to tomorrow's slot.</p>
    `,
  });
}

export interface InternalCampaignAlertPayload {
  campaignName: string;
  campaignId: number;
  reason: string;
  resumeUrl: string;
}

export function internalCampaignAlertEmail(p: InternalCampaignAlertPayload) {
  return auditLayout({
    preheader: `Campaign auto-paused: ${p.campaignName}`,
    bodyHtml: `
      <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:600;color:#c0674a;">Campaign auto-paused</h1>
      ${goldDivider()}
      <p style="margin:0 0 12px;"><strong>${p.campaignName}</strong> (#${p.campaignId}) has been paused.</p>
      <p style="margin:0 0 18px;"><strong>Reason:</strong> ${p.reason}</p>
      <p style="margin:0 0 8px;color:#3d3d3d;">No further sends will go out until you investigate and click resume.</p>
      ${primaryButton(p.resumeUrl, "Open Campaign")}
    `,
  });
}

export interface InternalReplyAlertPayload {
  targetEmail: string;
  hotelName: string;
  subject: string;
  replyPreview: string;
  campaignId: number;
}

export function internalReplyAlertEmail(p: InternalReplyAlertPayload) {
  return auditLayout({
    preheader: `Reply from ${p.targetEmail}: ${p.subject}`,
    bodyHtml: `
      <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:600;color:#5b9a2f;">A prospect replied</h1>
      ${goldDivider()}
      <p style="margin:0 0 6px;"><strong>${p.hotelName}</strong> · ${p.targetEmail}</p>
      <p style="margin:0 0 18px;color:#888;font-size:13px;">Subject: ${p.subject}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;background:#f8f6f1;border-radius:6px;">
        <tr><td style="padding:14px 18px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#3d3d3d;line-height:1.6;white-space:pre-wrap;">${p.replyPreview.slice(0, 600)}</td></tr>
      </table>
      <p style="margin:0;color:#888;font-size:12px;">Reply directly to <a href="mailto:${p.targetEmail}" style="color:#5b9a2f;">${p.targetEmail}</a> from your inbox to continue the conversation.</p>
    `,
  });
}

export interface InternalAuditRequestPayload {
  hotelUrl: string;
  email: string;
  role: "owner" | "gm" | "operator" | "other";
  requestId: number;
}

const ROLE_LABELS: Record<InternalAuditRequestPayload["role"], string> = {
  owner: "Owner",
  gm: "General Manager",
  operator: "Operator",
  other: "Other",
};

export function internalAuditRequestEmail(p: InternalAuditRequestPayload) {
  return auditLayout({
    preheader: `New audit request: ${p.hotelUrl}`,
    bodyHtml: `
      <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:600;color:#1a1a1a;line-height:1.3;">New audit request</h1>
      ${goldDivider()}
      <p style="margin:0 0 18px;">A new Tier 0 audit request just came in.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f1;border:1px solid #e8e4dd;border-radius:8px;">
        <tr><td style="padding:18px 22px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#3d3d3d;line-height:1.7;">
          <p style="margin:0 0 6px;"><strong style="color:#1a1a1a;">Hotel URL:</strong> <a href="${p.hotelUrl}" target="_blank" style="color:#5b9a2f;">${p.hotelUrl}</a></p>
          <p style="margin:0 0 6px;"><strong style="color:#1a1a1a;">Requested by:</strong> ${p.email}</p>
          <p style="margin:0 0 6px;"><strong style="color:#1a1a1a;">Role:</strong> ${ROLE_LABELS[p.role]}</p>
          <p style="margin:0;"><strong style="color:#1a1a1a;">Request ID:</strong> #${p.requestId}</p>
        </td></tr>
      </table>
      <p style="margin:18px 0 0;font-size:13px;color:#3d3d3d;">Run the <code>t0-comprehensive-audit</code> skill on this URL, then post to <code>/api/audit/create</code>. The visitor will get a token-gated audit URL via email when they unlock.</p>
    `,
  });
}


export function bookingConfirmationEmail({
  name,
  formattedDate,
  formattedTime,
}: {
  name: string;
  formattedDate: string;
  formattedTime: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Your Discovery Call is Confirmed</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background-color:#e8e4dd;-webkit-font-smoothing:antialiased;">
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e8e4dd;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <!-- Email container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#1a1a1a;padding:32px 40px;">
              <img src="${LOGO_URL}" alt="Be Nice Hospitality Group" width="200" style="display:block;max-width:200px;height:auto;" />
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="background-color:#ffffff;padding:48px 40px 40px;">
              <!-- Check icon -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td align="center" style="width:56px;height:56px;border-radius:50%;background-color:rgba(91,154,47,0.1);">
                    <span style="font-size:28px;line-height:56px;color:#5b9a2f;">&#10003;</span>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h1 style="margin:0 0 8px;text-align:center;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:26px;font-weight:600;color:#1a1a1a;line-height:1.3;">
                Your Discovery Call is Confirmed
              </h1>

              <!-- Subtle gold divider -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px auto 28px;">
                <tr>
                  <td style="width:48px;height:2px;background-color:#f5a623;border-radius:1px;"></td>
                </tr>
              </table>

              <!-- Greeting -->
              <p style="margin:0 0 12px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:16px;color:#3d3d3d;line-height:1.6;">
                Hi ${name},
              </p>
              <p style="margin:0 0 28px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:16px;color:#3d3d3d;line-height:1.6;">
                Thank you for scheduling a discovery call with Be Nice Hospitality Group. We're looking forward to learning about your property and how we can help.
              </p>

              <!-- Booking details card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f6f1;border-radius:8px;border:1px solid #e8e4dd;">
                <tr>
                  <td style="padding:28px 32px;">
                    <!-- Label -->
                    <p style="margin:0 0 16px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:600;color:#f5a623;text-transform:uppercase;letter-spacing:1.5px;">
                      Booking Details
                    </p>

                    <!-- Date row -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td width="28" valign="top" style="padding-top:2px;">
                          <span style="font-size:16px;">&#128197;</span>
                        </td>
                        <td style="font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.4;">
                          <span style="color:#3d3d3d;font-size:13px;">Date</span><br />
                          <strong>${formattedDate}</strong>
                        </td>
                      </tr>
                    </table>

                    <!-- Time row -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td width="28" valign="top" style="padding-top:2px;">
                          <span style="font-size:16px;">&#128336;</span>
                        </td>
                        <td style="font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.4;">
                          <span style="color:#3d3d3d;font-size:13px;">Time</span><br />
                          <strong>${formattedTime}</strong>
                        </td>
                      </tr>
                    </table>

                    <!-- Duration row -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="28" valign="top" style="padding-top:2px;">
                          <span style="font-size:16px;">&#9202;</span>
                        </td>
                        <td style="font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.4;">
                          <span style="color:#3d3d3d;font-size:13px;">Duration</span><br />
                          <strong>1 hour</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Follow-up text -->
              <p style="margin:28px 0 0;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:15px;color:#3d3d3d;line-height:1.6;">
                We'll follow up with call details before your appointment. If you need to reschedule or have any questions, simply reply to this email.
              </p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px auto 0;">
                <tr>
                  <td align="center" style="border-radius:6px;background-color:#5b9a2f;">
                    <a href="${SITE_URL}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">
                      Visit Our Website
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:15px;font-weight:500;color:#ffffff;">
                Be Nice Hospitality Group
              </p>
              <p style="margin:0 0 16px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;">
                Boutique Hotel Consulting &amp; Management
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                <tr>
                  <td style="width:40px;height:1px;background-color:#f5a623;"></td>
                </tr>
              </table>
              <p style="margin:0;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.6;">
                &copy; ${new Date().getFullYear()} Be Nice Hospitality Group. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
