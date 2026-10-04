import { useTranslations } from "@/lib/translations";
import { usePortfolio } from "@/lib/portfolio";
import Link from "@/components/ui/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/types/content";
import { href } from "@/lib/routes";
import { Portrait } from "@/components/media/portrait";
import { ProjectMedia } from "@/components/media/project-media";
import { Reveal } from "@/components/motion/reveal";
import { Action, ContactBand, SectionHeading } from "@/components/ui/common";
export function Home({ locale }: { locale: Locale }) {
    const t = useTranslations();
    const { profile, journeyNotes, projects, publications, activities } =
        usePortfolio();
    const fr = locale === "fr";
    const selected = projects.filter((p) => p.featured);
    const publication = publications[0],
        activity = activities[0];
    return (
        <>
            <section className="hero wrap">
                <div className="hero-name">
                    <span>{profile.name}</span>
                    <span>{t("features_profile_home_01")}</span>
                </div>
                <div className="hero-layout">
                    <div className="hero-copy">
                        <div className="hero-title-reveal">
                            <h1>
                                <span className="hero-first-line">
                                    {profile.hero_title[locale].split("\n")[0]}
                                </span>
                                <span>
                                    {profile.hero_title[locale].split("\n")[1]}
                                    <br />
                                    {profile.hero_title[locale]
                                        .split("\n")
                                        .slice(2)
                                        .join(" ")}
                                </span>
                            </h1>
                        </div>
                        <p className="hero-fields">
                            Web · Mobile · {t("features_profile_home_05")}
                            <br />
                            {t("features_profile_home_06")} ·{" "}
                            {t("features_profile_home_07")}
                        </p>
                        <p className="hero-intro">
                            {profile.introduction[locale]}
                        </p>
                        <div className="actions">
                            <Action to={href(locale, "projects")}>
                                {t("features_profile_home_08")}
                            </Action>
                            <Action secondary to={href(locale, "about")}>
                                {t("features_profile_home_09")}
                            </Action>
                        </div>
                    </div>
                    <div className="hero-portrait">
                        <Portrait locale={locale} priority />
                    </div>
                </div>
                <div className="hero-baseline">
                    <span>{t("features_profile_home_10")}</span>
                    <span className="signature-line">
                        {t("features_profile_home_11")}
                        <i />
                        {t("features_profile_home_12")}
                        <i />
                        {t("features_profile_home_13")}
                        <span>↳</span>
                    </span>
                </div>
            </section>
            <section className="section wrap">
                <SectionHeading
                    number="01"
                    title={t("features_profile_home_14")}
                >
                    <Link className="text-link" href={href(locale, "projects")}>
                        {t("features_profile_home_15")}
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
                                aria-label={`${t("features_profile_home_16")} ${p.title[locale]}`}
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
                                            ? t("features_profile_home_17")
                                            : p.id === "culinapos"
                                              ? t("features_profile_home_18")
                                              : "API / MESSAGING"}
                                    </span>
                                    <h3>
                                        <Link
                                            href={href(
                                                locale,
                                                "projects",
                                                p.slug,
                                            )}
                                        >
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
                    <p className="eyebrow">{t("features_profile_home_19")}</p>
                    {projects
                        .filter((p) => !p.featured)
                        .map((p) => {
                            return (
                                <Link
                                    key={p.id}
                                    href={href(locale, "projects", p.slug)}
                                >
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
                            02 / {t("features_profile_home_20")}
                        </p>
                        <h2>
                            {t("features_profile_home_21")}
                            <br />
                            {t("features_profile_home_22")}
                        </h2>
                        <p className="lead">{t("features_profile_home_23")}</p>
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
                                  [
                                      "Déployer",
                                      "Mettre la solution au contact du terrain.",
                                  ],
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
                                  [
                                      "Design",
                                      "Connect journeys, data and business rules.",
                                  ],
                                  [
                                      "Build",
                                      "Develop a coherent, maintainable system.",
                                  ],
                                  [
                                      "Deploy",
                                      "Bring the solution into real-world use.",
                                  ],
                                  [
                                      "Evolve",
                                      "Improve the product through its use.",
                                  ],
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
                    <p className="eyebrow">
                        03 / {t("features_profile_home_24")}
                    </p>
                    <h2>
                        {t("features_profile_home_25")}
                        <br />
                        <span className="accent">
                            {t("features_profile_home_26")}
                        </span>
                    </h2>
                    <p className="lead">{t("features_profile_home_27")}</p>
                    <Action secondary to={href(locale, "about")}>
                        {t("features_profile_home_28")}
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
                        title={t("features_profile_home_29")}
                    />
                    <div className="journal-columns">
                        {publication && (
                            <div>
                                <span className="eyebrow">
                                    {t("features_profile_home_30")}
                                </span>
                                <h3>
                                    <Link
                                        href={href(
                                            locale,
                                            "publications",
                                            publication.slug,
                                        )}
                                    >
                                        {publication.title}
                                        <ArrowUpRight />
                                    </Link>
                                </h3>
                                <p>{publication.description}</p>
                            </div>
                        )}
                        {activity && (
                            <div>
                                <span className="eyebrow">
                                    {t("features_profile_home_31")}
                                </span>
                                <h3>
                                    <Link
                                        href={href(
                                            locale,
                                            "activities",
                                            activity.slug,
                                        )}
                                    >
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
