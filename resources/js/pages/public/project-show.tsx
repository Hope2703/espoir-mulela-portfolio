import { CaseStudy } from "@/features/projects/case-study";
import type { Locale, Project } from "@/types/content";
export default function Page({
    locale,
    project,
}: {
    locale: Locale;
    project: Project;
}) {
    return <CaseStudy locale={locale} project={project} />;
}
