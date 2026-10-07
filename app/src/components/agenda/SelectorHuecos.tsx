"use client";

import { BotonLadrillo } from "@/components/ui/Ladrillo";
import { useHuecos } from "./FormularioCita";

export function SelectorHuecos({
  fecha,
  servicioId,
  hora,
  onElegir,
}: {
  fecha: string;
  servicioId: string;
  hora: string;
  onElegir: (h: string) => void;
}) {
  const { huecos, cargando } = useHuecos(fecha, servicioId);
  return (
    <fieldset>
      <legend className="font-bold mb-3.5">Horarios libres ese día</legend>
      {cargando ? (
        <div className="text-tinta-2">Buscando huecos…</div>
      ) : huecos.length === 0 ? (
        <div className="hueco p-3">No hay horarios libres ese día. Prueba otro día.</div>
      ) : (
        <div className="grid grid-cols-4 gap-x-2 gap-y-3 display font-semibold text-lg">
          {huecos.map((h) => (
            <BotonLadrillo
              key={h}
              color={h === hora ? "frambuesa" : "pastel"}
              botones={h === hora ? "centro" : false}
              aria-pressed={h === hora}
              className="h-12"
              onClick={() => onElegir(h)}
            >
              {h}
            </BotonLadrillo>
          ))}
        </div>
      )}
    </fieldset>
  );
}
