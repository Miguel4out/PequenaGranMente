import { format, addDays, startOfWeek, differenceInYears, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const ZONA = "America/Mexico_City";

/** Formatea una fecha ISO (UTC) en la zona del consultorio. */
export function fmt(iso: string | Date, patron: string) {
  const d = typeof iso === "string" ? parseISO(iso) : iso;
  return format(aZona(d), patron, { locale: es });
}

/** Convierte un instante a un Date "de pared" en la zona del consultorio (para formatear). */
export function aZona(d: Date) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(d);
  const v = (t: string) => Number(partes.find((p) => p.type === t)?.value ?? 0);
  return new Date(v("year"), v("month") - 1, v("day"), v("hour") % 24, v("minute"), v("second"));
}

/** Hora corta: 9:00, 10:30 */
export function hora(iso: string) {
  const d = aZona(parseISO(iso));
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Minutos desde medianoche en la zona del consultorio. */
export function minutosDelDia(iso: string) {
  const d = aZona(parseISO(iso));
  return d.getHours() * 60 + d.getMinutes();
}

/** Fecha (yyyy-MM-dd) en la zona del consultorio. */
export function fechaLocal(iso: string) {
  return format(aZona(parseISO(iso)), "yyyy-MM-dd");
}

/** Lunes de la semana de una fecha yyyy-MM-dd. */
export function lunesDe(fecha: string) {
  return format(startOfWeek(parseISO(fecha), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export function sumarDias(fecha: string, n: number) {
  return format(addDays(parseISO(fecha), n), "yyyy-MM-dd");
}

/** Hoy en la zona del consultorio. */
export function hoy() {
  return format(aZona(new Date()), "yyyy-MM-dd");
}

export function edad(nacimiento: string | null) {
  if (!nacimiento) return null;
  return differenceInYears(new Date(), parseISO(nacimiento));
}

/** "Lunes 5 de octubre" */
export function diaLargo(fecha: string) {
  const t = format(parseISO(fecha), "EEEE d 'de' MMMM", { locale: es });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Rango de una semana: "Semana del 5 al 10 de octubre de 2026" */
export function tituloSemana(lunes: string) {
  const a = parseISO(lunes);
  const b = addDays(a, 5);
  if (a.getMonth() === b.getMonth()) {
    return `Semana del ${format(a, "d")} al ${format(b, "d 'de' MMMM 'de' yyyy", { locale: es })}`;
  }
  return `Semana del ${format(a, "d 'de' MMMM", { locale: es })} al ${format(b, "d 'de' MMMM 'de' yyyy", { locale: es })}`;
}

export const DIAS_CORTOS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

/** Construye un instante ISO a partir de fecha y hora de pared en la zona del consultorio. */
export function aInstante(fecha: string, horaMin: string) {
  // Busca el desfase real de la zona en esa fecha (México no tiene horario de verano desde 2022)
  const [y, m, d] = fecha.split("-").map(Number);
  const [h, mi] = horaMin.split(":").map(Number);
  const utcGuess = Date.UTC(y, m - 1, d, h, mi);
  const enZona = aZona(new Date(utcGuess));
  const desfase = enZona.getTime() - new Date(y, m - 1, d, h, mi).getTime();
  return new Date(utcGuess - desfase).toISOString();
}
