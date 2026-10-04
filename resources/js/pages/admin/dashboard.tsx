import { useAdminTranslation } from "@/lib/admin-translations";
import { usePage } from "@inertiajs/react";
import Link from "@/components/ui/link";
import type { SharedProps } from "@/types/page";
type Row = { path?: string; label?: string; views: number };
type Message = {
    id: number;
    name: string;
    subject: string;
    read_at: string | null;
};
export default function Page({
    stats,
    pages,
    topProjects,
    messages,
}: {
    stats: {
        visitors: Record<string, number>;
        projects: number;
        publications: number;
        activities: number;
        unread: number;
    };
    pages: Row[];
    topProjects: Row[];
    messages: Message[];
}) {
    const a = useAdminTranslation();
    const { auth } = usePage<SharedProps>().props;
    const cards = [
        ["Visiteurs aujourd’hui", stats.visitors["1"]],
        ["Visiteurs 7 jours", stats.visitors["7"]],
        ["Visiteurs 30 jours", stats.visitors["30"]],
        ["Projets publiés", stats.projects],
        ["Publications publiées", stats.publications],
        ["Activités publiées", stats.activities],
        ["Messages non lus", stats.unread],
    ];
    return (
        <>
            <p className="eyebrow">{a("VUE D’ENSEMBLE")}</p>
            <h1>
                {a("Bonjour")} {auth.user?.name.split(" ")[0]}
            </h1>
            <div className="stats-grid">
                {cards.map(([label, value]) => (
                    <article className="admin-panel" key={String(label)}>
                        <p>{a(String(label))}</p>
                        <strong>{value}</strong>
                    </article>
                ))}
            </div>
            <div className="admin-columns">
                {[
                    ["Pages les plus consultées", pages],
                    ["Top projets", topProjects],
                ].map(([label, rows]) => (
                    <section className="admin-panel" key={String(label)}>
                        <h2>{a(String(label))}</h2>
                        {(rows as Row[]).length ? (
                            <ul className="metric-list">
                                {(rows as Row[]).map((r, i) => (
                                    <li key={i}>
                                        <span>{r.path ?? r.label}</span>
                                        <strong>{r.views}</strong>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>{a("Aucune donnée pour le moment.")}</p>
                        )}
                    </section>
                ))}
                <section className="admin-panel">
                    <h2>{a("Derniers messages")}</h2>
                    {messages.length ? (
                        <ul className="metric-list">
                            {messages.map((m) => (
                                <li key={m.id}>
                                    <Link href={"/admin/messages/" + m.id}>
                                        {m.subject}
                                        <small>{m.name}</small>
                                    </Link>
                                    {!m.read_at && (
                                        <span className="accent">●</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{a("Aucun message.")}</p>
                    )}
                </section>
            </div>
        </>
    );
}
