import Image from "next/image";
import { FormularioLogin } from "./FormularioLogin";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="tarjeta w-full max-w-md p-8 pb-10 flex flex-col items-center gap-6 text-center">
        <Image src="/marca/mascota.png" alt="" width={170} height={151} priority />
        <Image src="/marca/texto.png" alt="pequeña gran mente" width={240} height={110} priority />
        <p className="text-tinta-2">Escribe tu correo y te mandamos un enlace para entrar. Sin contraseñas.</p>
        <FormularioLogin />
      </div>
    </main>
  );
}
