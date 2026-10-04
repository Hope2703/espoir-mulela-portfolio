import { useTranslations } from "@/lib/translations";
import { usePortfolio } from "@/lib/portfolio";
const publicLinks = (p: Project) =>
    p.links.filter((link) => link.enabled !== false);
import { Reveal } from "@/components/motion/reveal";
import Link from "@/components/ui/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import type { Project, Locale } from "@/types/content";
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
    const t = useTranslations();
    const { projects } = usePortfolio();
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
                    {t("features_projects_case-study_01")}
                </Link>
                <p className="eyebrow">{fr ? "Projet" : "Project"}</p>
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
                        {t("features_projects_case-study_02")}
                    </p>
                    {p.role && (
                        <div>
                            <h2>{t("features_projects_case-study_03")}</h2>
                            <p>{p.role[locale]}</p>
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
                            {t("features_projects_case-study_06")}
                            <ArrowUpRight size={16} />
                        </a>
                    ))}
                </aside>
                <div className="case-story">
                    <Reveal as="section" sequence="timeline">
                        <span className="eyebrow">
                            01 / {t("features_projects_case-study_07")}
                        </span>
                        <h2>{t("features_projects_case-study_08")}</h2>
                        <p>{p.context[locale]}</p>
                        <div
                            className="prose"
                            dangerouslySetInnerHTML={{ __html: p.html[locale] }}
                        />
                    </Reveal>
                    {p.id !== "maliyaflow" &&
                        p.media.slice(1).map((m) => (
                            <Reveal kind="media" key={m.src}>
                                <img
                                    src={m.src}
                                    alt={m.alt[locale]}
                                    width={m.width}
                                    height={m.height}
                                    loading="lazy"
                                />
                            </Reveal>
                        ))}
                </div>
            </div>
            <div className="wrap next-project">
                <span className="eyebrow">
                    {t("features_projects_case-study_09")}
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
