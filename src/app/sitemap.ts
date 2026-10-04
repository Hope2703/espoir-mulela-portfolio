import type { MetadataRoute } from "next";
import { siteUrl, indexable } from "@/lib/seo";
import { href, routes, type RouteKey } from "@/lib/routes";
import { projects } from "@/content/projects";
import { publicationEntries } from "@/content/publications";
import { activityEntries } from "@/content/activities";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexable) return [];
  const entries: { key: RouteKey; slug?: string }[] = [
    ...(Object.keys(routes) as RouteKey[]).map((key) => ({ key })),
    ...projects.map((p) => ({ key: "projects" as const, slug: p.slug })),
    ...publicationEntries
      .filter((p) => p.status === "published" && p.langue === "fr")
      .map((p) => ({ key: "publications" as const, slug: p.slug })),
    ...activityEntries
      .filter((a) => a.status === "published")
      .map((a) => ({ key: "activities" as const, slug: a.slug })),
  ];
  return entries.flatMap((e) =>
    (["fr", "en"] as const).map((locale) => ({
      url: siteUrl + href(locale, e.key, e.slug),
      alternates: {
        languages: {
          fr: siteUrl + href("fr", e.key, e.slug),
          en: siteUrl + href("en", e.key, e.slug),
        },
      },
    })),
  );
}
