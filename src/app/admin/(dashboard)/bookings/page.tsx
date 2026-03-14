import { redirect } from "next/navigation";

export default function BookingsRedirect() {
  redirect("/admin/schedule?view=list");
}
