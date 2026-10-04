import { useSyncExternalStore } from "react";
import { applyTheme, readTheme, themeEvent } from "@/lib/theme";
function subscribe(update: () => void) {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
        applyTheme(readTheme());
        update();
    };
    query.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    window.addEventListener(themeEvent, sync);
    sync();
    return () => {
        query.removeEventListener("change", sync);
        window.removeEventListener("storage", sync);
        window.removeEventListener(themeEvent, sync);
    };
}
export function useTheme() {
    return useSyncExternalStore(subscribe, readTheme, () => "system" as const);
}
