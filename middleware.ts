// middleware.ts
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/((?!api|_next|.*\\..*|login|favicon.ico).*)"],
};