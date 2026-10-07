import Link from "next/link";
import Image from "next/image";
import { citasEntre, bloqueosEntre, cita as cargarCita, huecos, servicios } from "@/lib/datos";
import { crearClienteServidor } from "@/lib/supabase/server";
import { DIAS_CORTOS, diaLargo, hoy as fechaHoy, lunesDe, sumarDias, tituloSemana } from "@/lib/fechas";
import { VistaSemana } from "@/components/agenda/VistaSemana";
import { VistaDia } from "@/components/agenda/VistaDia";
import { DetalleCita } from "@/components/agenda/DetalleCita";
import { EnlaceLadrillo } from "@/components/ui/Ladrillo";

export const metadata = { title: "Agenda" };

type Busqueda = { fecha?: string; vista?: "semana" | "dia"; cita?: string };

export default async function AgendaPage({ searchParams }: { searchParams: Promise<Busqueda> }) {
  const sp = await searchParams;
  const hoy = fechaHoy();
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(sp.fecha ?? "") ? sp.fecha! : hoy;
  const vista = sp.vista === "dia" ? "dia" : "semana";
  const lunes = lunesDe(fecha);
  const dias = Array.from({ length: 6 }, (_, i) => sumarDias(lunes, i));

  const [citas, bloqueos, lista] = await Promise.all([
    citasEntre(lunes, sumarDias(lunes, 7)),
    bloqueosEntre(lunes, sumarDias(lunes, 7)),
    servicios(),
  ]);
  const citasDia = citas.filter((c) => c.inicio >= "" && esDelDia(c.inicio, fecha));
  const huecosDia = vista === "dia" && lista[0] ? await huecos(fecha, lista.find((s) => s.duracion_min === 60)?.id ?? lista[0].id) : [];

  const seleccionada = sp.cita ? (citas.find((c) => c.id === sp.cita) ?? (await cargarCita(sp.cita))) : null;
  const tutor = seleccionada ? await tutorPrincipal(seleccionada.paciente.id) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Cabecera en tablet y móvil */}
      <header className="placa lg:hidden px-5 pt-5 pb-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Image src="/marca/texto.png" alt="pequeña gran mente" width={122} height={56} priority />
          <div className="ml-auto flex flex-col text-right">
            <h1 className="text-[28px] font-bold leading-none">{fecha === hoy ? "Hoy" : diaLargo(fecha).split(" ")[0]}, {diaLargo(fecha).split(" ").slice(1, 2)}</h1>
            <span className="text-[15px]">{citasDia.length} citas</span>
          </div>
        </div>
        <SelectorDias dias={dias} fecha={fecha} hoy={hoy} vista="dia" />
      </header>

      {/* Cabecera en escritorio */}
      <header className="hidden lg:flex flex-wrap items-center gap-4 px-8 pt-7">
        <div className="mr-auto">
          <h1 className="text-[34px] font-bold leading-tight">Agenda</h1>
          <div className="text-[17px] text-tinta-2">{vista === "semana" ? tituloSemana(lunes) : diaLargo(fecha)}</div>
        </div>
        <div className="flex items-center gap-2">
          <EnlaceLadrillo href={`/agenda?fecha=${vista === "semana" ? sumarDias(lunes, -7) : sumarDias(fecha, -1)}&vista=${vista}`} color="crema" className="w-[46px] h-[46px]" aria-label="Anterior"><Flecha dir="izq" /></EnlaceLadrillo>
          <EnlaceLadrillo href={`/agenda?vista=${vista}`} color="crema" className="h-[46px] px-4">Hoy</EnlaceLadrillo>
          <EnlaceLadrillo href={`/agenda?fecha=${vista === "semana" ? sumarDias(lunes, 7) : sumarDias(fecha, 1)}&vista=${vista}`} color="crema" className="w-[46px] h-[46px]" aria-label="Siguiente"><Flecha dir="der" /></EnlaceLadrillo>
        </div>
        <div role="group" aria-label="Vista" className="flex gap-1 p-1 rounded-ladrillo bg-arena-2">
          <Link href={`/agenda?fecha=${fecha}&vista=dia`} className={`h-10 px-4 flex items-center rounded no-underline ${vista === "dia" ? "bg-crema-2 font-bold" : ""}`}>Día</Link>
          <Link href={`/agenda?fecha=${fecha}&vista=semana`} className={`h-10 px-4 flex items-center rounded no-underline ${vista === "semana" ? "bg-crema-2 font-bold" : ""}`}>Semana</Link>
        </div>
        <EnlaceLadrillo href={`/agenda/nueva?fecha=${fecha}`} color="frambuesa" botones className="h-[50px] px-5 display text-lg font-semibold">
          <Mas /> Nueva cita
        </EnlaceLadrillo>
      </header>

      <div className="px-5 lg:px-8 flex flex-col gap-5">
        {vista === "semana" && (
          <div className="hidden lg:flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
            {lista.map((s) => (
              <span key={s.id} className="flex items-center gap-2"><span className={`w-[18px] h-[18px] rounded ladrillo l-${s.color} !p-0 !shadow-none`} />{s.nombre}</span>
            ))}
            <span className="flex items-center gap-2"><span className="w-[18px] h-[18px] rounded hueco" />Por confirmar</span>
            <span className="flex items-center gap-2"><span className="w-[18px] h-[18px] rounded bg-arena-2" />No disponible</span>
          </div>
        )}

        <div className="flex flex-wrap gap-6 items-start">
          <div className="flex-[999_1_560px] min-w-0">
            {vista === "semana" ? (
              <div className="hidden lg:block">
                <VistaSemana lunes={lunes} hoy={hoy} citas={citas} bloqueos={bloqueos} citaSeleccionada={seleccionada?.id} />
              </div>
            ) : null}
            <div className={vista === "semana" ? "lg:hidden" : ""}>
              <VistaDia fecha={fecha} citas={citasDia} bloqueos={bloqueos.filter((b) => esDelDia(b.inicio, fecha))} huecos={vista === "dia" ? huecosDia : []} citaSeleccionada={seleccionada?.id} />
            </div>
          </div>
          {seleccionada && (
            <div className="flex-[1_1_300px] min-w-0 w-full lg:w-auto">
              <DetalleCita cita={seleccionada} tutor={tutor} />
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante en tablet y móvil */}
      <Link
        href={`/agenda/nueva?fecha=${fecha}`}
        aria-label="Nueva cita"
        className="lg:hidden ladrillo l-frambuesa con-botones fixed right-5 bottom-24 z-10 w-16 h-[60px] flex items-center justify-center"
      >
        <Mas grande />
      </Link>
    </div>
  );
}

