import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get("session_token")?.value;

    if (!sessionToken) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const meRes = await fetch(`${BACKEND_URL}/me`, {
        headers: {
            cookie: `session_token=${sessionToken}`,
        },
    });

    if (!meRes.ok) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/operador/:path*", "/motorista/:path*"],
};