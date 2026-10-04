import { useTranslations } from "@/lib/translations";
import { ProjectList } from "@/features/projects/project-list";
import { PageHeading, ContactBand } from "@/components/ui/common";
import type { Project, Locale } from "@/types/content";
export default function Page({
    projects,
    locale,
}: {
    projects: Project[];
    locale: Locale;
}) {
    const t = useTranslations();
    return (
        <>
            <PageHeading
                kicker={t("pages_public_projects_01")}
                title={t("pages_public_projects_02")}
                description={t("pages_public_projects_03")}
            />
            <ProjectList projects={projects} locale={locale} />
            <ContactBand locale={locale} />
        </>
    );
}
