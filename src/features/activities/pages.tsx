import Link from "@/components/ui/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import type { Locale, Activity } from "@/types/content";
import { href } from "@/lib/routes";
import { PageHeading, ContactBand } from "@/components/ui/common";
import { Empty } from "@/components/ui/empty-state";
import { EntryPanel } from "@/components/ui/entry-panel";
import { getActivities } from "@/content/activities";
export function Activities({ locale }: { locale: Locale }) {
  const fr = locale === "fr",
    items = getActivities();
  return (
    <>
      <PageHeading
        kicker={
          fr
            ? "RENCONTRES / TRANSMISSION / COMMUNAUTÉS"
            : "MEETUPS / SHARING / COMMUNITIES"
        }
        title={fr ? "La technique se partage." : "Engineering is shared."}
        description={
          fr
            ? "Les rencontres, échanges et interventions qui prolongent le travail au-delà des projets."
            : "Meetups, conversations and talks that extend the work beyond projects."
        }
      />
      <section className="wrap section activity-list">
        {items.length ? (
          items.map((a, i) => (
            <EntryPanel key={a.id}>
              <Link
                className="activity-item"
                href={href(locale, "activities", a.slug)}
              >
                <div className={`activity-visual activity-${i}`} aria-hidden>
                  <span>0{i + 1}</span>
                  <i>↳</i>
                </div>
                <div>
                  <span className="eyebrow">{a.type[locale]}</span>
                  <h2>{a.title[locale]}</h2>
                  <p>{a.description[locale]}</p>
                  <dl className="entry-facts">
                    {a.date && (
                      <div>
                        <dt>Date</dt>
                        <dd>
                          <time dateTime={a.date}>
                            {new Intl.DateTimeFormat(locale, {
                              dateStyle: "long",
                              timeZone: "UTC",
                            }).format(new Date(a.date))}
                          </time>
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt>{fr ? "Lieu" : "Location"}</dt>
                      <dd>{a.location[locale]}</dd>
                    </div>
                    <div>
                      <dt>{fr ? "Rôle" : "Role"}</dt>
                      <dd>{a.role[locale]}</dd>
                    </div>
                  </dl>
                  <span className="text-link">
                    {fr ? "Découvrir le format" : "Explore the format"}
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </Link>
            </EntryPanel>
          ))
        ) : (
          <Empty locale={locale} kind="activities" />
        )}
      </section>
      <ContactBand locale={locale} />
    </>
  );
}
export function ActivityPage({
  activity: a,
  locale,
}: {
  activity: Activity;
  locale: Locale;
}) {
  const fr = locale === "fr";
  return (
    <>
      <header className="article-header wrap">
        <Link className="text-link" href={href(locale, "activities")}>
          <ArrowLeft size={16} />
          {fr ? "Toutes les activités" : "All activities"}
        </Link>
        <p className="eyebrow">{a.type[locale]}</p>
        <h1>{a.title[locale]}</h1>
        <p className="lead">{a.description[locale]}</p>
      </header>
      <section className="article-body prose">
        <h2>{fr ? "Participation" : "Participation"}</h2>
        <dl className="activity-facts">
          <dt>{fr ? "Rôle" : "Role"}</dt>
          <dd>{a.role[locale]}</dd>
          <dt>{fr ? "Lieu" : "Location"}</dt>
          <dd>{a.location[locale]}</dd>
          {a.date && (
            <>
              <dt>Date</dt>
              <dd>
                <time dateTime={a.date}>{a.date}</time>
              </dd>
            </>
          )}
        </dl>
      </section>
      <ContactBand locale={locale} />
    </>
  );
}
