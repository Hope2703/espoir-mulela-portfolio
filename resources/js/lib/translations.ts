import { usePage } from "@inertiajs/react";
import type { SharedProps } from "@/types/page";
export function useTranslations() {
    const { copy } = usePage<SharedProps>().props;
    return (key: string) => copy[key] ?? key;
}

export function useNavLabels() {
    return usePage<SharedProps>().props.ui.nav;
}
