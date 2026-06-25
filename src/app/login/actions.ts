"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

export async function loginAction(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const from = String(formData.get("from") ?? "/admin");

    const ok = await login(email, password);
    if (!ok) redirect("/login?error=1");

    const safeFrom = from.startsWith("/admin") ? from : "/admin";
    redirect(safeFrom);
}
