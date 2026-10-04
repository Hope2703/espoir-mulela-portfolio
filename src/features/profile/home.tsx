import Link from "@/components/ui/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/types/content";
import { profile, journeyNotes } from "@/data/profile";
import { projects } from "@/content/projects";
import { getPublications } from "@/content/publications";
import { getActivities } from "@/content/activities";
import { href } from "@/lib/routes";
import { Portrait } from "@/components/media/portrait";
import { ProjectMedia } from "@/components/media/project-media";
import { Reveal } from "@/components/motion/reveal";
import { Action, ContactBand, SectionHeading } from "@/components/ui/common";
export function Home({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  const selected = projects.filter((p) => p.featured);
  const publication = getPublications(locale)[0],
    activity = getActivities()[0];
  return (
    <>
      <section className="hero wrap">
        <div className="hero-name">
          <span>{profile.name}</span>
          <span>
            {fr
              ? "INGÉNIERIE / PRODUITS / SYSTÈMES"
              : "ENGINEERING / PRODUCTS / SYSTEMS"}
          </span>
        </div>
        <div className="hero-layout">
          <div className="hero-copy">
            <div className="hero-title-reveal">
              <h1>
                <span className="hero-first-line">
                  {fr ? "Ingénieur informatique." : "Software engineer."}
                </span>
                <span>
                  {fr ? "Développeur" : "Full-Stack"}
                  <br />
                  {fr ? "Full-Stack." : "developer."}
                </span>
              </h1>
            </div>
            <p className="hero-fields">
              Web · Mobile ·{" "}
              {fr ? "Applications métier" : "Business applications"}
              <br />
              {fr ? "IA & Data" : "AI & Data"} ·{" "}
              {fr ? "Transformation digitale" : "Digital transformation"}
            </p>
            <p className="hero-intro">{profile.introduction[locale]}</p>
            <div className="actions">
              <Action to={href(locale, "projects")}>
                {fr ? "Voir mes réalisations" : "Explore my work"}
              </Action>
              <Action secondary to={href(locale, "about")}>
                {fr ? "Découvrir mon parcours" : "Discover my journey"}
              </Action>
            </div>
          </div>
          <div className="hero-portrait">
            <Portrait locale={locale} priority />
          </div>
        </div>
        <div className="hero-baseline">
          <span>
            {fr ? "Basé à Kinshasa, RD Congo" : "Based in Kinshasa, DR Congo"}
          </span>
          <span className="signature-line">
            {fr ? "COMPRENDRE" : "UNDERSTAND"}
            <i />
            {fr ? "CONSTRUIRE" : "BUILD"}
            <i />
            {fr ? "FAIRE ÉVOLUER" : "EVOLVE"}
            <span>↳</span>
          </span>
        </div>
      </section>
      <section className="section wrap">
        <SectionHeading
          number="01"
          title={
            fr
              ? "Des besoins. Des réponses concrètes."
              : "Real needs. Tangible responses."
          }
        >
          <Link className="text-link" href={href(locale, "projects")}>
            {fr ? "Tous les projets" : "All projects"}
            <ArrowUpRight size={18} />
          </Link>
        </SectionHeading>
        <div className="selected-projects">
          {selected.map((p, i) => (
            <Reveal
              key={p.id}
              sequence="project"
              className={`selected-project selected-${i}`}
            >
              <Link
                className="project-image-link"
                href={href(locale, "projects", p.slug)}
                aria-label={`${fr ? "Explorer" : "Explore"} ${p.title[locale]}`}
              >
                <ProjectMedia
                  id={p.id}
                  title={p.title[locale]}
                  media={p.media}
                  locale={locale}
                />
              </Link>
              <div className="selected-caption">
                <div>
                  <span className="eyebrow">
                    {p.confidential
                      ? fr
                        ? "INSTITUTIONNEL"
                        : "INSTITUTIONAL"
                      : p.id === "culinapos"
                        ? fr
                          ? "SAAS / RESTAURATION"
                          : "SAAS / RESTAURANTS"
                        : "API / MESSAGING"}
                  </span>
                  <h3>
                    <Link href={href(locale, "projects", p.slug)}>
                      {p.title[locale]}
                      <ArrowUpRight size={23} />
                    </Link>
                  </h3>
                </div>
                <p>{p.shortDescription[locale]}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="universe">
          <p className="eyebrow">
            {fr ? "AUSSI DANS MON UNIVERS" : "ALSO PART OF MY WORK"}
          </p>
          {projects
            .filter((p) => !p.featured)
            .map((p) => {
              return (
                <Link key={p.id} href={href(locale, "projects", p.slug)}>
                  {p.title[locale]}
                  <ArrowUpRight size={16} />
                </Link>
              );
            })}
        </div>
      </section>
      <section className="approach-section">
        <div className="wrap approach-layout">
          <Reveal kind="mask">
            <p className="eyebrow">
              02 / {fr ? "DU BESOIN AU TERRAIN" : "FROM NEED TO REALITY"}
            </p>
            <h2>
              {fr ? "Le code fait partie" : "Code is part"}
              <br />
              {fr ? "de la réponse." : "of the answer."}
            </h2>
            <p className="lead">
              {fr
                ? "La bonne solution commence avant la première ligne de code. Elle continue de se construire après le déploiement."
                : "The right solution starts before the first line of code. It keeps developing after deployment."}
            </p>
          </Reveal>
          <Reveal as="ol" sequence="process" className="process">
            {(fr
              ? [
                  [
                    "Comprendre",
                    "Écouter les personnes, les usages et les contraintes.",
                  ],
                  [
                    "Concevoir",
                    "Relier les parcours, les données et les règles métier.",
                  ],
                  [
                    "Construire",
                    "Développer un ensemble cohérent et maintenable.",
                  ],
                  ["Déployer", "Mettre la solution au contact du terrain."],
                  [
                    "Faire évoluer",
                    "Améliorer le produit à partir de son utilisation.",
                  ],
                ]
              : [
                  [
                    "Understand",
                    "Listen to people, workflows and constraints.",
                  ],
                  ["Design", "Connect journeys, data and business rules."],
                  ["Build", "Develop a coherent, maintainable system."],
                  ["Deploy", "Bring the solution into real-world use."],
                  ["Evolve", "Improve the product through its use."],
                ]
            ).map(([title, text], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="section wrap journey-preview">
        <Reveal kind="mask">
          <p className="eyebrow">03 / {fr ? "LE PARCOURS" : "THE JOURNEY"}</p>
          <h2>
            {fr ? "Du logiciel aux" : "From software to"}
            <br />
            <span className="accent">
              {fr ? "responsabilités." : "responsibility."}
            </span>
          </h2>
          <p className="lead">
            {fr
              ? "L’université, les environnements professionnels et l’entrepreneuriat ont élargi ma manière de concevoir un produit."
              : "University, professional environments and entrepreneurship have broadened the way I approach a product."}
          </p>
          <Action secondary to={href(locale, "about")}>
            {fr ? "Découvrir mon parcours" : "Discover my journey"}
          </Action>
        </Reveal>
        <div className="journey-notes">
          {journeyNotes.map((note) => (
            <Reveal
              sequence="timeline"
              key={note.title.fr}
              className={note.current ? "now-note" : undefined}
            >
              <span>{note.label[locale]}</span>
              <h3>{note.title[locale]}</h3>
              <p>{note.description[locale]}</p>
            </Reveal>
          ))}
        </div>
      </section>
      {(publication || activity) && (
        <section className="section wrap journal-preview">
          <SectionHeading
            number="04"
            title={fr ? "Partager la suite." : "Sharing what comes next."}
          />
          <div className="journal-columns">
            {publication && (
              <div>
                <span className="eyebrow">
                  {fr ? "PUBLICATION" : "WRITING"}
                </span>
                <h3>
                  <Link href={href(locale, "publications", publication.slug)}>
                    {publication.title}
                    <ArrowUpRight />
                  </Link>
                </h3>
                <p>{publication.description}</p>
              </div>
            )}
            {activity && (
              <div>
                <span className="eyebrow">{fr ? "ACTIVITÉ" : "ACTIVITY"}</span>
                <h3>
                  <Link href={href(locale, "activities", activity.slug)}>
                    {activity.title[locale]}
                    <ArrowUpRight />
                  </Link>
                </h3>
                <p>{activity.description[locale]}</p>
              </div>
            )}
          </div>
        </section>
      )}
      <ContactBand locale={locale} />
    </>
  );
}
