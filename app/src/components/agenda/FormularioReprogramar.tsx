"use client";

import { useActionState, useState } from "react";
import { reprogramarCita, type Resultado } from "@/lib/acciones";
import { BotonLadrillo } from "@/components/ui/Ladrillo";
import { SelectorHuecos } from "./SelectorHuecos";

export function FormularioReprogramar({ id, servicioId, fechaInicial }: { id: string; servicioId: string; fechaInicial: string }) {
  const [resultado, accion, pendiente] = useActionState<Resultado | null, FormData>(reprogramarCita, null);
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState("");
  return (
    <form action={accion} className="flex flex-col gap-5 pb-8">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="hora" value={hora} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fecha" className="font-bold">Nuevo día</label>
        <input id="fecha" name="fecha" type="date" required className="campo" value={fecha} onChange={(e) => { setFecha(e.target.value); setHora(""); }} />
      </div>
      <SelectorHuecos fecha={fecha} servicioId={servicioId} hora={hora} onElegir={setHora} />
      {resultado && !resultado.ok && <div role="alert" className="hueco p-3 font-bold">{resultado.error}</div>}
      <BotonLadrillo type="submit" color="frambuesa" botones className="h-[58px] display text-xl font-semibold" disabled={pendiente || !hora}>
        {pendiente ? "Guardando…" : "Guardar cambio"}
      </BotonLadrillo>
    </form>
  );
}
