import "server-only";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { Cita, Servicio, PacienteResumen, Bloqueo } from "@/lib/tipos";
import { aInstante, sumarDias } from "@/lib/fechas";

const SELECT_CITA = `
  id, folio, inicio, fin, estado, modalidad, nota,
  paciente:pacientes ( id, nombre, apellidos, fecha_nacimiento, activo ),
  servicio:servicios ( id, nombre, duracion_min, color )
`;

/**
 * Quién está usando la app. El nombre vive en `profiles`; el correo
 * vive en auth.users y no se duplica en la tabla, así que se toma de
 * la sesión.
 */
export async function usuarioActual() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: perfil } = await supabase
    .from("profiles")
    .select("id, nombre, apellidos, rol")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!perfil) return null;
  return { ...perfil, correo: data.user.email ?? "" };
}

/** Citas entre dos fechas locales (inclusive la primera, exclusiva la segunda). */
export async function citasEntre(desde: string, hasta: string): Promise<Cita[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("citas")
    .select(SELECT_CITA)
    .gte("inicio", aInstante(desde, "00:00"))
    .lt("inicio", aInstante(hasta, "00:00"))
    .neq("estado", "cancelada")
    .order("inicio");
  if (error) throw error;
  return (data ?? []) as unknown as Cita[];
}

export async function bloqueosEntre(desde: string, hasta: string): Promise<Bloqueo[]> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("bloqueos")
    .select("id, inicio, fin, motivo")
    .lt("inicio", aInstante(hasta, "00:00"))
    .gt("fin", aInstante(desde, "00:00"));
  return data ?? [];
}

export async function citasDelDia(fecha: string) {
  return citasEntre(fecha, sumarDias(fecha, 1));
}

export async function cita(id: string): Promise<Cita | null> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("citas").select(SELECT_CITA).eq("id", id).maybeSingle();
  return (data as unknown as Cita) ?? null;
}

export async function servicios(): Promise<Servicio[]> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("servicios")
    .select("id, nombre, duracion_min, precio_cents, moneda, modalidad, color, activo, orden")
    .eq("activo", true)
    .order("orden");
  return data ?? [];
}

export async function pacientes(busqueda = ""): Promise<PacienteResumen[]> {
  const supabase = await crearClienteServidor();
  let q = supabase
    .from("pacientes")
    .select("id, nombre, apellidos, fecha_nacimiento, activo")
    .order("apellidos")
    .order("nombre");
  if (busqueda.trim()) {
    const b = `%${busqueda.trim()}%`;
    q = q.or(`nombre.ilike.${b},apellidos.ilike.${b}`);
  }
  const { data } = await q;
  return data ?? [];
}

export async function paciente(id: string) {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("pacientes")
    .select(`
      id, nombre, apellidos, fecha_nacimiento, escuela, grado, horario_preferido, modalidad_preferida, activo, creado_en,
      tutores:tutor_paciente ( parentesco, es_principal, vive_con_menor, tutor:tutores ( id, nombre, apellidos, telefono, correo, medio_preferido ) ),
      emergencia:contactos_emergencia ( id, nombre, parentesco, telefono ),
      notas:notas_admin ( id, texto, creada_en, autor:profiles ( nombre ) )
    `)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const { data: citas } = await supabase
    .from("citas")
    .select(SELECT_CITA)
    .eq("paciente_id", id)
    .order("inicio", { ascending: false })
    .limit(30);

  return { ...data, citas: (citas ?? []) as unknown as Cita[] };
}

/**
 * Huecos libres de un día para un servicio.
 *
 * Esta sí vive en Postgres: restar bloqueos y citas a las reglas de
 * disponibilidad es una operación de conjuntos. Hacerlo en JavaScript
 * significaría traerse tres tablas enteras para filtrar en memoria.
 */
export async function huecos(fecha: string, servicioId: string): Promise<{ inicio: string; fin: string }[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.rpc("huecos_internos", {
    p_servicio_id: servicioId,
    p_fecha: fecha,
  });
  if (error) throw error;
  return data ?? [];
}
