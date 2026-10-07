import Link from "next/link";
import type { Cita, Bloqueo } from "@/lib/tipos";
import { hora } from "@/lib/fechas";
import { TarjetaCita } from "./TarjetaCita";

type Fila =
  | { tipo: "cita"; cita: Cita }
  | { tipo: "bloqueo"; bloqueo: Bloqueo }
  | { tipo: "hueco"; inicio: string };

/** Lista del día: citas, bloqueos y huecos libres como piezas. */
export function VistaDia({
  fecha,
  citas,
  bloqueos,
  huecos,
  citaSeleccionada,
}: {
  fecha: string;
  citas: Cita[];
  bloqueos: Bloqueo[];
  huecos: { inicio: string; fin: string }[];
  citaSeleccionada?: string;
}) {
  // Huecos que no empiezan dentro de una cita ya listada, y solo uno por hora en punto
  const ocupados = new Set(citas.map((c) => hora(c.inicio)));
  const filas: Fila[] = [
    ...citas.map((c) => ({ tipo: "cita", cita: c }) as Fila),
    ...bloqueos.map((b) => ({ tipo: "bloqueo", bloqueo: b }) as Fila),
    ...huecos
      .filter((h) => hora(h.inicio).endsWith(":00") && !ocupados.has(hora(h.inicio)))
      .map((h) => ({ tipo: "hueco", inicio: h.inicio }) as Fila),
  ].sort((a, b) => instante(a).localeCompare(instante(b)));

  if (filas.length === 0) {
    return (
      <div className="tarjeta p-6 pb-8 text-center">
        <b>No hay citas ni horario de atención este día.</b>
        <div className="text-tinta-2">Configura tu horario en Horarios para ver huecos libres.</div>
      </div>
    );
  }

  return (
    <section aria-label="Citas del día" className="flex flex-col gap-4">
      {filas.map((f) => {
        if (f.tipo === "cita") {
          return (
            <TarjetaCita
              key={f.cita.id}
              cita={f.cita}
              seleccionada={f.cita.id === citaSeleccionada}
              href={`/agenda?fecha=${fecha}&vista=dia&cita=${f.cita.id}`}
            />
          );
        }
        if (f.tipo === "bloqueo") {
          return (
            <div key={f.bloqueo.id} className="h-[54px] rounded-ladrillo bg-arena-2 text-tinta-2 flex items-center">
              <b className="w-20 shrink-0 text-center display text-[22px]">{hora(f.bloqueo.inicio)}</b>
              <span className="px-3.5">{f.bloqueo.motivo ?? "No disponible"} · hasta las {hora(f.bloqueo.fin)}</span>
            </div>
          );
        }
        return (
          <Link
            key={f.inicio}
            href={`/agenda/nueva?fecha=${fecha}&hora=${hora(f.inicio)}`}
            className="hueco h-[52px] flex items-center no-underline"
          >
            <b className="w-20 shrink-0 text-center display text-[22px]">{hora(f.inicio)}</b>
            <span className="px-3.5 mr-auto">Libre · Agendar aquí</span>
            <svg className="mr-3.5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          </Link>
        );
      })}
    </section>
  );
}

function instante(f: Fila) {
  return f.tipo === "cita" ? f.cita.inicio : f.tipo === "bloqueo" ? f.bloqueo.inicio : f.inicio;
}
