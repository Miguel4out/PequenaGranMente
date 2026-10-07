import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/server";

/** Recibe el enlace mágico de Supabase y abre la sesión. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await crearClienteServidor();
  let error = null;
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type === "magiclink") {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" }));
  } else {
    error = new Error("Enlace incompleto");
  }

  if (error) return NextResponse.redirect(`${origin}/login?error=enlace`);
  return NextResponse.redirect(`${origin}/agenda`);
}
