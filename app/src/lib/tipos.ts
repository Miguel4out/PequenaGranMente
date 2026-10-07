import type { EstadoCita, Modalidad, ColorServicio } from "@/lib/database.types";

export type { EstadoCita, Modalidad, ColorServicio };

export type Servicio = {
  id: string;
  nombre: string;
  duracion_min: number;
  precio_cents: number;
  moneda: string;
  modalidad: Modalidad;
  color: ColorServicio;
  activo: boolean;
  orden: number;
};

export type PacienteResumen = {
  id: string;
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string | null;
  activo: boolean;
};

export type Cita = {
  id: string;
  folio: string;
  inicio: string;
  fin: string;
  estado: EstadoCita;
  modalidad: Modalidad;
  nota: string | null;
  paciente: PacienteResumen;
  servicio: Pick<Servicio, "id" | "nombre" | "duracion_min" | "color">;
};

export type Bloqueo = { id: string; inicio: string; fin: string; motivo: string | null };

export const ETIQUETA_ESTADO: Record<EstadoCita, string> = {
  pendiente_pago: "Pendiente de pago",
  por_confirmar: "Por confirmar",
  confirmada: "Confirmada",
  completada: "Asistió",
  no_asistio: "No asistió",
  cancelada: "Cancelada",
};

export const ETIQUETA_MODALIDAD: Record<Modalidad, string> = {
  presencial: "Presencial",
  en_linea: "En línea",
};

/**
 * Los estados que la psicóloga puede poner a mano desde el panel.
 * `pendiente_pago` queda fuera a propósito: lo pone el flujo de pago
 * público, que todavía no existe.
 */
export const ESTADOS_MANUALES = [
  "por_confirmar",
  "confirmada",
  "completada",
  "no_asistio",
  "cancelada",
] as const satisfies readonly EstadoCita[];

/** Precio en pesos, a partir de centavos. */
export function precio(cents: number, moneda = "MXN") {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: moneda }).format(cents / 100);
}
