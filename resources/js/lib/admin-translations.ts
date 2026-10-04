import { usePage } from "@inertiajs/react";
import type { SharedProps } from "@/types/page";
export function useAdminTranslation() {
    const { adminCopy } = usePage<SharedProps>().props;
    return (text: string) => adminCopy[text] ?? text;
}
export function useAuthCopy() {
    return usePage<SharedProps>().props.authCopy;
}
