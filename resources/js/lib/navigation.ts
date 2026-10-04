import { usePage, router } from "@inertiajs/react";
import type { SharedProps } from "@/types/page";
export function usePathname() {
    return usePage().url.split("?")[0];
}
export function useLocale() {
    return usePage<SharedProps>().props.locale;
}
export function useRouter() {
    return { push: (url: string) => router.visit(url) };
}
export function useLocaleUrl() {
    const page = usePage<SharedProps>();
    return (
        page.props.meta?.switchUrl ?? (page.props.locale === "fr" ? "/en" : "/")
    );
}
