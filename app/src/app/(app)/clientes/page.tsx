import Link from "next/link";
import Image from "next/image";
import { pacientes } from "@/lib/datos";
import { edad } from "@/lib/fechas";
import { EnlaceLadrillo } from "@/components/ui/Ladrillo";

export const metadata = { title: "Clientes" };

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const lista = await pacientes(q);

  return (
    <div className="flex flex-col gap-5">
      <header className="placa lg:bg-none lg:bg-transparent px-5 pt-5 pb-5 lg:px-8 lg:pt-7 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Image src="/marca/texto.png" alt="pequeña gran mente" width={122} height={56} className="lg:hidden" priority />
          <h1 className="text-[28px] lg:text-[34px] font-bold ml-auto lg:ml-0 lg:mr-auto">Clientes</h1>
          <EnlaceLadrillo href="/clientes/nuevo" color="frambuesa" botones className="hidden lg:inline-flex h-[50px] px-5 display text-lg font-semibold">+ Nuevo cliente</EnlaceLadrillo>
        </div>
        <form className="flex gap-2" role="search">
          <label htmlFor="q" className="sr-only">Buscar cliente</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Buscar por nombre…" className="campo" />
          <button type="submit" className="ladrillo l-pastel h-[52px] px-5 font-bold">Buscar</button>
        </form>
      </header>

      <div className="px-5 lg:px-8 flex flex-col gap-3 pb-6">
        {lista.length === 0 && (
          <div className="tarjeta p-6 pb-8 text-center">
            <b>{q ? "No encontramos a nadie con ese nombre." : "Todavía no hay clientes."}</b>
            <div className="text-tinta-2">Agrega el primero con el botón de abajo.</div>
          </div>
        )}
        {lista.map((p) => {
          const anios = edad(p.fecha_nacimiento);
          return (
            <Link
              key={p.id}
              href={`/clientes/${p.id}`}
              className={`tarjeta flex items-center gap-3.5 p-3.5 pb-5 no-underline ${p.activo ? "" : "opacity-60"}`}
            >
              <span className="ladrillo l-rosa w-12 h-12 flex items-center justify-center display font-bold text-lg">
                {(p.nombre[0] ?? "") + (p.apellidos[0] ?? "")}
              </span>
              <span className="flex flex-col min-w-0">
                <b className="text-lg truncate">{p.nombre} {p.apellidos}</b>
                <span className="text-[15px] text-tinta-2">{anios !== null ? `${anios} años` : "Edad sin registrar"}{p.activo ? "" : " · Inactivo"}</span>
              </span>
              <span className="ml-auto text-tinta-3" aria-hidden="true">›</span>
            </Link>
          );
        })}
      </div>

      <Link
        href="/clientes/nuevo"
        aria-label="Nuevo cliente"
        className="lg:hidden ladrillo l-frambuesa con-botones fixed right-5 bottom-24 z-10 w-16 h-[60px] flex items-center justify-center"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </Link>
    </div>
  );
}
