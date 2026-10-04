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
