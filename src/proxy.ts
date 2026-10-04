import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
export default createMiddleware(routing);
// Exclude internal /fr rewrites to avoid recursively processing them.
export const config = {
  matcher: [
    "/",
    "/en/:path*",
    "/projets/:path*",
    "/a-propos",
    "/activites/:path*",
    "/publications/:path*",
    "/contact",
  ],
};
