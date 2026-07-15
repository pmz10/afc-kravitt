"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { solicitarRecuperacion } from "@/lib/auth";

export async function solicitarRecuperacionAction(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    if (!email) redirect("/login/recuperar?error=1");

    const hdrs = await headers();
    const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
    const proto = hdrs.get("x-forwarded-proto") ?? "https";
    const origin = `${proto}://${host}`;

    await solicitarRecuperacion(
        email,
        `${origin}/auth/confirm?next=/login/restablecer`,
    );
    redirect("/login/recuperar?enviado=1");
}
