import Image from "next/image";
import { profile } from "@/data/profile";
import type { Locale } from "@/types/content";
export function Portrait({
  locale,
  priority = false,
}: {
  locale: Locale;
  priority?: boolean;
}) {
  return (
    <div
      className={`portrait ${profile.portrait ? "has-photo" : "awaiting-photo"}`}
    >
      {profile.portrait ? (
        <Image
          src={profile.portrait.src}
          alt={profile.portrait.alt[locale]}
          fill
          sizes="(max-width: 700px) 90vw, 42vw"
          preload={priority}
        />
      ) : (
        <div className="portrait-reserve">
          <span className="portrait-initials" aria-hidden>
            EM<span>↳</span>
          </span>
          <p>{profile.name}</p>
        </div>
      )}
      <span className="portrait-caption">
        ESPOIR MULELA MASTOLO <span>01 — KINSHASA</span>
      </span>
    </div>
  );
}
