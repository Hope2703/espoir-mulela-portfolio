import { PublicationPage } from "@/features/publications/pages";
import type { Locale, Publication } from "@/types/content";
export default function Page({
    locale,
    publication,
}: {
    locale: Locale;
    publication: Publication;
}) {
    return <PublicationPage locale={locale} publication={publication} />;
}
