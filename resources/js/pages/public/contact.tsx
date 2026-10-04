import { Contact } from "@/features/contact/page";
import type { Locale } from "@/types/content";
export default function Page({ locale }: { locale: Locale }) {
    return <Contact locale={locale} />;
}
