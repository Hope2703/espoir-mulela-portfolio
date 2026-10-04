"use client";
import { useLocale } from "next-intl";
export default function Error({ reset }: { reset: () => void }) {
  const fr = useLocale() === "fr";
  return (
    <section className="wrap error-page">
      <p className="eyebrow">
        {fr ? "UNE INTERRUPTION" : "SOMETHING WENT WRONG"}
      </p>
      <h1>{fr ? "Reprenons le fil." : "Let’s pick up the thread."}</h1>
      <p>
        {fr
          ? "La page n’a pas pu être chargée. Vous pouvez réessayer."
          : "The page could not load. Please try again."}
      </p>
      <button className="button" onClick={reset}>
        {fr ? "Réessayer" : "Try again"}
      </button>
    </section>
  );
}
