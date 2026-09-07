import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { listApplications } from "@/lib/management/applications";

function csvField(value: string | number | null): string {
  const str = value === null ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const status = searchParams.get("status") || undefined;

  const applications = await listApplications({ status });

  if (format === "csv") {
    const header = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Asset",
      "Asset Count",
      "State",
      "City",
      "Current Status",
      "Timeline",
      "Wants",
      "Heard From",
      "Status",
      "Booking ID",
      "Notes",
      "Created At",
    ].join(",");
    const rows = applications.map((a) =>
      [
        a.id,
        csvField(a.name),
        csvField(a.email),
        csvField(a.phone),
        csvField(a.asset),
        a.assetCount,
        csvField(a.state),
        csvField(a.city),
        csvField(a.currentStatus),
        csvField(a.timeline),
        csvField(a.wants),
        csvField(a.heardFrom),
        csvField(a.status),
        a.bookingId ?? "",
        csvField(a.notes),
        csvField(a.createdAt),
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=management-applications.csv",
      },
    });
  }

  return NextResponse.json(applications);
}
