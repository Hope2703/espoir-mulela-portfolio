import { About } from "@/features/profile/about";
import type { Locale } from "@/types/content";
export default function Page({ locale }: { locale: Locale }) {
    return <About locale={locale} />;
}
