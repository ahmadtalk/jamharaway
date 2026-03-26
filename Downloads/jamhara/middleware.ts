import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Exclude: api, admin, _next, static files
    "/((?!api|admin|embed|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
