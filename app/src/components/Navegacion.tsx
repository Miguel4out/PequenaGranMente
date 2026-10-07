"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Marca } from "@/components/ui/Marca";
import { cerrarSesion } from "@/lib/acciones";

const SECCIONES = [
  { href: "/agenda", nombre: "Agenda", icono: IconoAgenda },
  { href: "/clientes", nombre: "Clientes", icono: IconoClientes },
];

/**
 * Menú lateral en escritorio (≥ lg) y barra inferior en tablet y móvil.
 */
export function Navegacion({ nombre }: { nombre: string }) {
  const ruta = usePathname();
  const activo = (href: string) => ruta === href || ruta.startsWith(href + "/");

  return (
    <>
      {/* Escritorio */}
      <nav aria-label="Principal" className="placa hidden lg:flex flex-col gap-7 w-60 shrink-0 p-5">
        <Link href="/agenda" className="no-underline"><Marca alto={54} /></Link>
        <div className="flex flex-col gap-3 display font-semibold text-[17px]">
          {SECCIONES.map(({ href, nombre, icono: Icono }) => (
            <Link
              key={href}
              href={href}
              aria-current={activo(href) ? "page" : undefined}
              className={
                activo(href)
                  ? "ladrillo l-frambuesa con-botones h-[50px] px-4 flex items-center gap-3 no-underline"
                  : "h-12 px-4 flex items-center gap-3 no-underline rounded-ladrillo hover:bg-rosa-nube-3"
              }
            >
              <Icono />
              {nombre}
            </Link>
          ))}
        </div>
        <div className="mt-auto ladrillo l-crema p-3 pb-4 text-[15px] flex flex-col gap-2">
          <div><b>{nombre || "Psicóloga"}</b><br />Psicóloga infantojuvenil</div>
          <form action={cerrarSesion}><button type="submit" className="underline cursor-pointer">Cerrar sesión</button></form>
        </div>
      </nav>

      {/* Tablet y móvil */}
      <nav
        aria-label="Secciones"
        className="lg:hidden fixed bottom-0 inset-x-0 z-20 h-[76px] px-4 pt-3.5 pb-2.5 bg-tinta grid grid-cols-2 gap-2 display font-semibold text-[17px]"
      >
        {SECCIONES.map(({ href, nombre, icono: Icono }) => (
          <Link
            key={href}
            href={href}
            aria-current={activo(href) ? "page" : undefined}
            className={
              activo(href)
                ? "ladrillo l-rosa con-botones botones-centro flex items-center justify-center gap-2 no-underline"
                : "flex items-center justify-center gap-2 text-white no-underline"
            }
          >
            <Icono />
            {nombre}
          </Link>
        ))}
      </nav>
    </>
  );
}

function IconoAgenda() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function IconoClientes() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-6 7-6s7 2 7 6M17 4a4 4 0 0 1 0 8M22 21c0-3-1.5-5-4-5.5" />
    </svg>
  );
}
