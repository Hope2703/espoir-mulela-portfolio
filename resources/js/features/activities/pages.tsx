import { useTranslations } from "@/lib/translations";
import { usePortfolio } from "@/lib/portfolio";
import Link from "@/components/ui/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import type { Locale, Activity } from "@/types/content";
import { href } from "@/lib/routes";
import { PageHeading, ContactBand } from "@/components/ui/common";
import { Empty } from "@/components/ui/empty-state";
import { EntryPanel } from "@/components/ui/entry-panel";
import { EditorialMedia } from "@/components/media/editorial-media";
export function Activities({ locale }: { locale: Locale }) {
    const t = useTranslations();
    const { activities } = usePortfolio();
    const items = activities;
    return (
        <>
            <PageHeading
                kicker={t("features_activities_pages_01")}
                title={t("features_activities_pages_02")}
                description={t("features_activities_pages_03")}
            />
            <section className="wrap section activity-list">
                {items.length ? (
                    items.map((a, i) => (
                        <EntryPanel key={a.id}>
                            <Link
                                className="activity-item"
                                href={href(locale, "activities", a.slug)}
                            >
                                <div
                                    className={`activity-visual activity-${i}`}
                                    aria-hidden
                                >
                                    <span>0{i + 1}</span>
                                    <i>↳</i>
                                </div>
                                <div>
                                    <span className="eyebrow">
                                        {a.type[locale]}
                                    </span>
                                    <h2>{a.title[locale]}</h2>
                                    <p>{a.description[locale]}</p>
                                    <dl className="entry-facts">
                                        {a.date && (
                                            <div>
                                                <dt>Date</dt>
                                                <dd>
                                                    <time dateTime={a.date}>
                                                        {new Intl.DateTimeFormat(
                                                            locale,
                                                            {
                                                                dateStyle:
                                                                    "long",
                                                                timeZone: "UTC",
                                                            },
                                                        ).format(
                                                            new Date(a.date),
                                                        )}
                                                    </time>
                                                </dd>
                                            </div>
                                        )}
                                        <div>
                                            <dt>
                                                {t(
                                                    "features_activities_pages_04",
                                                )}
                                            </dt>
                                            <dd>{a.location[locale]}</dd>
                                        </div>
                                        <div>
                                            <dt>
                                                {t(
                                                    "features_activities_pages_05",
                                                )}
                                            </dt>
                                            <dd>{a.role[locale]}</dd>
                                        </div>
                                    </dl>
                                    <span className="text-link">
                                        {t("features_activities_pages_06")}
                                        <ArrowUpRight size={18} />
                                    </span>
                                </div>
                            </Link>
                        </EntryPanel>
                    ))
                ) : (
                    <Empty locale={locale} kind="activities" />
                )}
            </section>
            <ContactBand locale={locale} />
        </>
    );
}
export function ActivityPage({
    activity: a,
    locale,
}: {
    activity: Activity;
    locale: Locale;
}) {
    const t = useTranslations();
    return (
        <>
            <header className="article-header wrap">
                <Link className="text-link" href={href(locale, "activities")}>
                    <ArrowLeft size={16} />
                    {t("features_activities_pages_07")}
                </Link>
                <p className="eyebrow">{a.type[locale]}</p>
                <h1>{a.title[locale]}</h1>
                <p className="lead">{a.description[locale]}</p>
            </header>
            <section className="article-body prose">
                <h2>{t("features_activities_pages_08")}</h2>
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: a.html?.[locale] ?? "" }}
                />
                <EditorialMedia
                    images={(a.media ?? []).map((m) => ({
                        src: m.src,
                        alt: m.alt[locale],
                    }))}
                />
                {a.externalUrl && (
                    <a
                        className="text-link"
                        href={a.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("features_activities_pages_09")}
                    </a>
                )}
                <dl className="activity-facts">
                    <dt>{t("features_activities_pages_10")}</dt>
                    <dd>{a.role[locale]}</dd>
                    <dt>{t("features_activities_pages_11")}</dt>
                    <dd>{a.location[locale]}</dd>
                    {a.date && (
                        <>
                            <dt>Date</dt>
                            <dd>
                                <time dateTime={a.date}>{a.date}</time>
                            </dd>
                        </>
                    )}
                </dl>
            </section>
            <ContactBand locale={locale} />
        </>
    );
}
