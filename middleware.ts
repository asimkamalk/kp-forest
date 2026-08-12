import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard && !req.auth) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("next", `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
