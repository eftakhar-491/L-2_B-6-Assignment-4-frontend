import { NextRequest, NextResponse } from "next/server";

type UserRole = "customer" | "provider" | "admin" | "super_admin";
type AuthSession = {
  user: {
    id: string;
    role: UserRole;
  };
};

const AUTH_PAGES = ["/login", "/register", "/signin"];

const ROLE_RULES: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/super-admin", roles: ["super_admin"] },
  { prefix: "/admin", roles: ["admin", "super_admin"] },
  { prefix: "/provider", roles: ["provider"] },
  { prefix: "/orders", roles: ["customer"] },
  { prefix: "/checkout", roles: ["customer"] },
  { prefix: "/cart", roles: ["customer"] },
  { prefix: "/profile", roles: ["customer"] },
];

const pathMatches = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

const getPostLoginRedirect = (role: UserRole) => {
  if (role === "super_admin") return "/super-admin";
  if (role === "admin") return "/admin";
  if (role === "provider") return "/provider/dashboard";
  return "/";
};

const buildLoginRedirect = (request: NextRequest) => {
  const loginUrl = new URL("/login", request.url);
  const redirectPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("redirect", redirectPath);
  return NextResponse.redirect(loginUrl);
};

const fetchSession = async (request: NextRequest): Promise<AuthSession | null> => {
  try {
    const response = await fetch(new URL("/api/auth/get-session", request.url), {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        origin: request.nextUrl.origin,
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json().catch(() => null)) as AuthSession | null;
    if (!payload?.user?.role) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await fetchSession(request);
  const isAuthPage = AUTH_PAGES.some((path) => pathMatches(pathname, path));

  if (isAuthPage && session?.user) {
    const destination = new URL(getPostLoginRedirect(session.user.role), request.url);
    return NextResponse.redirect(destination);
  }

  const activeRule = ROLE_RULES.find((rule) => pathMatches(pathname, rule.prefix));
  if (!activeRule) {
    return NextResponse.next();
  }

  if (!session?.user) {
    return buildLoginRedirect(request);
  }

  if (!activeRule.roles.includes(session.user.role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
