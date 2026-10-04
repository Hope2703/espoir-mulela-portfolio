"use client";
import { motionTiming, motionEase } from "@/lib/motion";
import Link from "@/components/ui/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Menu, X, Sun, Moon, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  href,
  navLabels,
  resolveRoute,
  switchLocalePath,
  type RouteKey,
} from "@/lib/routes";
import { setTheme } from "@/lib/theme";
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
      if (openPath !== null && openPath !== pathname) dialog.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, openPath, pathname]);
  function toggleTheme() {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
  }
  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link
          className="brand"
          href={href(locale, "home")}
          aria-label={
            locale === "fr" ? "Espoir Mulela — accueil" : "Espoir Mulela — home"
          }
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
          aria-label={
            locale === "fr" ? "Navigation principale" : "Main navigation"
          }
        >
          {keys.map((key) => (
            <Link
              key={key}
              href={href(locale, key)}
              aria-current={active === key ? "page" : undefined}
            >
              {navLabels[locale][key]}
              {active === key && <span className="nav-indicator" />}
            </Link>
          ))}
        </nav>
        <div className="nav-tools">
          <Link
            className="locale-switch"
            href={switchLocalePath(pathname, locale)}
            aria-label={
              locale === "fr" ? "Read in English" : "Lire en français"
            }
          >
            <span aria-hidden className={locale === "fr" ? "selected" : ""}>
              FR
            </span>
            <span aria-hidden>/</span>
            <span aria-hidden className={locale === "en" ? "selected" : ""}>
              EN
            </span>
          </Link>
          <button
            className="icon-button theme-toggle"
            onClick={toggleTheme}
            aria-label={locale === "fr" ? "Changer de thème" : "Switch theme"}
          >
            <Sun className="sun" size={20} />
            <Moon className="moon" size={20} />
          </button>
          <button
            ref={trigger}
            className="icon-button mobile-trigger"
            onClick={() => setOpen(true)}
            aria-label={locale === "fr" ? "Ouvrir le menu" : "Open menu"}
            aria-expanded={open}
          >
            <Menu />
          </button>
        </div>
      </div>
      <dialog
        ref={dialog}
        className="mobile-dialog"
        aria-label={
          locale === "fr" ? "Navigation principale" : "Main navigation"
        }
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
              initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
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
                  aria-label={locale === "fr" ? "Fermer le menu" : "Close menu"}
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
                    {navLabels[locale][key]}
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
