import { useTranslations } from "@/lib/translations";
import { usePortfolio } from "@/lib/portfolio";
import { ArrowUpRight } from "lucide-react";
import { SocialIcon } from "@/components/ui/social-links";
import { PageHeading } from "@/components/ui/common";
import { ContactForm } from "./form";
import type { Locale } from "@/types/content";
export function Contact({ locale }: { locale: Locale }) {
    const t = useTranslations();
    const { profile } = usePortfolio();
    return (
        <>
            <PageHeading
                kicker={t("features_contact_page_01")}
                title={t("features_contact_page_02")}
                description={t("features_contact_page_03")}
            />
            <section className="wrap contact-layout">
                <aside>
                    <p className="eyebrow">{t("features_contact_page_04")}</p>
                    {profile.socials.map((s) => (
                        <a
                            className="contact-channel"
                            href={s.href}
                            key={s.name}
                            target={s.name === "Email" ? undefined : "_blank"}
                            rel={s.name === "Email" ? undefined : "noreferrer"}
                        >
                            <span>
                                <SocialIcon name={s.name} />
                                {s.name === "WhatsApp"
                                    ? t("features_contact_page_05")
                                    : s.name}
                                <ArrowUpRight size={19} />
                            </span>
                            <strong>{s.label}</strong>
                        </a>
                    ))}
                    <p className="contact-location">
                        {profile.location[locale]}
                    </p>
                    <p>{t("features_contact_page_06")}</p>
                </aside>
                <ContactForm locale={locale} />
            </section>
        </>
    );
}
