import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { authConfig } from "@/auth.config";

function sessionCookieIsSecure(request: NextRequest) {
  const configured = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (configured) {
    try {
      return new URL(configured).protocol === "https:";
    } catch {
      return false;
    }
  }
  return request.nextUrl.protocol === "https:";
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  // Read the JWT without calling the Auth.js session endpoint. That endpoint
  // re-signs and Set-Cookie's the session on every admin request, so a
  // response still in flight after sign-out puts the cookie back.
  const token = await getToken({
    req: request,
    secret: authConfig.secret,
    secureCookie: sessionCookieIsSecure(request),
  });

  if (isLogin && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isLogin && !token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
