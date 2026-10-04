import Link from "@/components/ui/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/types/content";
import {
  resolveRoute,
  href,
  navLabels,
  routes,
  type RouteKey,
} from "@/lib/routes";
import { metadata, BreadcrumbJsonLd, ArticleJsonLd } from "@/lib/seo";
import { projects, getProject, publicLinks } from "@/content/projects";
import { getActivities } from "@/content/activities";
import { getPublications } from "@/content/publications";
import { About } from "@/features/profile/about";
import { ProjectList } from "@/features/projects/project-list";
import { CaseStudy } from "@/features/projects/case-study";
import { Publications, PublicationPage } from "@/features/publications/pages";
import { Activities, ActivityPage } from "@/features/activities/pages";
import { Contact } from "@/features/contact/page";
import { PageHeading, ContactBand } from "@/components/ui/common";
type Props = { params: Promise<{ locale: Locale; path: string[] }> };
function lookup(locale: Locale, path: string[]) {
  const key = resolveRoute(locale, path),
    slug = path[1];
  if (!key || key === "home" || path.length > 2) return null;
  if (slug) {
    if (key === "projects") {
      const item = getProject(slug);
      return item
        ? {
            key,
            slug,
            title: item.title[locale],
            description: item.shortDescription[locale],
          }
        : null;
    }
    if (key === "publications") {
      const item = getPublications(locale).find((p) => p.slug === slug);
      return item
        ? {
            key,
            slug,
            title: item.title,
            description: item.description,
          }
        : null;
    }
    if (key === "activities") {
      const item = getActivities().find((p) => p.slug === slug);
      return item
        ? {
            key,
            slug,
            title: item.title[locale],
            description: item.description[locale],
          }
        : null;
    }
    return null;
  }
  return {
    key,
    slug: undefined,
    title: undefined,
    description: undefined,
  };
}
export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as Locale;
  return [
    ...(Object.keys(routes) as RouteKey[])
      .filter((k) => k !== "home")
      .map((k) => ({ path: [routes[k][locale === "fr" ? 0 : 1]] })),
    ...projects.map((p) => ({
      path: [routes.projects[locale === "fr" ? 0 : 1], p.slug],
    })),
    ...getPublications(locale).map((p) => ({ path: ["publications", p.slug] })),
    ...getActivities().map((p) => ({
      path: [routes.activities[locale === "fr" ? 0 : 1], p.slug],
    })),
  ];
}
export async function generateMetadata({ params }: Props) {
  const { locale, path } = await params;
  const entry = lookup(locale, path);
  if (!entry)
    return {
      title: "404 — Espoir Mulela",
      robots: { index: false, follow: false },
    };
  return metadata(
    locale,
    entry.key,
    entry.title,
    entry.description,
    entry.slug,
  );
}
export default async function Page({ params }: Props) {
  const { locale, path } = await params;
  setRequestLocale(locale);
  const entry = lookup(locale, path);
  if (!entry) notFound();
  const { key, slug } = entry;
  let content;
  if (key === "projects")
    content = slug ? (
      <CaseStudy project={getProject(slug)!} locale={locale} />
    ) : (
      <>
        <PageHeading
          kicker={
            locale === "fr"
              ? "PRODUITS / PLATEFORMES / SYSTÈMES"
              : "PRODUCTS / PLATFORMS / SYSTEMS"
          }
          title={
            locale === "fr"
              ? "Le travail, dans son contexte."
              : "The work, in context."
          }
          description={
            locale === "fr"
              ? "Des applications métier aux plateformes web, une sélection de réalisations et de contributions. Chaque projet commence par une question concrète."
              : "From business applications to web platforms, a selection of projects and contributions. Each one starts with a concrete question."
          }
        />
        <ProjectList
          locale={locale}
          projects={projects.map((p) => ({
            ...p,
            links: publicLinks(p),
          }))}
        />
        <ContactBand locale={locale} />
      </>
    );
  else if (key === "about") content = <About locale={locale} />;
  else if (key === "contact") content = <Contact locale={locale} />;
  else if (key === "activities")
    content = slug ? (
      <ActivityPage
        locale={locale}
        activity={getActivities().find((a) => a.slug === slug)!}
      />
    ) : (
      <Activities locale={locale} />
    );
  else if (key === "publications") {
    const publication = getPublications(locale).find((p) => p.slug === slug);
    content = publication ? (
      <>
        <ArticleJsonLd publication={publication} />
        <PublicationPage publication={publication} locale={locale} />
      </>
    ) : (
      <Publications locale={locale} />
    );
  }
  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        routeKey={key}
        title={entry.title}
        slug={slug}
      />
      <nav
        className="breadcrumb wrap"
        aria-label={locale === "fr" ? "Fil d’Ariane" : "Breadcrumb"}
      >
        <Link href={href(locale, "home")}>{navLabels[locale].home}</Link>
        <span aria-hidden>/</span>
        {slug ? (
          <>
            <Link href={href(locale, key)}>{navLabels[locale][key]}</Link>
            <span aria-hidden>/</span>
            <span aria-current="page">{entry.title}</span>
          </>
        ) : (
          <span aria-current="page">{navLabels[locale][key]}</span>
        )}
      </nav>
      {content}
    </>
  );
}
