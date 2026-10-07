"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { aInstante, fechaLocal } from "@/lib/fechas";
import type { EstadoCita, Modalidad } from "@/lib/tipos";

export type Resultado = { ok: true } | { ok: false; error: string };

/**
 * Traduce errores de Postgres a algo que la psicóloga pueda entender.
 * Los códigos importan más que el texto: `message` cambia entre
 * versiones, los códigos no.
 */
function mensajeError(e: { code?: string; message?: string } | null) {
  if (!e) return "Algo salió mal. Intenta de nuevo.";
  switch (e.code) {
    case "23P01":
      return "Ese horario ya está ocupado. Elige otro.";
    case "23514":
      return "Algún dato no cumple las reglas. Revisa el formulario.";
    case "23503":
      return "Falta un dato relacionado (cliente o tipo de cita).";
    case "42501":
      return "No tienes permiso para hacer eso.";
    default:
      return e.message ?? "Algo salió mal. Intenta de nuevo.";
  }
}

/** Mi perfil de psicóloga. RLS garantiza que solo devuelva el propio. */
async function miPsicologo() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("psicologos").select("id").maybeSingle();
  return data?.id ?? null;
}

/** Crea una cita desde el panel de la psicóloga. */
export async function crearCita(_prev: Resultado | null, form: FormData): Promise<Resultado> {
  const supabase = await crearClienteServidor();
  const pacienteId = String(form.get("paciente_id") ?? "");
  const servicioId = String(form.get("servicio_id") ?? "");
  const fecha = String(form.get("fecha") ?? "");
  const horaIni = String(form.get("hora") ?? "");
  const modalidad = String(form.get("modalidad") ?? "presencial") as Modalidad;
  const nota = String(form.get("nota") ?? "").trim() || null;

  if (!pacienteId || !servicioId || !fecha || !horaIni) {
    return { ok: false, error: "Faltan datos de la cita." };
  }

  const { data: servicio } = await supabase
    .from("servicios")
    .select("duracion_min, psicologo_id, precio_cents, moneda")
    .eq("id", servicioId)
    .maybeSingle();
  if (!servicio) return { ok: false, error: "No se encontró el tipo de cita." };

  const inicio = aInstante(fecha, horaIni);
  const fin = new Date(new Date(inicio).getTime() + servicio.duracion_min * 60_000).toISOString();
  const { data: auth } = await supabase.auth.getUser();

  const { error } = await supabase.from("citas").insert({
    paciente_id: pacienteId,
    psicologo_id: servicio.psicologo_id,
    servicio_id: servicioId,
    inicio,
    fin,
    modalidad,
    nota,
    // El precio se congela al agendar: si mañana sube la tarifa,
    // esta cita sigue valiendo lo que se acordó hoy.
    precio_cents: servicio.precio_cents,
    moneda: servicio.moneda,
    estado: "confirmada",
    // Sin checkout de por medio no hay nada que expirar.
    expira_en: null,
    creada_por: auth.user?.id ?? null,
  });
  if (error) return { ok: false, error: mensajeError(error) };

  revalidatePath("/agenda");
  revalidatePath(`/clientes/${pacienteId}`);
  redirect(`/agenda?fecha=${fecha}&vista=dia`);
}

/** Cambia el estado de una cita (desde un <form action>). */
export async function cambiarEstadoCita(id: string, estado: EstadoCita): Promise<void> {
  const supabase = await crearClienteServidor();
  const { data: c } = await supabase
    .from("citas")
    .select("inicio, paciente_id")
    .eq("id", id)
    .maybeSingle();

  const cambios: { estado: EstadoCita; expira_en: null; cancelada_en?: string } = {
    estado,
    expira_en: null,
  };
  if (estado === "cancelada") cambios.cancelada_en = new Date().toISOString();

  const { error } = await supabase.from("citas").update(cambios).eq("id", id);
  const fecha = c ? fechaLocal(c.inicio) : "";
  if (error) {
    redirect(`/agenda?fecha=${fecha}&cita=${id}&error=${encodeURIComponent(mensajeError(error))}`);
  }
  revalidatePath("/agenda");
  if (c) revalidatePath(`/clientes/${c.paciente_id}`);
  redirect(`/agenda?fecha=${fecha}${estado === "cancelada" ? "" : `&cita=${id}`}`);
}

