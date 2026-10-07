import { Navegacion } from "@/components/Navegacion";
import { usuarioActual } from "@/lib/datos";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioActual();
  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-dvh">
      <Navegacion nombre={usuario?.nombre ?? ""} />
      <main className="flex-1 min-w-0 pb-24 lg:pb-8">{children}</main>
    </div>
  );
}
