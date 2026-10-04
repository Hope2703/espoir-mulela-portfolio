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
export function About({ locale }: { locale: Locale }) {
    const t = useTranslations();
    const { profile, experiences, education, certifications, skills } =
        usePortfolio();
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
                        {education.map((e) => (
                            <Reveal
                                as="article"
                                sequence="timeline"
                                key={e.organization}
                            >
                                <div className="education-period">
                                    {e.period ?? t("features_profile_about_10")}
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
                    <div className="certifications">
                        {certifications.map((c) => (
                            <article key={c.title}>
                                <span className="eyebrow">
                                    {c.organization}
                                </span>
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
