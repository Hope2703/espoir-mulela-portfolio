import type { Locale } from "@/types/content";
export const routes = {
  home: ["", ""],
  projects: ["projets", "projects"],
  about: ["a-propos", "about"],
  activities: ["activites", "activities"],
  publications: ["publications", "publications"],
  contact: ["contact", "contact"],
} as const;
export type RouteKey = keyof typeof routes;
export function href(locale: Locale, key: RouteKey, slug?: string) {
  if (key === "home") return locale === "en" ? "/en" : "/";
  return `${locale === "en" ? "/en" : ""}/${routes[key][locale === "fr" ? 0 : 1]}${slug ? `/${slug}` : ""}`;
}
export function resolveRoute(
  locale: Locale,
  path: string[] = [],
): RouteKey | undefined {
  return (Object.keys(routes) as RouteKey[]).find(
    (k) => routes[k][locale === "fr" ? 0 : 1] === (path[0] ?? ""),
  );
}
export const navLabels = {
  fr: {
    home: "Accueil",
    projects: "Projets",
    about: "À propos",
    activities: "Activités",
    publications: "Publications",
    contact: "Contact",
  },
  en: {
    home: "Home",
    projects: "Projects",
    about: "About",
    activities: "Activities",
    publications: "Writing",
    contact: "Contact",
  },
};
export function switchLocalePath(pathname: string, locale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "en" || parts[0] === "fr") parts.shift();
  const key = resolveRoute(locale, parts) ?? "home";
  return href(locale === "fr" ? "en" : "fr", key, parts[1]);
}
