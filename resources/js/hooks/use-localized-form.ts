import { useForm, usePage } from "@inertiajs/react";
import type { FormDataType } from "@inertiajs/core";
import { useEffect, useRef } from "react";
import type { SharedProps } from "@/types/page";

// A language switch preserves edits, but stale validation belongs to its old locale.
export function useLocalizedForm<T extends FormDataType<T>>(data: T) {
    const form = useForm<T>(data);
    const { locale } = usePage<SharedProps>().props;
    const previousLocale = useRef(locale);
    const { clearErrors } = form;
    useEffect(() => {
        if (previousLocale.current !== locale) {
            clearErrors();
            previousLocale.current = locale;
        }
    }, [locale, clearErrors]);
    return form;
}
