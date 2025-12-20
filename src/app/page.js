import { redirect } from "next/navigation";

export default function RootPage() {
  // Mengarahkan otomatis ke halaman login
  redirect("/login");
}
