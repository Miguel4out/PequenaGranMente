/**
 * Tipos del esquema real de Supabase (migraciones 01–13).
 *
 * Sirven para que el compilador atrape un nombre de tabla o de columna
 * equivocado. Antes de esto, `from("usuarios")` compilaba sin chistar
 * aunque esa tabla no existiera: el error solo aparecía en tiempo de
 * ejecución, con la psicóloga enfrente.
 *
 * Para regenerarlos cuando cambie el esquema:
 *   npx supabase gen types typescript --project-id <ref> --schema public
 *
 * Nota: van declarados con `type` y no con `interface`. Una interface
 * no es asignable a Record<string, unknown>, y supabase-js infiere
 * `never` en todas las consultas si se usa interface.
 */

export type Rol = "paciente" | "psicologa" | "admin";
export type Modalidad = "presencial" | "en_linea";
export type EstadoCita =
  | "pendiente_pago"
  | "por_confirmar"
  | "confirmada"
  | "cancelada"
  | "completada"
  | "no_asistio";
export type EstadoPago = "pendiente" | "aprobado" | "rechazado" | "reembolsado" | "cancelado";
export type EstadoSuscriptor = "pendiente" | "confirmado" | "baja";
export type MedioContacto = "whatsapp" | "llamada" | "correo";
export type ColorServicio = "nube" | "pastel" | "rosa" | "chicle" | "frambuesa";

export type Json = string | number | boolean | null | { [k: string]: Json | undefined } | Json[];

/**
 * Una llave foránea, como la ve PostgREST. Sin esto, un `select`
 * anidado — `paciente:pacientes ( ... )` — no compila: supabase-js no
 * sabe por dónde unir las tablas.
 */
type FK<Col extends string, Ref extends string> = {
  foreignKeyName: string;
  columns: [Col];
  isOneToOne: false;
  referencedRelation: Ref;
  referencedColumns: ["id"];
};

type Tabla<Row, Rels extends FK<string, string>[] = [], Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Rels;
};

export type ProfileRow = {
  id: string;
  rol: Rol;
  nombre: string;
  apellidos: string | null;
  telefono: string | null;
  creado_en: string;
  actualizado_en: string;
};

export type PsicologoRow = {
  id: string;
  profile_id: string;
  slug: string;
  nombre_publico: string;
  titulo: string | null;
  cedula_profesional: string;
  bio: string | null;
  foto_url: string | null;
  especialidades: string[];
  zona_horaria: string;
  anticipacion_minima_horas: number;
  ventana_reserva_dias: number;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
};

export type ServicioRow = {
  id: string;
  psicologo_id: string;
  nombre: string;
  descripcion: string | null;
  duracion_min: number;
  precio_cents: number;
  moneda: string;
  modalidad: Modalidad;
  color: ColorServicio;
  orden: number;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
};

export type DisponibilidadRow = {
  id: string;
  psicologo_id: string;
  /** 0 = domingo, 6 = sábado */
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  vigente_desde: string;
  vigente_hasta: string | null;
  creado_en: string;
};

export type BloqueoRow = {
  id: string;
  psicologo_id: string;
  inicio: string;
  fin: string;
  motivo: string | null;
  creado_en: string;
};

export type PacienteRow = {
  id: string;
  psicologo_id: string;
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string | null;
  escuela: string | null;
  grado: string | null;
  horario_preferido: string | null;
  modalidad_preferida: Modalidad | null;
  /** Vacío mientras no exista portal público. */
  cuenta_id: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
};

export type TutorRow = {
  id: string;
  psicologo_id: string;
  nombre: string;
  apellidos: string;
  telefono: string | null;
  correo: string | null;
  medio_preferido: MedioContacto;
  creado_en: string;
  actualizado_en: string;
};

export type TutorPacienteRow = {
  paciente_id: string;
  tutor_id: string;
  parentesco: string;
  es_principal: boolean;
  vive_con_menor: boolean;
};

export type ContactoEmergenciaRow = {
  id: string;
  paciente_id: string;
  nombre: string;
  parentesco: string;
  telefono: string;
  creado_en: string;
};

export type NotaAdminRow = {
  id: string;
  paciente_id: string;
  autor_id: string;
  texto: string;
  creada_en: string;
};

export type CitaRow = {
  id: string;
  folio: string;
  paciente_id: string;
  psicologo_id: string;
  servicio_id: string;
  inicio: string;
  fin: string;
  estado: EstadoCita;
  modalidad: Modalidad;
  /** Copia del precio al agendar: si sube la tarifa, esta cita no cambia. */
  precio_cents: number;
  moneda: string;
  notas_paciente: string | null;
  nota: string | null;
  expira_en: string | null;
  cancelada_en: string | null;
  cancelada_por: string | null;
  motivo_cancelacion: string | null;
  creada_por: string | null;
  creado_en: string;
  actualizado_en: string;
};

