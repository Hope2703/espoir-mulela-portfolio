import { useState } from "react";
import { useAdminTranslation } from "@/lib/admin-translations";
import { router, usePage } from "@inertiajs/react";
import Link from "@/components/ui/link";
import { PaginationLinks } from "@/components/admin/forms";
import {
    Button,
    Badge,
    Table,
    Dropdown,
    ConfirmAction,
    buttonClass,
} from "@/components/admin/ui";
import type { SharedProps, Pagination } from "@/types/page";
type Message = {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
    read_at: string | null;
    archived_at: string | null;
};
export default function Page({
    items,
    message,
    filter,
}: {
    items: Pagination<Message> | null;
    message: Message | null;
    filter: string;
}) {
    const a = useAdminTranslation();
    const { locale } = usePage<SharedProps>().props;
    const [deleting, setDeleting] = useState<number | null>(null);
    const update = (id: number, action: string) =>
        router.patch(
            "/admin/messages/" + id,
            { action },
            { preserveScroll: true },
        );
    const menu = (m: Message) => [
        {
            label: a(m.read_at ? "Marquer non lu" : "Marquer lu"),
            onSelect: () => update(m.id, m.read_at ? "unread" : "read"),
        },
        {
            label: a(m.archived_at ? "Restaurer" : "Archiver"),
            onSelect: () => update(m.id, m.archived_at ? "restore" : "archive"),
        },
        {
            label: a("Supprimer"),
            danger: true,
            onSelect: () => setDeleting(m.id),
        },
    ];
    return (
        <>
            <h1>{a("Messages")}</h1>
            <nav className="admin-tabs" aria-label={a("Boîtes messages")}>
                {[
                    ["inbox", "Inbox"],
                    ["unread", "Non lus"],
                    ["read", "Lus"],
                    ["archived", "Archivés"],
                ].map(([key, label]) => (
                    <Link
                        key={key}
                        className={buttonClass("ghost")}
                        href={"/admin/messages?filter=" + key}
                        aria-current={key === filter ? "page" : undefined}
                    >
                        {a(label)}
                    </Link>
                ))}
            </nav>
            {message ? (
                <article className="admin-panel">
                    <h2>{message.subject}</h2>
                    <Badge
                        status={
                            message.archived_at
                                ? "archived"
                                : message.read_at
                                  ? "read"
                                  : "unread"
                        }
                    >
                        {a(
                            message.archived_at
                                ? "Archivé"
                                : message.read_at
                                  ? "Lu"
                                  : "Non lu",
                        )}
                    </Badge>
                    <p>
                        {message.name} ·{" "}
                        <a href={"mailto:" + message.email}>{message.email}</a>
                    </p>
                    <time>
                        {new Date(message.created_at).toLocaleString(locale)}
                    </time>
                    <p className="message-body">{message.message}</p>
                    <div className="actions">
                        <Link
                            href="/admin/messages"
                            className={buttonClass("outline")}
                        >
                            {a("Retour")}
                        </Link>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                update(
                                    message.id,
                                    message.archived_at ? "restore" : "archive",
                                )
                            }
                        >
                            {a(message.archived_at ? "Restaurer" : "Archiver")}
                        </Button>
                        <Dropdown actions={menu(message)} />
                    </div>
                </article>
            ) : (
                items && (
                    <>
                        <Table
                            headers={[
                                a("Expéditeur"),
                                a("Sujet"),
                                a("Date"),
                                a("Actions"),
                            ]}
                        >
                            {items.data.map((m) => (
                                <tr key={m.id}>
                                    <td>
                                        {m.name}
                                        <Badge
                                            status={
                                                m.archived_at
                                                    ? "archived"
                                                    : m.read_at
                                                      ? "read"
                                                      : "unread"
                                            }
                                        >
                                            {a(
                                                m.archived_at
                                                    ? "Archivé"
                                                    : m.read_at
                                                      ? "Lu"
                                                      : "Non lu",
                                            )}
                                        </Badge>
                                    </td>
                                    <td data-label={a("Sujet")}>{m.subject}</td>
                                    <td data-label={a("Date")}>
                                        {new Date(
                                            m.created_at,
                                        ).toLocaleDateString(locale)}
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <Link
                                                href={"/admin/messages/" + m.id}
                                                className={buttonClass(
                                                    "outline",
                                                )}
                                            >
                                                {a("Lire")}
                                            </Link>
                                            <Dropdown actions={menu(m)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                        {!items.data.length && <p>{a("Aucun message.")}</p>}
                        <PaginationLinks items={items} />
                    </>
                )
            )}
            <ConfirmAction
                open={deleting !== null}
                title={a("Supprimer ce message ?")}
                onClose={() => setDeleting(null)}
                onConfirm={() => router.delete("/admin/messages/" + deleting)}
            />
        </>
    );
}
