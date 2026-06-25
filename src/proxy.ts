import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "afc_admin_session";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Solo nos interesan rutas /admin/*
    if (!pathname.startsWith("/admin")) {
        return NextResponse.next();
    }

    const hasCookie = request.cookies.has(COOKIE_NAME);
    if (!hasCookie) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};