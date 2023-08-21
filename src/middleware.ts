import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Account } from "next-auth";

export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;

const redirect = (x: string) => NextResponse.redirect(WEB_URL + x);

export async function middleware(req: NextRequest) {
  const session = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as { user?: Account };

  const isAdmin = session?.user?.role === "admin";

  if (req.nextUrl.pathname.startsWith("/home")) {
    if (!session) return redirect("/");
  }

  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!isAdmin) return redirect("/home");
  }

  return;
}
