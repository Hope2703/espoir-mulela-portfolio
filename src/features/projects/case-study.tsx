import { Reveal } from "@/components/motion/reveal";
import Link from "@/components/ui/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import type { Project, Locale } from "@/types/content";
import { publicLinks, projects } from "@/content/projects";
import { href } from "@/lib/routes";
import { ProjectMedia } from "@/components/media/project-media";
import { ContactBand } from "@/components/ui/common";
export function CaseStudy({
  project: p,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const fr = locale === "fr",
    next =
      projects[
        (projects.findIndex((x) => x.id === p.id) + 1) % projects.length
      ];
  return (
    <>
      <header className="wrap case-heading">
        <Link className="text-link" href={href(locale, "projects")}>
          <ArrowLeft size={16} />
          {fr ? "Tous les projets" : "All projects"}
        </Link>
        <p className="eyebrow">
          {fr
            ? p.category
            : ({
                Institutionnel: "Institutional",
                Automatisation: "Automation",
                Web: "Web",
                Mobile: "Mobile",
                SaaS: "SaaS",
              }[p.category] ?? p.category)}
        </p>
        <h1>{p.title[locale]}</h1>
        <p className="lead">{p.shortDescription[locale]}</p>
      </header>
      <Reveal kind="media" className="wrap case-media">
        <ProjectMedia
          id={p.id}
          title={p.title[locale]}
          media={p.media}
          locale={locale}
          interactive
        />
      </Reveal>
      <div className="wrap case-layout">
        <aside>
          <p className="eyebrow">
            {fr ? "REPÈRES DU PROJET" : "PROJECT AT A GLANCE"}
          </p>
          {p.role && (
            <div>
              <h2>{fr ? "Mon rôle" : "My role"}</h2>
              <p>{p.role[locale]}</p>
            </div>
          )}
          {p.status && (
            <div>
              <h2>{fr ? "Statut" : "Status"}</h2>
              <p>{p.status[locale]}</p>
            </div>
          )}
          {p.technologies.length > 0 && (
            <div>
              <h2>{fr ? "Technologie" : "Technology"}</h2>
              <p>{p.technologies.join(" · ")}</p>
            </div>
          )}
          {publicLinks(p).map((link) => (
            <a
              className="text-link"
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
            >
              {fr ? "Voir le site officiel" : "View official website"}
              <ArrowUpRight size={16} />
            </a>
          ))}
        </aside>
        <div className="case-story">
          <Reveal as="section" sequence="timeline">
            <span className="eyebrow">01 / {fr ? "CONTEXTE" : "CONTEXT"}</span>
            <h2>{fr ? "Le point de départ." : "The starting point."}</h2>
            <p>{p.context[locale]}</p>
            <p>{p.description[locale]}</p>
          </Reveal>
          {p.sections.map((s, i) => (
            <Reveal as="section" sequence="timeline" key={s.title.fr}>
              <span className="eyebrow">0{i + 2} /</span>
              <h2>{s.title[locale]}</h2>
              <p>{s.body[locale]}</p>
            </Reveal>
          ))}
        </div>
      </div>
      <div className="wrap next-project">
        <span className="eyebrow">
          {fr ? "CONTINUER LA VISITE" : "CONTINUE EXPLORING"}
        </span>
        <Link href={href(locale, "projects", next.slug)}>
          {next.title[locale]}
          <ArrowUpRight />
        </Link>
      </div>
      <ContactBand locale={locale} />
    </>
  );
}
