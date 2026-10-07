import { pacientes, servicios } from "@/lib/datos";
import { hoy } from "@/lib/fechas";
import { FormularioCita } from "@/components/agenda/FormularioCita";
import { Volver } from "@/components/ui/Volver";

export const metadata = { title: "Nueva cita" };

export default async function NuevaCitaPage({ searchParams }: { searchParams: Promise<{ fecha?: string; hora?: string; paciente?: string }> }) {
  const sp = await searchParams;
  const [lista, servs] = await Promise.all([pacientes(), servicios()]);
  return (
    <div className="max-w-2xl mx-auto flex flex-col">
      <header className="placa px-3 pt-5 pb-3.5 flex items-center gap-1 lg:bg-none lg:bg-transparent lg:px-8 lg:pt-7">
        <Volver href={`/agenda?fecha=${sp.fecha ?? hoy()}&vista=dia`} />
        <h1 className="text-[26px] lg:text-[34px] font-bold">Nueva cita</h1>
      </header>
      <div className="px-5 lg:px-8 pt-5">
        <FormularioCita
          pacientes={lista}
          servicios={servs}
          fechaInicial={sp.fecha ?? hoy()}
          horaInicial={sp.hora}
          pacienteInicial={sp.paciente}
        />
      </div>
    </div>
  );
}
