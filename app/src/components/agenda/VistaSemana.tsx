import Link from "next/link";
import type { Cita, Bloqueo } from "@/lib/tipos";
import { DIAS_CORTOS, fechaLocal, minutosDelDia, sumarDias } from "@/lib/fechas";
import { TarjetaCita } from "./TarjetaCita";

const HORA_INI = 9;
const HORA_FIN = 19;
const ALTO_HORA = 64;

export function VistaSemana({
  lunes,
  hoy,
  citas,
  bloqueos,
  citaSeleccionada,
}: {
  lunes: string;
  hoy: string;
  citas: Cita[];
  bloqueos: Bloqueo[];
  citaSeleccionada?: string;
}) {
  const dias = Array.from({ length: 6 }, (_, i) => sumarDias(lunes, i));
  const alto = (HORA_FIN - HORA_INI) * ALTO_HORA;
  const top = (iso: string) => ((minutosDelDia(iso) - HORA_INI * 60) / 60) * ALTO_HORA;

  return (
    <section aria-label="Calendario de la semana" className="tarjeta pb-3 overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[64px_repeat(6,minmax(0,1fr))] pt-4 pb-2.5 text-center display">
          <div />
          {dias.map((d, i) => {
            const esHoy = d === hoy;
            return (
              <div key={d} className="flex justify-center">
                <Link
                  href={`/agenda?fecha=${d}&vista=dia`}
                  className={`flex items-center justify-center gap-1.5 w-[76px] h-12 no-underline ${esHoy ? "ladrillo l-frambuesa con-botones botones-centro" : "rounded-ladrillo hover:bg-rosa-nube"}`}
                  aria-label={`Ver el ${d}`}
                >
                  <span className="text-sm font-semibold">{DIAS_CORTOS[i]}</span>
                  <span className="text-[22px] font-bold">{Number(d.slice(-2))}</span>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[64px_repeat(6,minmax(0,1fr))]">
          <div className="text-[13px] text-tinta-2 text-right pr-2.5" style={{ height: alto }}>
            {Array.from({ length: HORA_FIN - HORA_INI }, (_, i) => (
              <div key={i} className="pt-1 box-border" style={{ height: ALTO_HORA }}>{HORA_INI + i}:00</div>
            ))}
          </div>
          {dias.map((d) => (
            <div
              key={d}
              className={`relative border-l border-arena-3 ${d === hoy ? "bg-[#fef3f6]" : ""}`}
              style={{
                height: alto,
                backgroundImage: "linear-gradient(var(--arena-3) 1px, transparent 1px)",
                backgroundSize: `100% ${ALTO_HORA}px`,
              }}
            >
              {bloqueos
                .filter((b) => fechaLocal(b.inicio) === d)
                .map((b) => (
                  <div
                    key={b.id}
                    className="absolute left-1 right-1 box-border rounded-ladrillo px-2 py-1.5 bg-arena-2 text-tinta-2 text-[13px]"
                    style={{ top: top(b.inicio) + 2, height: top(b.fin) - top(b.inicio) - 4 }}
                  >
                    {b.motivo ?? "No disponible"}
                  </div>
                ))}
              {citas
                .filter((c) => fechaLocal(c.inicio) === d)
                .map((c) => (
                  <TarjetaCita
                    key={c.id}
                    cita={c}
                    compacta
                    seleccionada={c.id === citaSeleccionada}
                    href={`/agenda?fecha=${d}&cita=${c.id}`}
                    style={{ top: top(c.inicio) + 8, height: top(c.fin) - top(c.inicio) - 10 }}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
