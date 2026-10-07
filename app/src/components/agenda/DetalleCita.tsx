import Link from "next/link";
import type { Cita } from "@/lib/tipos";
import { ETIQUETA_ESTADO, ETIQUETA_MODALIDAD } from "@/lib/tipos";
import { diaLargo, edad, fechaLocal, hora } from "@/lib/fechas";
import { cambiarEstadoCita } from "@/lib/acciones";
import { BotonLadrillo, EnlaceLadrillo } from "@/components/ui/Ladrillo";

/** Panel lateral con los datos de una cita y sus acciones. */
export function DetalleCita({ cita, tutor }: { cita: Cita; tutor?: { nombre: string; parentesco: string; telefono: string | null } | null }) {
  const iniciales = `${cita.paciente.nombre[0] ?? ""}${cita.paciente.apellidos[0] ?? ""}`.toUpperCase();
  const anios = edad(cita.paciente.fecha_nacimiento);
  const viva = cita.estado === "confirmada" || cita.estado === "por_confirmar";

  return (
    <aside aria-label="Detalle de la cita" className="tarjeta p-6 pb-8 flex flex-col gap-4">
      <div className="flex items-center gap-3.5">
        <div className="ladrillo l-rosa w-[54px] h-[54px] flex items-center justify-center display text-xl font-bold">{iniciales}</div>
        <div>
          <h2 className="text-[23px] font-bold leading-tight">{cita.paciente.nombre} {cita.paciente.apellidos}</h2>
          {anios !== null && <span className="text-tinta-2">{anios} años</span>}
        </div>
      </div>

      <span className={`self-start px-3 py-1 rounded text-sm font-bold ${cita.estado === "por_confirmar" ? "hueco" : "bg-rosa-nube"}`}>
        {ETIQUETA_ESTADO[cita.estado]}
      </span>

      <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 gap-y-2.5">
        <dt className="text-tinta-2">Servicio</dt><dd className="font-bold">{cita.servicio.nombre}</dd>
        <dt className="text-tinta-2">Día</dt><dd className="font-bold">{diaLargo(fechaLocal(cita.inicio))}</dd>
        <dt className="text-tinta-2">Hora</dt><dd className="font-bold">{hora(cita.inicio)} a {hora(cita.fin)}</dd>
        <dt className="text-tinta-2">Modalidad</dt><dd className="font-bold">{ETIQUETA_MODALIDAD[cita.modalidad]}</dd>
        {tutor && (
          <>
            <dt className="text-tinta-2">Acompaña</dt><dd className="font-bold">{tutor.nombre} ({tutor.parentesco.toLowerCase()})</dd>
            <dt className="text-tinta-2">Teléfono</dt><dd className="font-bold">{tutor.telefono ?? "—"}</dd>
          </>
        )}
      </dl>

      {cita.nota && (
        <div className="p-3.5 rounded-ladrillo bg-rosa-nube text-[15px]"><b>Nota para esta cita</b><br />{cita.nota}</div>
      )}

      <div className="flex flex-col gap-2.5 mt-1">
        <EnlaceLadrillo href={`/clientes/${cita.paciente.id}`} color="frambuesa" className="h-[50px]">Ver perfil del cliente</EnlaceLadrillo>
        {viva && (
          <>
            <EnlaceLadrillo href={`/agenda/cita/${cita.id}`} color="pastel" className="h-[50px]">Cambiar día u hora</EnlaceLadrillo>
            {cita.estado === "por_confirmar" && (
              <form action={cambiarEstadoCita.bind(null, cita.id, "confirmada")}>
                <BotonLadrillo type="submit" color="rosa" className="h-[50px] w-full">Confirmar cita</BotonLadrillo>
              </form>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              <form action={cambiarEstadoCita.bind(null, cita.id, "completada")}>
                <BotonLadrillo type="submit" color="crema" className="h-12 w-full">Asistió</BotonLadrillo>
              </form>
              <form action={cambiarEstadoCita.bind(null, cita.id, "no_asistio")}>
                <BotonLadrillo type="submit" color="crema" className="h-12 w-full">No asistió</BotonLadrillo>
              </form>
            </div>
            <form action={cambiarEstadoCita.bind(null, cita.id, "cancelada")}>
              <button type="submit" className="h-12 w-full rounded-ladrillo border-2 border-tinta font-bold cursor-pointer">Cancelar cita</button>
            </form>
          </>
        )}
        <Link href={`/agenda?fecha=${fechaLocal(cita.inicio)}`} className="text-center underline text-[15px]">Cerrar</Link>
      </div>
    </aside>
  );
}
