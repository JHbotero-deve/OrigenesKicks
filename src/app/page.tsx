import { redirect } from "next/navigation";

export default function Home() {
  // Redirigimos directamente a la vitrina de productos que es el corazón del negocio
  redirect("/products");
}
