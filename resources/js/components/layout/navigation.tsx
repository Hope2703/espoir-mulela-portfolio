import { useTranslations, useNavLabels } from "@/lib/translations";
import { useLocaleUrl } from "@/lib/navigation";
import { motionTiming, motionEase } from "@/lib/motion";
import Link from "@/components/ui/link";
import { usePathname } from "@/lib/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { href, resolveRoute, type RouteKey } from "@/lib/routes";
import { ThemeControl } from "@/components/layout/session-controls";
import type { Locale } from "@/types/content";
const keys: RouteKey[] = [
    "home",
    "projects",
    "about",
    "activities",
    "publications",
    "contact",
];
export function Navigation() {
    const t = useTranslations();
    const navLabels = useNavLabels();
    const switchUrl = useLocaleUrl();
    const locale = useLocale() as Locale,
        pathname = usePathname();
    const [openPath, setOpenPath] = useState<string | null>(null);
    const open = openPath === pathname;
    const setOpen = (value: boolean) => setOpenPath(value ? pathname : null);
    const dialog = useRef<HTMLDialogElement>(null),
        trigger = useRef<HTMLButtonElement>(null);
    const reduced = useReducedMotion();
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "en" || parts[0] === "fr") parts.shift();
    const active = resolveRoute(locale, parts);
    useEffect(() => {
        if (open) {
            dialog.current?.showModal();
            document.body.style.overflow = "hidden";
        } else {
            if (openPath !== null && openPath !== pathname)
                dialog.current?.close();
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open, openPath, pathname]);
    return (
        <header className="site-nav">
            <div className="nav-inner">
                <Link
                    className="brand"
                    href={href(locale, "home")}
                    aria-label={t("components_layout_navigation_01")}
                >
                    <span className="brand-sign" aria-hidden>
                        ↳
                    </span>
                    <span>
                        ESPOIR
                        <br />
                        MULELA<span className="accent">.</span>
                    </span>
                </Link>
                <nav
                    className="desktop-links"
                    aria-label={t("components_layout_navigation_02")}
                >
                    {keys.map((key) => (
                        <Link
                            key={key}
                            href={href(locale, key)}
                            aria-current={active === key ? "page" : undefined}
                        >
                            {navLabels[key]}
                            {active === key && (
                                <span className="nav-indicator" />
                            )}
                        </Link>
                    ))}
                </nav>
                <div className="nav-tools">
                    <Link
                        className="locale-switch"
                        href={switchUrl}
                        aria-label={t("components_layout_navigation_03")}
                    >
                        <span
                            aria-hidden
                            className={t("components_layout_navigation_04")}
                        >
                            FR
                        </span>
                        <span aria-hidden>/</span>
                        <span
                            aria-hidden
                            className={locale === "en" ? "selected" : ""}
                        >
                            EN
                        </span>
                    </Link>
                    <ThemeControl />
                    <button
                        ref={trigger}
                        className="icon-button mobile-trigger"
                        onClick={() => setOpen(true)}
                        aria-label={t("components_layout_navigation_06")}
                        aria-expanded={open}
                    >
                        <Menu />
                    </button>
                </div>
            </div>
            <dialog
                ref={dialog}
                className="mobile-dialog"
                aria-label={t("components_layout_navigation_07")}
                onCancel={(e) => {
                    e.preventDefault();
                    setOpen(false);
                }}
            >
                <AnimatePresence
                    onExitComplete={() => {
                        dialog.current?.close();
                        trigger.current?.focus();
                    }}
                >
                    {open && (
                        <motion.div
                            className="mobile-panel"
                            initial={
                                reduced
                                    ? false
                                    : { clipPath: "inset(0 0 100% 0)" }
                            }
                            animate={{ clipPath: "inset(0 0 0% 0)" }}
                            exit={{ clipPath: "inset(0 0 100% 0)" }}
                            transition={{
                                duration: reduced ? 0 : motionTiming.ui,
                                ease: motionEase,
                            }}
                        >
                            <div className="mobile-top">
                                <strong>ESPOIR MULELA</strong>
                                <button
                                    className="icon-button"
                                    onClick={() => setOpen(false)}
                                    aria-label={t(
                                        "components_layout_navigation_08",
                                    )}
                                >
                                    <X />
                                </button>
                            </div>
                            <nav>
                                {keys.map((key, i) => (
                                    <Link
                                        href={href(locale, key)}
                                        key={key}
                                        onClick={() => setOpen(false)}
                                    >
                                        <small>0{i + 1}</small>
                                        {navLabels[key]}
                                        <ArrowUpRight />
                                    </Link>
                                ))}
                            </nav>
                            <p>Kinshasa · RD Congo</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </dialog>
        </header>
    );
}
