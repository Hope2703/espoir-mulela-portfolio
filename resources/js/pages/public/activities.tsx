import { Activities } from "@/features/activities/pages";
import type { Locale } from "@/types/content";
export default function Page({ locale }: { locale: Locale }) {
    return <Activities locale={locale} />;
}
