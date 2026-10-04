import { Home } from "@/features/profile/home";
import type { Locale } from "@/types/content";
export default function Page({ locale }: { locale: Locale }) {
    return <Home locale={locale} />;
}
