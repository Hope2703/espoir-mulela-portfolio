import { useTranslations, useNavLabels } from "@/lib/translations";
import { usePortfolio } from "@/lib/portfolio";
import { Reveal } from "@/components/motion/reveal";
import Link from "@/components/ui/link";
import { href, routes, type RouteKey } from "@/lib/routes";
import { SocialLinks } from "@/components/ui/social-links";
import type { Locale } from "@/types/content";
export function Footer({ locale }: { locale: Locale }) {
    const t = useTranslations();
    const navLabels = useNavLabels();
    const { profile } = usePortfolio();
    return (
        <Reveal as="footer" sequence="footer" className="site-footer wrap">
            <div className="footer-grid">
                <div>
                    <Link className="footer-name" href={href(locale, "home")}>
                        {profile.name.split(" ").slice(0, 2).join(" ")}
                        <span className="accent">.</span>
                    </Link>
                    <p>
                        {profile.professional_title?.[locale] ?? profile.name}
                    </p>
                    <p>
                        {profile.location_short?.[locale] ??
                            profile.location[locale]}
                    </p>
                </div>
                <div>
                    <h2>Navigation</h2>
                    <nav aria-label={t("components_layout_footer_01")}>
                        {(Object.keys(routes) as RouteKey[]).map((key) => (
                            <Link key={key} href={href(locale, key)}>
                                {navLabels[key]}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div>
                    <h2>
                        {locale === "fr"
                            ? "Restons en contact"
                            : "Let’s stay in touch"}
                    </h2>
                    <p className="footer-contact-invite">
                        {t("components_layout_footer_02")}
                    </p>
                    <SocialLinks />
                </div>
            </div>
            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} Espoir Mulela Mastolo</span>
            </div>
        </Reveal>
    );
}
