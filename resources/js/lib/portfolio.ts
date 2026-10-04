import { usePage } from "@inertiajs/react";
import type { SharedProps } from "@/types/page";
export function usePortfolio() {
    const props = usePage<SharedProps>().props;
    return {
        profile: props.portfolio,
        journeyNotes: props.portfolio.journeyNotes ?? [],
        projects: props.projects ?? [],
        publications: props.publications ?? [],
        activities: props.activities ?? [],
        experiences: props.experiences ?? [],
        education: props.education ?? [],
        certifications: props.certifications ?? [],
        skills: props.skills ?? [],
    };
}
