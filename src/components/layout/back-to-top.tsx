"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import type { Locale } from "@/types/content";
export function BackToTop({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => {
      const control = button.current;
      if (!control) return;
      const box = control.getBoundingClientRect();
      // On narrow screens, yield space to the controls underneath the button.
      const overlaps =
        window.innerWidth <= 550 &&
        Array.from(
          document.querySelectorAll<HTMLElement>("a, button, input, textarea"),
        ).some((element) => {
          if (element === control || !element.getClientRects().length)
            return false;
          const rect = element.getBoundingClientRect();
          return (
            rect.right > box.left - 4 &&
            rect.left < box.right + 4 &&
            rect.bottom > box.top - 4 &&
            rect.top < box.bottom + 4
          );
        });
      setVisible(
        window.scrollY > 600 &&
          (!overlaps || document.activeElement === control),
      );
    };
    let frame = requestAnimationFrame(update);
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  const label = locale === "fr" ? "Retour en haut" : "Back to top";
  return (
    <button
      ref={button}
      type="button"
      className={`back-to-top ${visible ? "is-visible" : ""}`}
      aria-label={label}
      title={label}
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
      }}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
