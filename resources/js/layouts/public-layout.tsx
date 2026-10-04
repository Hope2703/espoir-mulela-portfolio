import { useDocumentLocale } from "@/hooks/use-document-locale";
import { useTranslations } from "@/lib/translations";
import type { ReactNode } from "react";
import { usePage } from "@inertiajs/react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/layout/back-to-top";
import { MotionRoot, PageTransition } from "@/components/motion/reveal";
import { PageMeta } from "@/components/page-meta";
import type { SharedProps } from "@/types/page";
export default function PublicLayout({ children }: { children: ReactNode }) {
    useDocumentLocale();
    const t = useTranslations();
    const { locale, meta, preview } = usePage<SharedProps>().props;
    return (
        <MotionRoot>
            {meta && <PageMeta meta={meta} />}
            <a className="skip-link" href="#main">
                {t("layouts_public-layout_01")}
            </a>
            <Navigation />
            {preview && (
                <div className="wrap" role="status">
                    Prévisualisation privée — brouillon
                </div>
            )}
            <main id="main" tabIndex={-1}>
                <PageTransition>{children}</PageTransition>
            </main>
            <Footer locale={locale} />
            <BackToTop />
        </MotionRoot>
    );
}
