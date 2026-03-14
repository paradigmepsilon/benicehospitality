const SITE_URL = "https://benicehospitalitygroup.com";
const LOGO_URL = `${SITE_URL}/images/logo-horizontal.png`;

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
                          <strong>30 minutes</strong>
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
