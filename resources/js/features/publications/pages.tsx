import { useTranslations } from "@/lib/translations";
import { usePortfolio } from "@/lib/portfolio";
import Link from "@/components/ui/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import type { Locale, Publication } from "@/types/content";
import { href } from "@/lib/routes";
import { PageHeading, ContactBand } from "@/components/ui/common";
import { Empty } from "@/components/ui/empty-state";
import { EntryPanel } from "@/components/ui/entry-panel";
export function Publications({ locale }: { locale: Locale }) {
    const t = useTranslations();
    const { publications } = usePortfolio();
    const items = publications;
    return (
        <>
            <PageHeading
                kicker={t("features_publications_pages_01")}
                title={t("features_publications_pages_02")}
                description={t("features_publications_pages_03")}
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
                                        {p.readingTime} MIN
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
export function PublicationPage({
    publication: p,
    locale,
}: {
    publication: Publication;
    locale: Locale;
}) {
    const t = useTranslations();
    return (
        <>
            <header className="article-header wrap">
                <Link className="text-link" href={href(locale, "publications")}>
                    <ArrowLeft size={16} />
                    {t("features_publications_pages_04")}
                </Link>
                <p className="eyebrow">{p.readingTime} MIN</p>
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
            {p.cover && (
                <div className="wrap article-cover">
                    <img src={p.cover} alt={p.title} loading="eager" />
                </div>
            )}
            <article className="article-body">
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: p.html ?? "" }}
                />
            </article>
            <ContactBand locale={locale} />
        </>
    );
}
