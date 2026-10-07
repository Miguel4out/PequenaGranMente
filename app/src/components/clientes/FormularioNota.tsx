"use client";

import { useActionState, useEffect, useRef } from "react";
import { agregarNota, type Resultado } from "@/lib/acciones";
import { BotonLadrillo } from "@/components/ui/Ladrillo";

export function FormularioNota({ pacienteId }: { pacienteId: string }) {
  const [resultado, accion, pendiente] = useActionState<Resultado | null, FormData>(agregarNota, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (resultado?.ok) ref.current?.reset();
  }, [resultado]);
  return (
    <form ref={ref} action={accion} className="flex flex-wrap gap-2.5">
      <input type="hidden" name="paciente_id" value={pacienteId} />
      <label htmlFor="texto" className="sr-only">Nueva nota</label>
      <input id="texto" name="texto" type="text" required maxLength={1000} placeholder="Escribe una nota…" className="campo flex-[1_1_260px] !w-auto" />
      <BotonLadrillo type="submit" color="pastel" className="h-[52px] px-5" disabled={pendiente}>{pendiente ? "Guardando…" : "Guardar nota"}</BotonLadrillo>
      {resultado && !resultado.ok && <div role="alert" className="w-full font-bold">{resultado.error}</div>}
    </form>
  );
}
