import { Reveal } from "@/components/motion/reveal";
import Link from "@/components/ui/link";
import { href, navLabels, routes, type RouteKey } from "@/lib/routes";
import { SocialLinks } from "@/components/ui/social-links";
import { Preferences } from "./preferences";
import type { Locale } from "@/types/content";
export function Footer({ locale }: { locale: Locale }) {
  return (
    <Reveal as="footer" sequence="footer" className="site-footer wrap">
      <div className="footer-grid">
        <div>
          <Link className="footer-name" href={href(locale, "home")}>
            Espoir Mulela<span className="accent">.</span>
          </Link>
          <p>
            {locale === "fr"
              ? "Ingénieur informatique / développeur Full-Stack"
              : "Software engineer / Full-Stack developer"}
          </p>
          <p>{locale === "fr" ? "Kinshasa, RDC" : "Kinshasa, DR Congo"}</p>
        </div>
        <div>
          <h2>Navigation</h2>
          <nav
            aria-label={
              locale === "fr"
                ? "Navigation de pied de page"
                : "Footer navigation"
            }
          >
            {(Object.keys(routes) as RouteKey[]).map((key) => (
              <Link key={key} href={href(locale, key)}>
                {navLabels[locale][key]}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2>Contact</h2>
          <p className="footer-contact-invite">
            {locale === "fr"
              ? "Un projet, une collaboration ou une opportunité ?"
              : "A project, a collaboration or an opportunity?"}
          </p>
          <SocialLinks locale={locale} />
        </div>
        <div>
          <h2>{locale === "fr" ? "Préférences" : "Preferences"}</h2>
          <Preferences locale={locale} />
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Espoir Mulela Mastolo</span>
      </div>
    </Reveal>
  );
}
