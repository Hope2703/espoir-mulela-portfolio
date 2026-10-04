import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import type { SharedProps } from "@/types/page";

export function useDocumentLocale() {
    const { locale } = usePage<SharedProps>().props;
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);
}
