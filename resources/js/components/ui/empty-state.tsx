import { useTranslations } from "@/lib/translations";
import Link from "@/components/ui/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/types/content";
import { href } from "@/lib/routes";
export function Empty({
    locale,
    kind,
}: {
    locale: Locale;
    kind: "activities" | "publications";
}) {
    const t = useTranslations();
    return (
        <div className="empty-state">
            <span className="empty-sign" aria-hidden>
                ↳
            </span>
            <h2>{t("components_ui_empty-state_01")}</h2>
            <p>
                {locale === "fr"
                    ? kind === "activities"
                        ? "Les prochaines activités seront documentées ici, avec leur contexte et ma participation."
                        : "Les prochaines notes et publications paraîtront ici."
                    : kind === "activities"
                      ? "Future activities will appear here, with their context and my participation."
                      : "Future notes and articles will appear here."}
            </p>
            <Link className="text-link" href={href(locale, "contact")}>
                {t("components_ui_empty-state_02")}
                <ArrowUpRight size={18} />
            </Link>
        </div>
    );
}
