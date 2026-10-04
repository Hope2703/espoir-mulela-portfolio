import { useTranslations } from "@/lib/translations";
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
    const t = useTranslations();
    const list = projects;
    return (
        <div className="wrap">
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
                        className={
                            p.featured
                                ? "index-project featured"
                                : "index-project"
                        }
                    >
                        <Link
                            href={href(locale, "projects", p.slug)}
                            className="project-image-link"
                            aria-label={`${t("features_projects_project-list_02")} ${p.title[locale]}`}
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
                                {locale === "fr" ? "Projet" : "Project"}
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
            {!list.length && <p>{t("features_projects_project-list_03")}</p>}
        </div>
    );
}
