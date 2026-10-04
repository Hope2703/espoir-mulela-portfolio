import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import { SocialIcon } from "@/components/ui/social-links";
import { PageHeading } from "@/components/ui/common";
import { ContactForm } from "./form";
import type { Locale } from "@/types/content";
export function Contact({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  return (
    <>
      <PageHeading
        kicker={
          fr
            ? "CONTACT / COMMENÇONS PAR UNE CONVERSATION"
            : "CONTACT / START WITH A CONVERSATION"
        }
        title={
          fr ? "Quel est votre prochain projet ?" : "What’s your next project?"
        }
        description={
          fr
            ? "Une opportunité professionnelle, un produit à construire, un partenariat ou une invitation : je serai heureux d’en parler avec vous."
            : "A professional opportunity, a product to build, a partnership or an invitation: I would be glad to discuss it with you."
        }
      />
      <section className="wrap contact-layout">
        <aside>
          <p className="eyebrow">{fr ? "CONTACT DIRECT" : "DIRECT CONTACT"}</p>
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
                  ? fr
                    ? "Discuter sur WhatsApp"
                    : "Chat on WhatsApp"
                  : s.name}
                <ArrowUpRight size={19} />
              </span>
              <strong>{s.label}</strong>
            </a>
          ))}
          <p className="contact-location">{profile.location[locale]}</p>
          <p>
            {fr
              ? "Décrivez le contexte, votre besoin et ce qui compte pour vous. Ces quelques repères suffisent pour commencer."
              : "Tell me about your context, what you need and what matters to you. That is enough to start."}
          </p>
        </aside>
        <ContactForm locale={locale} />
      </section>
    </>
  );
}
