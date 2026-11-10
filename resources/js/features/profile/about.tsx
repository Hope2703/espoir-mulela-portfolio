import { useTranslations } from "@/lib/translations";
import { usePortfolio } from "@/lib/portfolio";
import { Reveal } from "@/components/motion/reveal";
import Link from "@/components/ui/link";
import { ArrowUpRight } from "lucide-react";
import { Portrait } from "@/components/media/portrait";
import {
    ContactBand,
    PageHeading,
    SectionHeading,
} from "@/components/ui/common";
import { href } from "@/lib/routes";
import type { Locale } from "@/types/content";

const languages = [
    ["profile_language_french", "profile_language_fluent"],
    ["profile_language_english", "profile_language_english_level"],
    ["profile_language_lingala", "profile_language_basic"],
    ["profile_language_swahili", "profile_language_basic"],
];

export function About({ locale }: { locale: Locale }) {
    const t = useTranslations();
    const { profile, experiences, education, certifications, skills } =
        usePortfolio();
    const additionalTraining = education.filter(
        (entry) => entry.organization === "New Hope College",
    );
    const academicTraining = education.filter(
        (entry) => entry.organization !== "New Hope College",
    );
    return (
        <>
            <PageHeading
                kicker={t("features_profile_about_01")}
                title={t("features_profile_about_02")}
                description={t("features_profile_about_03")}
            />
            <Reveal as="section" sequence="about" className="wrap about-intro">
                <Portrait locale={locale} priority />
                <div>
                    <p className="eyebrow">{t("features_profile_about_04")}</p>
                    <h2>{t("features_profile_about_05")}</h2>
                    <p>{profile.introduction[locale]}</p>
                    <p>{t("features_profile_about_06")}</p>
                </div>
            </Reveal>
            <section className="section wrap">
                <SectionHeading
                    number="01"
                    title={t("features_profile_about_07")}
                />
                <p className="section-intro">
                    {t("features_profile_about_08")}
                </p>
                <div className="experience-list">
                    {experiences.map((e, i) => (
                        <Reveal
                            as="article"
                            sequence="timeline"
                            key={e.organization}
                        >
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
                        title={t("features_profile_about_09")}
                    />
                    <div className="education-list">
                        {academicTraining.map((e) => (
                            <Reveal
                                as="article"
                                sequence="timeline"
                                key={e.organization}
                            >
                                <div className="education-period">
                                    {e.period}
                                    <span>↳</span>
                                </div>
                                <div>
                                    <p className="eyebrow">{e.organization}</p>
                                    <h3>{e.title[locale]}</h3>
                                    <p>{e.description[locale]}</p>
                                    {e.current && (
                                        <span className="current-label">
                                            {t("features_profile_about_11")}
                                        </span>
                                    )}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                    <section
                        className="profile-credentials"
                        aria-labelledby="spoken-languages"
                    >
                        <h3 id="spoken-languages">
                            {t("features_profile_about_10")}
                        </h3>
                        <dl className="profile-languages">
                            {languages.map(([name, level]) => (
                                <div key={name}>
                                    <dt>{t(name)}</dt>
                                    <dd>{t(level)}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                    {(additionalTraining.length > 0 ||
                        certifications.length > 0) && (
                        <section
                            className="profile-credentials"
                            aria-labelledby="additional-training"
                        >
                            <h3 id="additional-training">
                                {t("profile_additional_training")}
                            </h3>
                            <div className="certifications">
                                {additionalTraining.map((entry) => (
                                    <article key={entry.organization}>
                                        <span className="eyebrow">
                                            {entry.organization}
                                        </span>
                                        <h4>{entry.title[locale]}</h4>
                                        <p>{entry.description[locale]}</p>
                                    </article>
                                ))}
                                {certifications.map((c) => (
                                    <article key={c.title}>
                                        <span className="eyebrow">
                                            {c.organization}
                                        </span>
                                        <h4>{c.title}</h4>
                                        <p>{c.detail[locale]}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </section>
            <section className="section wrap">
                <SectionHeading
                    number="03"
                    title={t("features_profile_about_12")}
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
                                            tool.split(" / ")[
                                                locale === "fr" ? 0 : 1
                                            ] ?? tool,
                                    )
                                    .join(" · ")}
                            </span>
                        </article>
                    ))}
                </div>
            </section>
            <section className="wrap philosophy">
                <span className="eyebrow">
                    {t("features_profile_about_13")}
                </span>
                <h2>{t("features_profile_about_14")}</h2>
                <Link className="text-link" href={href(locale, "projects")}>
                    {t("features_profile_about_15")}
                    <ArrowUpRight size={18} />
                </Link>
            </section>
            <ContactBand locale={locale} />
        </>
    );
}
