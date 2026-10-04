import { Mail } from "lucide-react";
import { profile } from "@/data/profile";
import type { Locale } from "@/types/content";

export function SocialIcon({ name }: { name: string }) {
  const props = { size: 20, strokeWidth: 1.7, "aria-hidden": true as const };
  if (name === "Email") return <Mail {...props} />;
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "Instagram" ? (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5h.01" />
        </>
      ) : name === "LinkedIn" ? (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7.5 10v7M11.5 17v-7m0 3a3 3 0 0 1 6 0v4M7.5 7v.01" />
        </>
      ) : (
        <>
          <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8A8.5 8.5 0 1 1 20.5 11.7Z" />
          <path d="m8.2 7.6 1.5 2.6-.9 1a8.6 8.6 0 0 0 3.9 3.5l1-1 2.7 1.3c-.3 1.9-1.6 2.4-3.3 1.8-3.4-1.2-6.5-4.4-6.7-7.1-.1-1.1.5-2 1.8-2.1Z" />
        </>
      )}
    </svg>
  );
}
export function SocialLinks({ locale }: { locale: Locale }) {
  return (
    <nav
      className="social-links"
      aria-label={locale === "fr" ? "Moyens de contact" : "Contact channels"}
    >
      {profile.socials.map((social) => (
        <a
          key={social.name}
          className={`social-link ${social.name === "WhatsApp" ? "is-primary" : ""}`}
          href={social.href}
          target={social.name === "Email" ? undefined : "_blank"}
          rel={social.name === "Email" ? undefined : "noreferrer"}
        >
          <SocialIcon name={social.name} />
          <span>{social.name}</span>
        </a>
      ))}
    </nav>
  );
}
