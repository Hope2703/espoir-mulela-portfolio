"use client";
import { motionTiming, motionEase } from "@/lib/motion";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Locale, Media } from "@/types/content";
export function ProjectMedia({
  id,
  title,
  media,
  locale,
  interactive = false,
}: {
  id: string;
  title: string;
  media: Media[];
  locale: Locale;
  interactive?: boolean;
}) {
  const [screen, setScreen] = useState(0);
  const reduced = useReducedMotion();
  const fr = locale === "fr";
  if (id === "institutionnel" && !media.length)
    return (
      <div className="project-media fomin-media">
        <span className="media-kicker">
          TAPRINELLA LOGISTIC /{" "}
          {fr ? "APPLICATION MÉTIER" : "BUSINESS SOFTWARE"}
        </span>
        <strong>
          FOMIN<span aria-hidden>↳</span>
        </strong>
        <p>
          {fr ? "Gestion de la redevance minière" : "Mining royalty management"}
        </p>
      </div>
    );
  if (id === "maliyaflow" && media.length) {
    const current = media[screen];
    return (
      <div
        className={`project-media maliya-media ${interactive ? "is-gallery" : ""}`}
      >
        <span className="media-kicker">MALIYAFLOW / IOS</span>
        <div className="maliya-composition">
          <div className="maliya-device maliya-secondary" aria-hidden="true">
            <Image
              src={(media[2] ?? media[0]).src}
              alt=""
              width={591}
              height={1280}
              sizes="(max-width: 700px) 30vw, 230px"
            />
          </div>
          <div className="maliya-device maliya-primary">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.src}
                initial={
                  reduced
                    ? false
                    : { opacity: 0, y: 8, scale: 0.99, filter: "blur(2px)" }
                }
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reduced ? 0 : motionTiming.ui,
                  ease: motionEase,
                }}
              >
                <Image
                  src={current.src}
                  alt={current.alt[locale]}
                  width={current.width}
                  height={current.height}
                  sizes="(max-width: 700px) 62vw, 280px"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {interactive && (
          <>
            <div
              className="gallery-controls"
              aria-label={fr ? "Écrans de MaliyaFlow" : "MaliyaFlow screens"}
            >
              {media.map((item, i) => (
                <button
                  key={item.src}
                  aria-pressed={screen === i}
                  onClick={() => setScreen(i)}
                  aria-label={item.alt[locale]}
                >
                  {
                    (fr
                      ? [
                          "Accueil",
                          "Tâches",
                          "Croissance",
                          "Performances",
                          "Connexion",
                        ]
                      : ["Home", "Tasks", "Growth", "Performance", "Sign in"])[
                      i
                    ]
                  }
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }
  if (media.length)
    return (
      <div className={`project-media capture-media ${id}`}>
        <div className="browser-chrome" aria-hidden>
          <span>● ● ●</span>
          <span>{title}</span>
          <span>↗</span>
        </div>
        <div className="capture-window">
          <Image
            src={media[0].src}
            alt={media[0].alt[locale]}
            width={media[0].width}
            height={media[0].height}
            sizes="(max-width: 700px) 92vw, 75vw"
          />
        </div>
      </div>
    );
  return (
    <div className={`project-media identity-media ${id}`}>
      <strong>
        {title}
        <span aria-hidden>↳</span>
      </strong>
    </div>
  );
}
