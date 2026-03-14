import { redirect } from "next/navigation";

export default function AvailabilityRedirect() {
  redirect("/admin/schedule?view=settings");
}
