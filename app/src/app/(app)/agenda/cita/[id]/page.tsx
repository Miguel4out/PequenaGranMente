import { notFound } from "next/navigation";
import { cita as cargarCita } from "@/lib/datos";
import { fechaLocal, hora } from "@/lib/fechas";
import { Volver } from "@/components/ui/Volver";
import { FormularioReprogramar } from "@/components/agenda/FormularioReprogramar";

export const metadata = { title: "Cambiar día u hora" };

export default async function ReprogramarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await cargarCita(id);
  if (!c) notFound();
  const fecha = fechaLocal(c.inicio);
  return (
    <div className="max-w-2xl mx-auto flex flex-col">
      <header className="placa px-3 pt-5 pb-3.5 flex items-center gap-1 lg:bg-none lg:bg-transparent lg:px-8 lg:pt-7">
        <Volver href={`/agenda?fecha=${fecha}&vista=dia&cita=${id}`} />
        <h1 className="text-[26px] lg:text-[34px] font-bold">Cambiar día u hora</h1>
      </header>
      <div className="px-5 lg:px-8 pt-5 flex flex-col gap-5">
        <div className="ladrillo l-nube con-botones p-4 pb-5">
          <b>{c.paciente.nombre} {c.paciente.apellidos}</b> · {c.servicio.nombre}<br />
          Actualmente: {fecha} a las {hora(c.inicio)}
        </div>
        <FormularioReprogramar id={id} servicioId={c.servicio.id} fechaInicial={fecha} />
      </div>
    </div>
  );
}
