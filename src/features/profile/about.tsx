import { Reveal } from "@/components/motion/reveal";
import Link from "@/components/ui/link";
import { ArrowUpRight } from "lucide-react";
import {
  profile,
  experiences,
  education,
  certifications,
  skills,
} from "@/data/profile";
import { Portrait } from "@/components/media/portrait";
import {
  ContactBand,
  PageHeading,
  SectionHeading,
} from "@/components/ui/common";
import { href } from "@/lib/routes";
import type { Locale } from "@/types/content";
export function About({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  return (
    <>
      <PageHeading
        kicker={
          fr
            ? "LE PARCOURS / ESPOIR MULELA MASTOLO"
            : "THE JOURNEY / ESPOIR MULELA MASTOLO"
        }
        title={fr ? "Un regard sur l’ensemble." : "A view of the whole."}
        description={
          fr
            ? "Comprendre les personnes et leurs besoins. Concevoir le logiciel. Le faire fonctionner dans la réalité."
            : "Understanding people and their needs. Designing software. Making it work in the real world."
        }
      />
      <Reveal as="section" sequence="about" className="wrap about-intro">
        <Portrait locale={locale} priority />
        <div>
          <p className="eyebrow">
            {fr ? "INGÉNIEUR & ENTREPRENEUR" : "ENGINEER & ENTREPRENEUR"}
          </p>
          <h2>
            {fr
              ? "Je m’intéresse autant au pourquoi qu’au comment."
              : "I care about the why as much as the how."}
          </h2>
          <p>{profile.introduction[locale]}</p>
          <p>
            {fr
              ? "Mon parcours relie l’ingénierie logicielle, l’exploitation d’applications et l’entrepreneuriat. Les environnements dans lesquels j’ai travaillé m’ont appris à regarder au-delà de l’écran : les personnes qui utilisent le produit, les données dont il dépend et les équipes qui le font vivre."
              : "My background connects software engineering, application operations and entrepreneurship. The environments I have worked in have taught me to look beyond the screen: the people using the product, the data it relies on and the teams keeping it running."}
          </p>
        </div>
      </Reveal>
      <section className="section wrap">
        <SectionHeading
          number="01"
          title={
            fr
              ? "Des contextes qui font progresser."
              : "Environments that shape a practice."
          }
        />
        <p className="section-intro">
          {fr
            ? "Entreprise, institution, projets et initiatives entrepreneuriales : chaque contexte apporte ses contraintes et élargit ma compréhension du travail technique."
            : "Companies, institutions, projects and entrepreneurial initiatives: each setting brings its own constraints and broadens my understanding of technical work."}
        </p>
        <div className="experience-list">
          {experiences.map((e, i) => (
            <Reveal as="article" sequence="timeline" key={e.organization}>
              <span className="experience-index">0{i + 1}</span>
              <div>
                <h3>{e.organization}</h3>
                <p className="role">{e.role[locale]}</p>
                {e.period && <p>{e.period}</p>}
              </div>
              <div>
                <p>{e.description[locale]}</p>
                <ul>
                  {e.contributions.map((c) => (
                    <li key={c.fr}>{c[locale]}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section education-section">
        <div className="wrap">
          <SectionHeading
            number="02"
            title={
              fr
                ? "Un socle, de nouveaux horizons."
                : "A foundation. New horizons."
            }
          />
          <div className="education-list">
            {education.map((e, i) => (
              <Reveal as="article" sequence="timeline" key={e.organization}>
                <div className="education-period">
                  {e.period ?? (fr ? "LANGUES" : "LANGUAGES")}
                  <span>↳</span>
                </div>
                <div>
                  <p className="eyebrow">{e.organization}</p>
                  <h3>{e.title[locale]}</h3>
                  <p>{e.description[locale]}</p>
                  {i === 1 && (
                    <span className="current-label">
                      {fr ? "Formation en cours" : "Training in progress"}
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
          <div className="certifications">
            {certifications.map((c) => (
              <article key={c.title}>
                <span className="eyebrow">{c.organization}</span>
                <h3>{c.title}</h3>
                <p>{c.detail[locale]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section wrap">
        <SectionHeading
          number="03"
          title={
            fr ? "Ce que je relie au quotidien." : "What I connect in my work."
          }
        />
        <div className="skill-list">
          {skills.map((s) => (
            <article key={s.title.fr}>
              <h3>{s.title[locale]}</h3>
              <p>{s.description[locale]}</p>
              <span>
                {s.tools
                  .map(
                    (tool) =>
                      tool.split(" / ")[locale === "fr" ? 0 : 1] ?? tool,
                  )
                  .join(" · ")}
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="wrap philosophy">
        <span className="eyebrow">
          {fr ? "UNE CONVICTION" : "A WORKING PRINCIPLE"}
        </span>
        <h2>
          {fr
            ? "Une solution réussie doit être comprise, utilisée et pouvoir évoluer."
            : "A successful solution should be understood, used and able to evolve."}
        </h2>
        <Link className="text-link" href={href(locale, "projects")}>
          {fr
            ? "Voir cette approche dans mes projets"
            : "See this approach in my projects"}
          <ArrowUpRight size={18} />
        </Link>
      </section>
      <ContactBand locale={locale} />
    </>
  );
}