export type PagoRow = {
  id: string;
  cita_id: string | null;
  proveedor: string;
  preference_id: string | null;
  payment_id: string | null;
  estado: EstadoPago;
  monto_cents: number;
  moneda: string;
  metodo: string | null;
  raw: Json | null;
  creado_en: string;
  actualizado_en: string;
};

export type SuscriptorRow = {
  id: string;
  email: string;
  nombre: string | null;
  estado: EstadoSuscriptor;
  token: string;
  origen: string | null;
  consentimiento_en: string | null;
  baja_en: string | null;
  creado_en: string;
  actualizado_en: string;
};

export type NotificacionRow = {
  id: number;
  tipo: string;
  destinatario: string;
  cita_id: string | null;
  suscriptor_id: string | null;
  payload: Json;
  estado: "pendiente" | "enviada" | "fallida";
  programada_para: string;
  intentos: number;
  enviada_en: string | null;
  error: string | null;
  clave_unica: string;
  creado_en: string;
};

export type WebhookEventoRow = {
  id: number;
  proveedor: string;
  event_id: string;
  tipo: string | null;
  payload: Json;
  recibido_en: string;
  procesado_en: string | null;
  error: string | null;
};

export type Hueco = { inicio: string; fin: string };

export type Database = {
  public: {
    Tables: {
      profiles: Tabla<ProfileRow>;
      psicologos: Tabla<PsicologoRow, [FK<"profile_id", "profiles">]>;
      servicios: Tabla<ServicioRow, [FK<"psicologo_id", "psicologos">]>;
      disponibilidad: Tabla<DisponibilidadRow, [FK<"psicologo_id", "psicologos">]>;
      bloqueos: Tabla<BloqueoRow, [FK<"psicologo_id", "psicologos">]>;
      pacientes: Tabla<
        PacienteRow,
        [FK<"psicologo_id", "psicologos">, FK<"cuenta_id", "profiles">]
      >;
      tutores: Tabla<TutorRow, [FK<"psicologo_id", "psicologos">]>;
      tutor_paciente: Tabla<
        TutorPacienteRow,
        [FK<"paciente_id", "pacientes">, FK<"tutor_id", "tutores">]
      >;
      contactos_emergencia: Tabla<ContactoEmergenciaRow, [FK<"paciente_id", "pacientes">]>;
      notas_admin: Tabla<
        NotaAdminRow,
        [FK<"paciente_id", "pacientes">, FK<"autor_id", "profiles">]
      >;
      citas: Tabla<
        CitaRow,
        [
          FK<"paciente_id", "pacientes">,
          FK<"psicologo_id", "psicologos">,
          FK<"servicio_id", "servicios">,
          FK<"creada_por", "profiles">,
        ]
      >;
      pagos: Tabla<PagoRow, [FK<"cita_id", "citas">]>;
      suscriptores: Tabla<SuscriptorRow>;
      notificaciones: Tabla<NotificacionRow>;
      webhook_eventos: Tabla<WebhookEventoRow>;
    };
    Views: Record<string, never>;
    Functions: {
      mi_psicologo_id: { Args: Record<string, never>; Returns: string | null };
      mis_fichas: { Args: Record<string, never>; Returns: string[] };
      es_staff: { Args: Record<string, never>; Returns: boolean };
      huecos_internos: { Args: { p_servicio_id: string; p_fecha: string }; Returns: Hueco[] };
      huecos_disponibles: {
        Args: { p_servicio_id: string; p_desde: string; p_hasta: string };
        Returns: Hueco[];
      };
      alta_paciente_con_tutor: {
        Args: {
          p_nombre: string;
          p_apellidos: string;
          p_tutor_nombre: string;
          p_tutor_apellidos: string;
          p_parentesco: string;
          p_tutor_telefono?: string | null;
          p_tutor_correo?: string | null;
          p_fecha_nacimiento?: string | null;
          p_escuela?: string | null;
          p_grado?: string | null;
          p_medio?: MedioContacto;
        };
        Returns: PacienteRow;
      };
      suscribir_newsletter: {
        Args: { p_email: string; p_nombre?: string | null; p_origen?: string };
        Returns: undefined;
      };
      confirmar_suscripcion: { Args: { p_token: string }; Returns: boolean };
      baja_newsletter: { Args: { p_token: string }; Returns: boolean };
      expirar_citas_vencidas: { Args: Record<string, never>; Returns: number };
      marcar_citas_completadas: { Args: Record<string, never>; Returns: number };
    };
    Enums: {
      rol_usuario: Rol;
      modalidad_cita: Modalidad;
      estado_cita: EstadoCita;
      estado_pago: EstadoPago;
      estado_suscriptor: EstadoSuscriptor;
      medio_contacto: MedioContacto;
    };
    CompositeTypes: Record<string, never>;
  };
};
