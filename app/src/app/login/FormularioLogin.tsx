"use client";

import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { BotonLadrillo } from "@/components/ui/Ladrillo";

export function FormularioLogin() {
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState<"listo" | "enviando" | "enviado" | "error">("listo");
  const [error, setError] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    const supabase = crearClienteNavegador();
    const { error } = await supabase.auth.signInWithOtp({
      email: correo,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setEstado("error");
    } else {
      setEstado("enviado");
    }
  }

  if (estado === "enviado") {
    return (
      <div className="ladrillo l-nube con-botones w-full p-5 pb-6" role="status">
        <b>Revisa tu correo.</b>
        <div>Te mandamos un enlace a <b>{correo}</b>. Ábrelo desde este mismo dispositivo.</div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="w-full flex flex-col gap-3">
      <label htmlFor="correo" className="font-bold text-left">Correo</label>
      <input
        id="correo"
        type="email"
        required
        autoComplete="email"
        className="campo"
        placeholder="tu@correo.com"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />
      {estado === "error" && <div role="alert" className="text-left font-bold">{error}</div>}
      <BotonLadrillo type="submit" color="frambuesa" botones className="h-14 text-lg display" disabled={estado === "enviando"}>
        {estado === "enviando" ? "Enviando…" : "Mandar enlace"}
      </BotonLadrillo>
    </form>
  );
}
