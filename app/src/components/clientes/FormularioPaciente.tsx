"use client";

import { useActionState } from "react";
import { crearPaciente, type Resultado } from "@/lib/acciones";
import { BotonLadrillo } from "@/components/ui/Ladrillo";

function Campo({ id, etiqueta, opcional, ...rest }: { id: string; etiqueta: string; opcional?: boolean } & React.ComponentProps<"input">) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">{etiqueta}{opcional && <span className="font-normal text-tinta-2"> (opcional)</span>}</label>
      <input id={id} name={id} className="campo" {...rest} />
    </div>
  );
}

export function FormularioPaciente() {
  const [resultado, accion, pendiente] = useActionState<Resultado | null, FormData>(crearPaciente, null);
  return (
    <form action={accion} className="flex flex-col gap-6 pb-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-[22px] font-semibold">Datos del niño o niña</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo id="nombre" etiqueta="Nombre" required autoComplete="off" />
          <Campo id="apellidos" etiqueta="Apellidos" required autoComplete="off" />
          <Campo id="fecha_nacimiento" etiqueta="Fecha de nacimiento" type="date" opcional />
          <Campo id="grado" etiqueta="Grado escolar" placeholder="Ej. 3.º de primaria" opcional />
          <Campo id="escuela" etiqueta="Escuela" opcional />
          <Campo id="horario_preferido" etiqueta="Horario ideal" placeholder="Ej. Mañanas" opcional />
        </div>
        <fieldset>
          <legend className="font-bold mb-2">Modalidad preferida</legend>
          <div className="grid grid-cols-3 gap-2">
            {[["", "Sin preferencia"], ["presencial", "Presencial"], ["en_linea", "En línea"]].map(([v, t]) => (
              <label key={v} className="ladrillo l-crema h-12 flex items-center justify-center gap-2 cursor-pointer has-[:checked]:l-rosa">
                <input type="radio" name="modalidad_preferida" value={v} defaultChecked={v === ""} className="sr-only" />
                {t}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-[22px] font-semibold">Mamá, papá o tutor principal</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo id="tutor_nombre" etiqueta="Nombre" autoComplete="off" />
          <Campo id="tutor_apellidos" etiqueta="Apellidos" autoComplete="off" />
          <Campo id="tutor_parentesco" etiqueta="Parentesco" placeholder="Mamá, papá, abuela…" />
          <Campo id="tutor_telefono" etiqueta="Teléfono" type="tel" inputMode="tel" placeholder="10 dígitos" />
          <Campo id="tutor_correo" etiqueta="Correo" type="email" opcional />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tutor_medio" className="font-bold">¿Cómo prefiere que le avisen?</label>
            <select id="tutor_medio" name="tutor_medio" className="campo" defaultValue="whatsapp">
              <option value="whatsapp">WhatsApp</option>
              <option value="llamada">Llamada</option>
              <option value="correo">Correo</option>
            </select>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-[22px] font-semibold">Contacto de emergencia <span className="font-normal text-tinta-2 text-base">(opcional)</span></h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Campo id="em_nombre" etiqueta="Nombre" autoComplete="off" />
          <Campo id="em_parentesco" etiqueta="Parentesco" />
          <Campo id="em_telefono" etiqueta="Teléfono" type="tel" inputMode="tel" />
        </div>
      </section>

      {resultado && !resultado.ok && <div role="alert" className="hueco p-3 font-bold">{resultado.error}</div>}

      <BotonLadrillo type="submit" color="frambuesa" botones className="h-[58px] display text-xl font-semibold" disabled={pendiente}>
        {pendiente ? "Guardando…" : "Guardar cliente"}
      </BotonLadrillo>
    </form>
  );
}
