import { useState } from "react";
import { useAdminTranslation } from "@/lib/admin-translations";
import { router, usePage } from "@inertiajs/react";
import Link from "@/components/ui/link";
import { labels, PaginationLinks, type Data } from "@/components/admin/forms";
import {
    Table,
    Dropdown,
    ConfirmAction,
    Badge,
    buttonClass,
} from "@/components/admin/ui";
import type { Pagination, SharedProps } from "@/types/page";
import type { Localized } from "@/types/content";
type Item = Data & { id: number };
export default function Page({
    module,
    items,
}: {
    module: string;
    items: Pagination<Item>;
}) {
    const a = useAdminTranslation();
    const { locale } = usePage<SharedProps>().props;
    const [deleting, setDeleting] = useState<number | null>(null);
    const base = "/admin/" + module;
    return (
        <>
            <div className="admin-heading">
                <h1>{a(labels[module])}</h1>
                <div className="actions">
                    {module === "skills" && (
                        <Link
                            className={buttonClass("ghost")}
                            href="/admin/skill-categories"
                        >
                            {a("Catégories")}
                        </Link>
                    )}
                    {module === "skill-categories" && (
                        <Link
                            className={buttonClass("ghost")}
                            href="/admin/skills"
                        >
                            {a("Retour")}
                        </Link>
                    )}
                    <Link className={buttonClass()} href={base + "/create"}>
                        {a("Ajouter ↗")}
                    </Link>
                </div>
            </div>
            <Table headers={[a("Entrée"), a("Ordre"), a("Actions")]}>
                {items.data.map((i) => (
                    <tr key={i.id}>
                        <td>
                            {String(
                                i.organization ??
                                    i.name ??
                                    i.platform ??
                                    (i.title as Localized)?.[locale] ??
                                    "",
                            )}
                            {typeof i.visible === "boolean" && (
                                <Badge>
                                    {a(i.visible ? "Visible" : "Masqué")}
                                </Badge>
                            )}
                            {typeof i.enabled === "boolean" && (
                                <Badge>
                                    {a(i.enabled ? "Actif" : "Inactif")}
                                </Badge>
                            )}
                        </td>
                        <td data-label={a("Ordre")}>{String(i.sort_order)}</td>
                        <td>
                            <div className="actions">
                                <Link
                                    className={buttonClass("outline")}
                                    href={base + "/" + i.id + "/edit"}
                                >
                                    {a("Modifier")}
                                </Link>
                                <Dropdown
                                    actions={[
                                        {
                                            label: a("Supprimer"),
                                            danger: true,
                                            onSelect: () => setDeleting(i.id),
                                        },
                                    ]}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>
            {!items.data.length && <p>{a("Aucune entrée.")}</p>}
            <PaginationLinks items={items} />
            <ConfirmAction
                open={deleting !== null}
                title={a("Supprimer cette entrée ?")}
                onClose={() => setDeleting(null)}
                onConfirm={() =>
                    router.delete(base + "/" + deleting, {
                        preserveScroll: true,
                    })
                }
            />
        </>
    );
}
