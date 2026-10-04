import type { Metadata } from "next";
import type { Locale, Publication } from "@/types/content";
import { href, navLabels, type RouteKey } from "@/lib/routes";
import { profile } from "@/data/profile";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:3000";
export const indexable =
  Boolean(process.env.NEXT_PUBLIC_SITE_URL) &&
  process.env.SITE_INDEXABLE === "true";
export function metadata(
  locale: Locale,
  key: RouteKey,
  title?: string,
  description?: string,
  slug?: string,
): Metadata {
  const name =
    title ??
    (key === "home"
      ? locale === "fr"
        ? "Ingénieur informatique & développeur Full-Stack"
        : "Software Engineer & Full-Stack Developer"
      : navLabels[locale][key]);
  const fullTitle =
    key === "home"
      ? `Espoir Mulela Mastolo — ${name}`
      : `${name} — Espoir Mulela Mastolo`;
  const desc = description ?? profile.introduction[locale];
  const url = `${siteUrl}${href(locale, key, slug)}`;
  return {
    metadataBase: new URL(siteUrl),
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: url,
      languages: {
        fr: `${siteUrl}${href("fr", key, slug)}`,
        en: `${siteUrl}${href("en", key, slug)}`,
        "x-default": `${siteUrl}${href("fr", key, slug)}`,
      },
    },
    robots: { index: indexable, follow: true },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_CD" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_CD",
      siteName: profile.name,
      title: fullTitle,
      description: desc,
      url,
      images: [
        {
          url: `${siteUrl}/api/og?lang=${locale}`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [`${siteUrl}/api/og?lang=${locale}`],
    },
  };
}
export function JsonLd({ value }: { value: unknown }) {
  return (
    <div
      hidden
      dangerouslySetInnerHTML={{
        __html: `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, "\\u003c")}</script>`,
      }}
    />
  );
}
export function IdentityJsonLd() {
  return (
    <JsonLd
      value={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            "@id": `${siteUrl}/#person`,
            name: profile.name,
            url: siteUrl,
            jobTitle: "Ingénieur informatique et développeur Full-Stack",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Kinshasa",
              addressCountry: "CD",
            },
            sameAs: profile.socials
              .filter((social) =>
                ["LinkedIn", "Instagram"].includes(social.name),
              )
              .map((social) => social.href),
            alumniOf: {
              "@type": "CollegeOrUniversity",
              name: "Université Protestante au Congo",
            },
            knowsLanguage: ["fr", "en"],
            ...(profile.portrait
              ? { image: `${siteUrl}${profile.portrait.src}` }
              : {}),
          },
          {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            name: profile.name,
            url: siteUrl,
            inLanguage: ["fr", "en"],
            publisher: { "@id": `${siteUrl}/#person` },
          },
        ],
      }}
    />
  );
}
export function BreadcrumbJsonLd({
  locale,
  routeKey: key,
  title,
  slug,
}: {
  locale: Locale;
  routeKey: RouteKey;
  title?: string;
  slug?: string;
}) {
  const list = [
    { name: navLabels[locale].home, url: href(locale, "home") },
    { name: navLabels[locale][key], url: href(locale, key) },
    ...(slug ? [{ name: title ?? slug, url: href(locale, key, slug) }] : []),
  ];
  return (
    <JsonLd
      value={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: list.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: e.name,
          item: siteUrl + e.url,
        })),
      }}
    />
  );
}
export function ArticleJsonLd({
  publication: p,
}: {
  publication: Publication;
}) {
  if (p.status !== "published") return null;
  return (
    <JsonLd
      value={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: p.title,
        description: p.description,
        inLanguage: p.langue,
        ...(p.date ? { datePublished: p.date } : {}),
        author: {
          "@type": "Person",
          name: profile.name,
          "@id": `${siteUrl}/#person`,
        },
        url: siteUrl + href(p.langue, "publications", p.slug),
        ...(p.cover ? { image: siteUrl + p.cover } : {}),
      }}
    />
  );
}
