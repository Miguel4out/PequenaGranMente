import Link from "next/link";
import { notFound } from "next/navigation";
import { paciente as cargarPaciente } from "@/lib/datos";
import { ETIQUETA_ESTADO, ETIQUETA_MODALIDAD } from "@/lib/tipos";
import { edad, fechaLocal, fmt, hora, hoy } from "@/lib/fechas";
import { EnlaceLadrillo } from "@/components/ui/Ladrillo";
import { Volver } from "@/components/ui/Volver";
import { FormularioNota } from "@/components/clientes/FormularioNota";

export const metadata = { title: "Cliente" };

const MEDIO: Record<string, string> = { whatsapp: "Prefiere WhatsApp", llamada: "Prefiere llamada", correo: "Prefiere correo" };

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await cargarPaciente(id);
  if (!p) notFound();

  const anios = edad(p.fecha_nacimiento);
  const ahora = new Date().toISOString();
  const proxima = [...p.citas].reverse().find((c) => c.inicio >= ahora && (c.estado === "confirmada" || c.estado === "por_confirmar"));
  const historial = p.citas.filter((c) => c.id !== proxima?.id);
  const tutores = (p.tutores as unknown as { parentesco: string; es_principal: boolean; vive_con_menor: boolean; tutor: { id: string; nombre: string; apellidos: string; telefono: string | null; correo: string | null; medio_preferido: string } | null }[]).filter((t) => t.tutor);
  const emergencia = p.emergencia as { id: string; nombre: string; parentesco: string; telefono: string }[];
  const notas = (p.notas as unknown as { id: string; texto: string; creada_en: string; autor: { nombre: string } | null }[]).sort((a, b) => b.creada_en.localeCompare(a.creada_en));
  const iniciales = `${p.nombre[0] ?? ""}${p.apellidos[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex flex-col gap-6 pb-6">
      <header className="placa lg:bg-none lg:bg-transparent px-2 pt-5 pb-5 lg:px-8 lg:pt-7 flex flex-col gap-4">
        <div className="flex items-center gap-1 text-[15px] text-tinta-2">
          <Volver href="/clientes" etiqueta="Volver a clientes" />
          <Link href="/clientes">Clientes</Link>&nbsp;/ {p.nombre} {p.apellidos}
        </div>
        <div className="px-3 lg:px-0 lg:tarjeta lg:p-7 lg:pb-8 flex flex-wrap items-center gap-5">
          <div className="ladrillo l-rosa con-botones w-[78px] h-[72px] flex items-center justify-center display text-[28px] font-bold">{iniciales}</div>
          <div className="mr-auto flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] lg:text-[34px] font-bold leading-tight">{p.nombre} {p.apellidos}</h1>
              <span className="px-3 py-1 rounded bg-rosa-nube text-sm font-bold">{p.activo ? "Activo" : "Inactivo"}</span>
            </div>
            <div className="text-[17px] text-tinta-2">
              {anios !== null ? `${anios} años` : "Edad sin registrar"}{p.grado ? ` · ${p.grado}` : ""} · Cliente desde {fmt(p.creado_en, "MMMM 'de' yyyy")}
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
            {tutores[0]?.tutor?.telefono && (
              <a href={`tel:${tutores[0].tutor.telefono}`} className="ladrillo l-crema h-[50px] px-5 flex items-center font-bold no-underline lg:hidden">Llamar</a>
            )}
            <EnlaceLadrillo href={`/agenda/nueva?fecha=${hoy()}&paciente=${p.id}`} color="frambuesa" botones className="h-[50px] px-5 display text-lg font-semibold flex-1 lg:flex-none">
              + Agendar cita
            </EnlaceLadrillo>
          </div>
        </div>
      </header>

      <div className="px-5 lg:px-8 flex flex-wrap gap-6 items-start">
        <div className="flex-[999_1_560px] min-w-0 flex flex-col gap-6">
          <section className="tarjeta p-6 pb-8 flex flex-col gap-5">
            <h2 className="text-[22px] font-semibold">Próxima cita</h2>
            {proxima ? (
              <Link href={`/agenda?fecha=${fechaLocal(proxima.inicio)}&vista=dia&cita=${proxima.id}`} className="ladrillo l-nube con-botones flex flex-wrap items-stretch no-underline">
                <div className={`ladrillo l-${proxima.servicio.color} w-20 min-h-[76px] rounded-r-none flex flex-col items-center justify-center display leading-tight`}>
                  <span className="text-[13px] font-semibold uppercase">{fmt(proxima.inicio, "MMM")}</span>
                  <span className="text-[26px] font-bold">{fmt(proxima.inicio, "d")}</span>
                </div>
                <div className="flex-[1_1_260px] px-4 py-3 flex flex-col justify-center">
                  <b className="text-lg">{fmt(proxima.inicio, "EEEE d 'de' MMMM")}, {hora(proxima.inicio)} a {hora(proxima.fin)}</b>
                  <span>{proxima.servicio.nombre} · {ETIQUETA_MODALIDAD[proxima.modalidad]}{proxima.estado === "por_confirmar" ? " · Por confirmar" : ""}</span>
                </div>
              </Link>
            ) : (
              <div className="text-tinta-2">No tiene citas próximas.</div>
            )}
          </section>

          <section className="tarjeta p-6 pb-8 flex flex-col gap-3">
            <h2 className="text-[22px] font-semibold">Historial de citas</h2>
            {historial.length === 0 ? (
              <div className="text-tinta-2">Todavía no hay citas registradas.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse">
                  <thead>
                    <tr className="text-left text-sm text-tinta-2">
                      <th className="py-2.5 pr-3 border-b-2 border-arena">Fecha</th>
                      <th className="py-2.5 px-3 border-b-2 border-arena">Servicio</th>
                      <th className="py-2.5 px-3 border-b-2 border-arena">Modalidad</th>
                      <th className="py-2.5 pl-3 border-b-2 border-arena">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3.5 pr-3 border-b border-arena-3"><b>{fmt(c.inicio, "EEE d MMM")}</b> · {hora(c.inicio)}</td>
                        <td className="py-3.5 px-3 border-b border-arena-3">{c.servicio.nombre}</td>
                        <td className="py-3.5 px-3 border-b border-arena-3">{ETIQUETA_MODALIDAD[c.modalidad]}</td>
                        <td className="py-3.5 pl-3 border-b border-arena-3"><Estado estado={c.estado} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="tarjeta p-6 pb-8 flex flex-col gap-4">
            <div>
              <h2 className="text-[22px] font-semibold">Notas administrativas</h2>
              <div className="text-[15px] text-tinta-2">Solo avisos de organización: horarios, acompañantes, recordatorios. Aquí no se escriben notas clínicas.</div>
            </div>
            <FormularioNota pacienteId={p.id} />
            <div className="flex flex-col gap-3">
              {notas.map((n) => (
                <div key={n.id} className="p-3.5 rounded-ladrillo bg-rosa-nube">
                  <div className="text-sm text-tinta-2">{fmt(n.creada_en, "d MMM yyyy")} · {n.autor?.nombre ?? ""}</div>
                  <div>{n.texto}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex-[1_1_320px] min-w-0 flex flex-col gap-6">
          <section className="tarjeta p-6 pb-8 flex flex-col gap-4">
            <h2 className="text-[22px] font-semibold">Mamá, papá o tutor</h2>
            {tutores.length === 0 && <div className="text-tinta-2">Sin tutor registrado.</div>}
            {tutores.map((t) => (
              <div key={t.tutor!.id} className="p-4 rounded-ladrillo bg-rosa-nube flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-[17px]">{t.tutor!.nombre} {t.tutor!.apellidos}</b>
                  {t.es_principal && <span className="px-2.5 py-0.5 rounded bg-rosa text-[13px] font-bold">Contacto principal</span>}
                </div>
                <div className="text-tinta-2">{t.parentesco}{t.vive_con_menor ? "" : " · Otro domicilio"}</div>
                <div>{[t.tutor!.telefono, t.tutor!.correo].filter(Boolean).join(" · ") || "Sin datos de contacto"}</div>
                <div className="text-[15px]">{MEDIO[t.tutor!.medio_preferido]}</div>
              </div>
            ))}
          </section>

          <section className="tarjeta p-6 pb-8 flex flex-col gap-3">
            <h2 className="text-[22px] font-semibold">Contacto de emergencia</h2>
            {emergencia.length === 0 && <div className="text-tinta-2">Sin registrar.</div>}
            {emergencia.map((e) => (
              <div key={e.id} className="flex flex-col gap-0.5">
                <b className="text-[17px]">{e.nombre}</b>
                <div className="text-tinta-2">{e.parentesco}</div>
                <div>{e.telefono}</div>
              </div>
            ))}
          </section>

          <section className="tarjeta p-6 pb-8 flex flex-col gap-3.5">
            <h2 className="text-[22px] font-semibold">Datos de {p.nombre}</h2>
            <dl className="grid grid-cols-[124px_minmax(0,1fr)] gap-x-3 gap-y-2.5">
              <dt className="text-tinta-2">Nacimiento</dt><dd className="font-bold">{p.fecha_nacimiento ? fmt(p.fecha_nacimiento + "T12:00:00Z", "d 'de' MMMM 'de' yyyy") : "—"}</dd>
              <dt className="text-tinta-2">Escuela</dt><dd className="font-bold">{p.escuela ?? "—"}</dd>
              <dt className="text-tinta-2">Grado</dt><dd className="font-bold">{p.grado ?? "—"}</dd>
              <dt className="text-tinta-2">Horario ideal</dt><dd className="font-bold">{p.horario_preferido ?? "—"}</dd>
              <dt className="text-tinta-2">Modalidad</dt><dd className="font-bold">{p.modalidad_preferida ? ETIQUETA_MODALIDAD[p.modalidad_preferida as "presencial" | "en_linea"] : "—"}</dd>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function Estado({ estado }: { estado: keyof typeof ETIQUETA_ESTADO }) {
  const clase =
    estado === "no_asistio" ? "bg-frambuesa text-white"
    : estado === "cancelada" ? "border-2 border-tinta"
    : estado === "por_confirmar" ? "hueco"
    : "bg-rosa-nube";
  return <span className={`px-3 py-1 rounded text-sm font-bold ${clase}`}>{ETIQUETA_ESTADO[estado]}</span>;
}
