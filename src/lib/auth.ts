import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) return false;

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  return !adminError && Boolean(admin);
}

export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/login");
}

export async function login(email: string, password: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return false;

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (adminError || !admin) {
    await supabase.auth.signOut();
    return false;
  }

  return true;
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

// No revela si el correo existe o no (evita filtrar qué emails son admin).
export async function solicitarRecuperacion(
  email: string,
  redirectTo: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

// Intercambia el código del link de recuperación por una sesión (setea cookies).
export async function confirmarRecuperacion(code: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return !error;
}

// Requiere una sesión de recuperación ya activa (ver confirmarRecuperacion).
export async function actualizarContrasena(password: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  return !error;
}
