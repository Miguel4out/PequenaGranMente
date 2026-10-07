import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

/** La llave pública. Acepta el nombre nuevo (publishable) y el viejo (anon). */
function llavePublica() {
  const k =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!k) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local (Supabase → Project Settings → API Keys).",
    );
  }
  return k;
}

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 * Usa solo la llave pública: actúa con la sesión de quien pide, así que RLS
 * sigue mandando y este cliente ve exactamente lo que esa persona puede ver.
 */
export async function crearClienteServidor() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    llavePublica(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Al renderizar un Server Component no se pueden escribir cookies; proxy.ts las refresca.
          }
        },
      },
    },
  );
}
