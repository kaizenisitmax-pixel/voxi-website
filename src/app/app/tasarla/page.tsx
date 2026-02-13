import { redirect } from "next/navigation";

// Tasarla artık /app ana sayfası — eski URL'yi yönlendir
export default function TasarlaRedirect() {
  redirect("/app");
}
