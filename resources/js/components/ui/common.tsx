import { useTranslations } from "@/lib/translations";
import { Reveal } from "@/components/motion/reveal";
import Link from "@/components/ui/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Locale } from "@/types/content";
import { href } from "@/lib/routes";
import { SocialLinks } from "./social-links";
export function Action({
    to,
    children,
    secondary = false,
}: {
    to: string;
    children: ReactNode;
    secondary?: boolean;
}) {
    return (
        <Link className={`button ${secondary ? "secondary" : ""}`} href={to}>
            {children}
            <ArrowUpRight size={18} />
        </Link>
    );
}
export function SectionHeading({
    number,
    title,
    children,
}: {
    number: string;
    title: string;
    children?: ReactNode;
}) {
    return (
        <Reveal kind="mask" className="section-heading">
            <span className="eyebrow">{number} /</span>
            <h2>{title}</h2>
            {children}
        </Reveal>
    );
}
export function PageHeading({
    kicker,
    title,
    description,
}: {
    kicker: string;
    title: string;
    description: string;
}) {
    return (
        <div className="page-heading wrap">
            <p className="eyebrow">{kicker}</p>
            <h1>{title}</h1>
            <p className="lead">{description}</p>
        </div>
    );
}
export function ContactBand({ locale }: { locale: Locale }) {
    const t = useTranslations();
    return (
        <Reveal as="section" sequence="contact" className="contact-band wrap">
            <p className="eyebrow">{t("components_ui_common_01")}</p>
            <div>
                <h2>{t("components_ui_common_02")}</h2>
                <Link
                    className="circle-link"
                    href={href(locale, "contact")}
                    aria-label={t("components_ui_common_03")}
                >
                    <ArrowUpRight />
                </Link>
            </div>
            <ContactChannels />
        </Reveal>
    );
}
export function ContactChannels() {
    return <SocialLinks />;
}
