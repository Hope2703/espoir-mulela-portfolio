import Link from "@/components/ui/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import type { Locale, Publication } from "@/types/content";
import { href } from "@/lib/routes";
import { PageHeading, ContactBand } from "@/components/ui/common";
import { getPublications } from "@/content/publications";
import { Empty } from "@/components/ui/empty-state";
import { EntryPanel } from "@/components/ui/entry-panel";
import { ArticleBody } from "./mdx";
export function Publications({ locale }: { locale: Locale }) {
  const fr = locale === "fr",
    items = getPublications(locale);
  return (
    <>
      <PageHeading
        kicker={
          fr
            ? "NOTES / IDÉES / RETOURS D’EXPÉRIENCE"
            : "NOTES / IDEAS / LESSONS LEARNED"
        }
        title={fr ? "Mettre les idées au clair." : "Thinking things through."}
        description={
          fr
            ? "Un espace pour documenter les choix derrière les produits et partager ce que la pratique m’apprend."
            : "A space to document the decisions behind products and share what practice teaches me."
        }
      />
      <section className="wrap section journal-list">
        {items.length ? (
          items.map((p, i) => (
            <EntryPanel key={p.slug}>
              <Link
                className="journal-item"
                href={href(locale, "publications", p.slug)}
              >
                <span className="journal-number">
                  0{i + 1}
                  <span>↳</span>
                </span>
                <div>
                  <span className="eyebrow">
                    {p.tags.join(" / ")} · {p.readingTime} MIN
                  </span>
                  <h2>{p.title}</h2>
                  <p>{p.description}</p>
                  {p.date && (
                    <time dateTime={p.date}>
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "long",
                      }).format(new Date(p.date))}
                    </time>
                  )}
                </div>
                <ArrowUpRight />
              </Link>
            </EntryPanel>
          ))
        ) : (
          <Empty locale={locale} kind="publications" />
        )}
      </section>
      <ContactBand locale={locale} />
    </>
  );
}
export async function PublicationPage({
  publication: p,
  locale,
}: {
  publication: Publication;
  locale: Locale;
}) {
  const fr = locale === "fr";
  return (
    <>
      <header className="article-header wrap">
        <Link className="text-link" href={href(locale, "publications")}>
          <ArrowLeft size={16} />
          {fr ? "Toutes les publications" : "All writing"}
        </Link>
        <p className="eyebrow">
          {p.tags.join(" / ")} · {p.readingTime} MIN
        </p>
        <h1>{p.title}</h1>
        <p className="lead">{p.description}</p>
        <p>
          Espoir Mulela Mastolo
          {p.date && (
            <>
              {" "}
              · <time dateTime={p.date}>{p.date}</time>
            </>
          )}
        </p>
      </header>
      <article className="article-body">
        <ArticleBody publication={p} />
      </article>
      <ContactBand locale={locale} />
    </>
  );
}
