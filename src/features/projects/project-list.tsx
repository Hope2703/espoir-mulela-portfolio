"use client";
import { useState } from "react";
import Link from "@/components/ui/link";
import { ArrowUpRight } from "lucide-react";
import { EntryPanel } from "@/components/ui/entry-panel";
import type { Project, Locale } from "@/types/content";
import { href } from "@/lib/routes";
import { ProjectMedia } from "@/components/media/project-media";
export function ProjectList({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const [filter, setFilter] = useState("Tous");
  const categories = [
    "Tous",
    "Web",
    "Mobile",
    "SaaS",
    "Institutionnel",
    "Automatisation",
  ];
  const labels: Record<string, string> = {
    Tous: "All",
    Institutionnel: "Institutional",
    Automatisation: "Automation",
  };
  const list = projects.filter(
    (p) => filter === "Tous" || p.category === filter,
  );
  return (
    <div className="wrap">
      <div
        className="filter-bar"
        aria-label={locale === "fr" ? "Filtrer les projets" : "Filter projects"}
      >
        {categories.map((c) => (
          <button
            key={c}
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
          >
            {locale === "en" ? (labels[c] ?? c) : c}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {list.length}{" "}
        {locale === "fr"
          ? list.length === 1
            ? "projet affiché"
            : "projets affichés"
          : list.length === 1
            ? "project shown"
            : "projects shown"}
      </p>
      <div className="project-index">
        {list.map((p, i) => (
          <EntryPanel
            key={p.id}
            className={p.featured ? "index-project featured" : "index-project"}
          >
            <Link
              href={href(locale, "projects", p.slug)}
              className="project-image-link"
              aria-label={`${locale === "fr" ? "Découvrir" : "Explore"} ${p.title[locale]}`}
            >
              <ProjectMedia
                id={p.id}
                title={p.title[locale]}
                media={p.media}
                locale={locale}
              />
            </Link>
            <div className="project-index-copy">
              <span className="eyebrow">
                {String(i + 1).padStart(2, "0")} /{" "}
                {locale === "en"
                  ? (labels[p.category] ?? p.category)
                  : p.category}
              </span>
              <h2>
                <Link href={href(locale, "projects", p.slug)}>
                  {p.title[locale]}
                  <ArrowUpRight />
                </Link>
              </h2>
              <p>{p.shortDescription[locale]}</p>
            </div>
          </EntryPanel>
        ))}
      </div>
      {!list.length && (
        <p>
          {locale === "fr"
            ? "Aucun projet pour ce filtre."
            : "No projects for this filter."}
        </p>
      )}
    </div>
  );
}
