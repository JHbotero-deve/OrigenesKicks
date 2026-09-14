import { redirect } from "next/navigation";

export default function Home() {
  // Ahora el login es la puerta de entrada obligatoria
  redirect("/login");
}