/** Mueve una cita a otro día y hora, conservando duración. */
export async function reprogramarCita(_prev: Resultado | null, form: FormData): Promise<Resultado> {
  const supabase = await crearClienteServidor();
  const id = String(form.get("id") ?? "");
  const fecha = String(form.get("fecha") ?? "");
  const horaIni = String(form.get("hora") ?? "");
  if (!id || !fecha || !horaIni) return { ok: false, error: "Elige día y hora." };

  const { data: c } = await supabase
    .from("citas")
    .select("inicio, fin, paciente_id, estado")
    .eq("id", id)
    .maybeSingle();
  if (!c) return { ok: false, error: "No se encontró la cita." };
  if (["cancelada", "completada", "no_asistio"].includes(c.estado)) {
    return { ok: false, error: "Esa cita ya está cerrada. Crea una nueva." };
  }

  const dur = new Date(c.fin).getTime() - new Date(c.inicio).getTime();
  const inicio = aInstante(fecha, horaIni);
  const fin = new Date(new Date(inicio).getTime() + dur).toISOString();

  // El traslape no se valida aquí: lo rechaza la restricción EXCLUDE de
  // la tabla, que es la única que aguanta dos peticiones simultáneas.
  const { error } = await supabase.from("citas").update({ inicio, fin }).eq("id", id);
  if (error) return { ok: false, error: mensajeError(error) };

  revalidatePath("/agenda");
  revalidatePath(`/clientes/${c.paciente_id}`);
  redirect(`/agenda?fecha=${fecha}&vista=dia&cita=${id}`);
}

export async function agregarNota(_prev: Resultado | null, form: FormData): Promise<Resultado> {
  const supabase = await crearClienteServidor();
  const pacienteId = String(form.get("paciente_id") ?? "");
  const texto = String(form.get("texto") ?? "").trim();
  if (!texto) return { ok: false, error: "Escribe la nota." };
  if (texto.length > 1000) return { ok: false, error: "La nota no puede pasar de 1000 caracteres." };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, error: "Tu sesión expiró. Vuelve a entrar." };

  const { error } = await supabase
    .from("notas_admin")
    .insert({ paciente_id: pacienteId, texto, autor_id: auth.user.id });
  if (error) return { ok: false, error: mensajeError(error) };

  revalidatePath(`/clientes/${pacienteId}`);
  return { ok: true };
}

export async function crearPaciente(_prev: Resultado | null, form: FormData): Promise<Resultado> {
  const supabase = await crearClienteServidor();
  const psicologoId = await miPsicologo();
  if (!psicologoId) return { ok: false, error: "No se encontró tu perfil de psicóloga." };

  const nombre = String(form.get("nombre") ?? "").trim();
  const apellidos = String(form.get("apellidos") ?? "").trim();
  if (!nombre || !apellidos) return { ok: false, error: "Nombre y apellidos son obligatorios." };

  const nacimiento = String(form.get("fecha_nacimiento") ?? "") || null;
  if (nacimiento && nacimiento > new Date().toISOString().slice(0, 10)) {
    return { ok: false, error: "La fecha de nacimiento no puede estar en el futuro." };
  }

  // El tutor se valida ANTES de crear al paciente: si el teléfono y el
  // correo vienen vacíos, la base rechaza el tutor y nos quedaríamos
  // con una ficha de menor sin nadie a quien avisarle.
  const tutorNombre = String(form.get("tutor_nombre") ?? "").trim();
  const tutorTel = String(form.get("tutor_telefono") ?? "").trim();
  const tutorCorreo = String(form.get("tutor_correo") ?? "").trim();
  if (tutorNombre && !tutorTel && !tutorCorreo) {
    return { ok: false, error: "El tutor necesita al menos un teléfono o un correo." };
  }

  const { data: p, error } = await supabase
    .from("pacientes")
    .insert({
      psicologo_id: psicologoId,
      nombre,
      apellidos,
      fecha_nacimiento: nacimiento,
      escuela: String(form.get("escuela") ?? "").trim() || null,
      grado: String(form.get("grado") ?? "").trim() || null,
      horario_preferido: String(form.get("horario_preferido") ?? "").trim() || null,
      modalidad_preferida: (String(form.get("modalidad_preferida") ?? "") || null) as Modalidad | null,
    })
    .select("id")
    .single();
  if (error || !p) return { ok: false, error: mensajeError(error) };

  if (tutorNombre) {
    const { data: t } = await supabase
      .from("tutores")
      .insert({
        psicologo_id: psicologoId,
        nombre: tutorNombre,
        apellidos: String(form.get("tutor_apellidos") ?? "").trim() || tutorNombre,
        telefono: tutorTel || null,
        correo: tutorCorreo || null,
        medio_preferido: (String(form.get("tutor_medio") ?? "whatsapp") || "whatsapp") as
          | "whatsapp"
          | "llamada"
          | "correo",
      })
      .select("id")
      .single();
    if (t) {
      await supabase.from("tutor_paciente").insert({
        paciente_id: p.id,
        tutor_id: t.id,
        parentesco: String(form.get("tutor_parentesco") ?? "").trim() || "Tutor",
        es_principal: true,
      });
    }
  }

  const emNombre = String(form.get("em_nombre") ?? "").trim();
  const emTelefono = String(form.get("em_telefono") ?? "").trim();
  if (emNombre && emTelefono) {
    await supabase.from("contactos_emergencia").insert({
      paciente_id: p.id,
      nombre: emNombre,
      parentesco: String(form.get("em_parentesco") ?? "").trim() || "Familiar",
      telefono: emTelefono,
    });
  }

  revalidatePath("/clientes");
  redirect(`/clientes/${p.id}`);
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
