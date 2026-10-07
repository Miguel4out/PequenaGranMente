"use client";

import { useActionState, useEffect, useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { crearCita, type Resultado } from "@/lib/acciones";
import type { PacienteResumen, Servicio } from "@/lib/tipos";
import { BotonLadrillo } from "@/components/ui/Ladrillo";
import { SelectorHuecos } from "./SelectorHuecos";

export function FormularioCita({
  pacientes,
  servicios,
  fechaInicial,
  horaInicial,
  pacienteInicial,
}: {
  pacientes: PacienteResumen[];
  servicios: Servicio[];
  fechaInicial: string;
  horaInicial?: string;
  pacienteInicial?: string;
}) {
  const [resultado, accion, pendiente] = useActionState<Resultado | null, FormData>(crearCita, null);
  const [servicioId, setServicioId] = useState(servicios.find((s) => s.nombre === "Seguimiento")?.id ?? servicios[0]?.id ?? "");
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState(horaInicial ?? "");
  const [modalidad, setModalidad] = useState<"presencial" | "en_linea">("presencial");
  const servicio = servicios.find((s) => s.id === servicioId);

  return (
    <form action={accion} className="flex flex-col gap-5 pb-8">
      <input type="hidden" name="servicio_id" value={servicioId} />
      <input type="hidden" name="hora" value={hora} />
      <input type="hidden" name="modalidad" value={modalidad} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="paciente" className="font-bold">¿Para quién es?</label>
        <select id="paciente" name="paciente_id" required defaultValue={pacienteInicial ?? ""} className="campo">
          <option value="" disabled>Elige un cliente</option>
          {pacientes.filter((p) => p.activo).map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
          ))}
        </select>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-bold mb-2">Tipo de cita</legend>
        <div className="grid grid-cols-2 gap-2">
          {servicios.map((s) => (
            <BotonLadrillo
              key={s.id}
              color={s.id === servicioId ? s.color : "crema"}
              aria-pressed={s.id === servicioId}
              className="h-[50px]"
              onClick={() => { setServicioId(s.id); setHora(""); }}
            >
              {s.nombre} · {s.duracion_min}
            </BotonLadrillo>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fecha" className="font-bold">Día</label>
        <input id="fecha" name="fecha" type="date" required className="campo" value={fecha} onChange={(e) => { setFecha(e.target.value); setHora(""); }} />
      </div>

      <SelectorHuecos fecha={fecha} servicioId={servicioId} hora={hora} onElegir={setHora} />

      <fieldset>
        <legend className="font-bold mb-2">¿Cómo será?</legend>
        <div className="grid grid-cols-2 gap-1 p-1 rounded-ladrillo bg-arena-2">
          {(["presencial", "en_linea"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={modalidad === m}
              onClick={() => setModalidad(m)}
              className={`h-11 rounded cursor-pointer ${modalidad === m ? "bg-crema-2 font-bold" : ""}`}
            >
              {m === "presencial" ? "Presencial" : "En línea"}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nota" className="font-bold">Nota para esta cita <span className="font-normal text-tinta-2">(opcional)</span></label>
        <input id="nota" name="nota" type="text" className="campo" placeholder="Ej. Llega directo de la escuela" maxLength={300} />
      </div>

      {resultado && !resultado.ok && <div role="alert" className="hueco p-3 font-bold">{resultado.error}</div>}

      <div className="flex flex-col gap-3 pt-2">
        {hora && servicio && (
          <div className="text-center text-[15px]">{fecha} · {hora} · {servicio.duracion_min} min</div>
        )}
        <BotonLadrillo type="submit" color="frambuesa" botones className="h-[58px] display text-xl font-semibold" disabled={pendiente || !hora}>
          {pendiente ? "Guardando…" : "Guardar cita"}
        </BotonLadrillo>
      </div>
    </form>
  );
}

/** Carga los huecos libres desde Supabase en el navegador (usa la sesión del usuario). */
export function useHuecos(fecha: string, servicioId: string) {
  // Guardamos la clave con la que se cargaron los huecos: si no coincide, estamos cargando.
  const [estado, setEstado] = useState<{ clave: string; huecos: string[] }>({ clave: "", huecos: [] });
  const clave = `${fecha}|${servicioId}`;
  useEffect(() => {
    if (!fecha || !servicioId) return;
    let vivo = true;
    const supabase = crearClienteNavegador();
    supabase.rpc("huecos_internos", { p_servicio_id: servicioId, p_fecha: fecha }).then(({ data }) => {
      if (!vivo) return;
      const horas = (data ?? []).map((h: { inicio: string }) =>
        new Date(h.inicio).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: false, timeZone: "America/Mexico_City" }),
      );
      setEstado({ clave, huecos: horas });
    });
    return () => { vivo = false; };
  }, [fecha, servicioId, clave]);
  return { huecos: estado.clave === clave ? estado.huecos : [], cargando: estado.clave !== clave };
}
