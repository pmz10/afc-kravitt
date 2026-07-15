"use server";

import { redirect } from "next/navigation";
import { actualizarContrasena, logout } from "@/lib/auth";

export async function actualizarContrasenaAction(formData: FormData) {
    const password = String(formData.get("password") ?? "");
    const confirmar = String(formData.get("confirmar") ?? "");

    if (password.length < 8) redirect("/login/restablecer?error=corta");
    if (password !== confirmar) redirect("/login/restablecer?error=coincide");

    const ok = await actualizarContrasena(password);
    if (!ok) redirect("/login/restablecer?error=fallo");

    await logout();
    redirect("/login?reset=1");
}
