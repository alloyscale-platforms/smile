import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale } from "@/i18n/dictionaries";
import { SESSION_COOKIE_NAME, decryptSession } from "@/lib/session";

const PROTECTED_SEGMENTS = ["dashboard", "requests/new", "admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const [, maybeLocale, ...rest] = pathname.split("/");

  if (!hasLocale(maybeLocale)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const restPath = rest.join("/");
  const isProtected = PROTECTED_SEGMENTS.some((segment) => restPath.startsWith(segment));

  if (isProtected) {
    const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await decryptSession(cookie);
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = `/${maybeLocale}/login`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
