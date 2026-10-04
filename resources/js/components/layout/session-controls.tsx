import { router, usePage } from "@inertiajs/react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { setTheme } from "@/lib/theme";
import { Button } from "@/components/admin/ui";
import { useAuthCopy } from "@/lib/admin-translations";
import type { SharedProps } from "@/types/page";
export function ThemeControl() {
    const copy = useAuthCopy();
    useTheme();
    return (
        <button
            type="button"
            className="theme-toggle icon-button"
            aria-label={copy.theme}
            title={copy.theme}
            onClick={() =>
                setTheme(
                    document.documentElement.dataset.theme === "dark"
                        ? "light"
                        : "dark",
                )
            }
        >
            <Sun className="sun" size={20} aria-hidden />
            <Moon className="moon" size={20} aria-hidden />
        </button>
    );
}
export function SessionControls() {
    const { locale } = usePage<SharedProps>().props;
    const copy = useAuthCopy();
    return (
        <div className="session-controls">
            <div
                id="session-language"
                className="locale-segments"
                role="group"
                aria-label={copy.language}
            >
                {(["fr", "en"] as const).map((l) => (
                    <Button
                        variant="ghost"
                        key={l}
                        type="button"
                        aria-pressed={l === locale}
                        onClick={() => {
                            if (l !== locale)
                                router.post(
                                    "/locale",
                                    { locale: l },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                        }}
                    >
                        {l.toUpperCase()}
                    </Button>
                ))}
            </div>
            <ThemeControl />
        </div>
    );
}
