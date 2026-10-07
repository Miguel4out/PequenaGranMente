import { Volver } from "@/components/ui/Volver";
import { FormularioPaciente } from "@/components/clientes/FormularioPaciente";

export const metadata = { title: "Nuevo cliente" };

export default function NuevoClientePage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col">
      <header className="placa px-3 pt-5 pb-3.5 flex items-center gap-1 lg:bg-none lg:bg-transparent lg:px-8 lg:pt-7">
        <Volver href="/clientes" />
        <h1 className="text-[26px] lg:text-[34px] font-bold">Nuevo cliente</h1>
      </header>
      <div className="px-5 lg:px-8 pt-5">
        <FormularioPaciente />
      </div>
    </div>
  );
}
