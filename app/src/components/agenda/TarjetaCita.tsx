import Link from "next/link";
import type { Cita } from "@/lib/tipos";
import { hora } from "@/lib/fechas";

/** Cita como pieza de ladrillo; compacta para el calendario semanal. */
export function TarjetaCita({
  cita,
  href,
  seleccionada = false,
  compacta = false,
  style,
}: {
  cita: Cita;
  href: string;
  seleccionada?: boolean;
  compacta?: boolean;
  style?: React.CSSProperties;
}) {
  const porConfirmar = cita.estado === "por_confirmar";
  const clase = porConfirmar
    ? "hueco bg-crema-2"
    : `ladrillo l-${cita.servicio.color} ${compacta ? "" : "con-botones"}`;
  const nombre = `${cita.paciente.nombre} ${cita.paciente.apellidos}`;
  const esOrientacion = cita.servicio.color === "frambuesa";

  if (compacta) {
    return (
      <Link
        href={href}
        style={style}
        className={`${clase} absolute left-1 right-1 box-border px-2 py-1 flex flex-col justify-center overflow-hidden no-underline ${seleccionada ? "outline-3 outline-tinta outline-offset-2" : ""}`}
      >
        <b className="text-sm leading-tight truncate">{esOrientacion ? `Papás de ${nombre}` : nombre}</b>
        <span className="text-[12.5px] leading-tight truncate">
          {hora(cita.inicio)} · {porConfirmar ? "Por confirmar" : cita.servicio.nombre}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${porConfirmar ? "hueco bg-crema-2" : "ladrillo l-nube con-botones"} flex items-stretch min-h-[66px] no-underline ${seleccionada ? "outline-3 outline-tinta outline-offset-3" : ""}`}
    >
      <b
        className={`${porConfirmar ? "" : `ladrillo l-${cita.servicio.color}`} w-20 shrink-0 rounded-r-none flex items-center justify-center display text-[22px] font-bold`}
      >
        {hora(cita.inicio)}
      </b>
      <span className="px-3.5 pb-1 flex flex-col justify-center min-w-0">
        <b className="text-lg truncate">{esOrientacion ? `Papás de ${nombre}` : nombre}</b>
        <span className="text-[15px] truncate">
          {porConfirmar ? "Por confirmar · " : ""}
          {cita.servicio.nombre} · {cita.servicio.duracion_min} min
          {cita.modalidad === "en_linea" ? " · En línea" : ""}
        </span>
      </span>
    </Link>
  );
}
