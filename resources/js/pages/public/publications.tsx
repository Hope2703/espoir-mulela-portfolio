import { Publications } from "@/features/publications/pages";
import type { Locale } from "@/types/content";
export default function Page({ locale }: { locale: Locale }) {
    return <Publications locale={locale} />;
}
