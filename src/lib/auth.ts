import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "afc_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 horas

export async function isAuthenticated(): Promise<boolean> {
    const store = await cookies();
    const cookie = store.get(COOKIE_NAME);
    return cookie?.value === process.env.ADMIN_PASSWORD;
}

export async function requireAuth(): Promise<void> {
    if (!(await isAuthenticated())) redirect("/login");
}

export async function login(password: string): Promise<boolean> {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || password !== expected) return false;
    const store = await cookies();
    store.set(COOKIE_NAME, expected, {
        httpOnly: true,           // no accesible desde JS del cliente
        sameSite: "lax",          // protección CSRF básica
        secure: process.env.NODE_ENV === "production",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });
    return true;
}

export async function logout(): Promise<void> {
    const store = await cookies();
    store.delete(COOKIE_NAME);
}