function SelectorDias({ dias, fecha, hoy, vista }: { dias: string[]; fecha: string; hoy: string; vista: string }) {
  return (
    <div role="group" aria-label="Días de la semana" className="grid grid-cols-6 gap-1.5 pt-2 display">
      {dias.map((d, i) => {
        const activo = d === fecha;
        return (
          <Link
            key={d}
            href={`/agenda?fecha=${d}&vista=${vista}`}
            aria-current={activo ? "date" : undefined}
            className={`ladrillo con-botones botones-centro h-[58px] flex flex-col items-center justify-center no-underline ${activo ? "l-frambuesa" : "l-pastel"}`}
          >
            <span className="text-[13px] font-semibold leading-none">{DIAS_CORTOS[i]}</span>
            <span className="text-[23px] font-bold leading-tight">{Number(d.slice(-2))}{d === hoy && !activo ? "·" : ""}</span>
          </Link>
        );
      })}
    </div>
  );
}

function esDelDia(iso: string, fecha: string) {
  // comparación en la zona del consultorio
  const d = new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
  return d === fecha;
}

async function tutorPrincipal(pacienteId: string) {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("tutor_paciente")
    .select("parentesco, tutor:tutores ( nombre, telefono )")
    .eq("paciente_id", pacienteId)
    .order("es_principal", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const t = data.tutor as unknown as { nombre: string; telefono: string | null } | null;
  return t ? { nombre: t.nombre, parentesco: data.parentesco, telefono: t.telefono } : null;
}

function Flecha({ dir }: { dir: "izq" | "der" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "izq" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
function Mas({ grande = false }: { grande?: boolean }) {
  const s = grande ? 28 : 20;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
  );
}
