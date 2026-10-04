import { useState } from "react";
import { useAdminTranslation } from "@/lib/admin-translations";
import { router, usePage } from "@inertiajs/react";
import Link from "@/components/ui/link";
import { labels, PaginationLinks } from "@/components/admin/forms";
import {
    Button,
    Input,
    Badge,
    Table,
    Dropdown,
    ConfirmAction,
    buttonClass,
} from "@/components/admin/ui";
import { Select } from "@/components/ui/select";
import type { Pagination, SharedProps } from "@/types/page";
import type { Localized } from "@/types/content";
type Item = {
    id: number;
    title: Localized;
    status: string;
    featured?: boolean;
    updated_at: string;
};
export default function Page({
    contentType,
    items,
    filters,
}: {
    contentType: string;
    items: Pagination<Item>;
    filters: { search?: string; status?: string };
}) {
    const a = useAdminTranslation();
    const { locale } = usePage<SharedProps>().props;
    const [search, setSearch] = useState(filters.search ?? ""),
        [status, setStatus] = useState(filters.status ?? ""),
        [deleting, setDeleting] = useState<number | null>(null);
    const base = "/admin/" + contentType;
    return (
        <>
            <div className="admin-heading">
                <h1>{a(labels[contentType])}</h1>
                <Link className={buttonClass()} href={base + "/create"}>
                    {a("Ajouter ↗")}
                </Link>
            </div>
            <form
                className="admin-filters"
                onSubmit={(e) => {
                    e.preventDefault();
                    router.get(
                        base,
                        { search, status },
                        { preserveState: true },
                    );
                }}
            >
                <div className="form-field">
                    <label htmlFor="search">{a("Recherche")}</label>
                    <Input
                        id="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    id="status"
                    label={a("Statut")}
                    value={status}
                    onValueChange={setStatus}
                    options={[
                        { value: "", label: a("Tous") },
                        { value: "draft", label: a("Brouillon") },
                        { value: "published", label: a("Publié") },
                        { value: "archived", label: a("Archivé") },
                    ]}
                />
                <Button type="submit" variant="secondary">
                    {a("Filtrer")}
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => {
                        setSearch("");
                        setStatus("");
                        router.get(base);
                    }}
                >
                    {a("Réinitialiser")}
                </Button>
            </form>
            <Table headers={[a("Titre"), a("Statut"), a("Date"), a("Actions")]}>
                {items.data.map((i) => (
                    <tr key={i.id}>
                        <td>
                            <Link href={base + "/" + i.id + "/edit"}>
                                {i.title[locale]}
                            </Link>
                            {i.featured && <Badge>{a("À la une")}</Badge>}
                        </td>
                        <td data-label={a("Statut")}>
                            <Badge status={i.status}>{a(i.status)}</Badge>
                        </td>
                        <td data-label={a("Date")}>
                            {new Date(i.updated_at).toLocaleDateString(locale)}
                        </td>
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
                                            label: a("Prévisualiser"),
                                            onSelect: () =>
                                                window.open(
                                                    base +
                                                        "/" +
                                                        i.id +
                                                        "/preview?locale=" +
                                                        locale,
                                                    "_blank",
                                                    "noopener,noreferrer",
                                                ),
                                        },
                                        ...(i.status !== "archived"
                                            ? [
                                                  {
                                                      label: a("Archiver"),
                                                      onSelect: () =>
                                                          router.patch(
                                                              base +
                                                                  "/" +
                                                                  i.id +
                                                                  "/archive",
                                                              {},
                                                              {
                                                                  preserveScroll: true,
                                                              },
                                                          ),
                                                  },
                                              ]
                                            : []),
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
            {!items.data.length && (
                <p>
                    {a(
                        "Aucun contenu. Ajoutez une entrée réelle lorsque vous êtes prêt.",
                    )}
                </p>
            )}
            <PaginationLinks items={items} />
            <ConfirmAction
                open={deleting !== null}
                onClose={() => setDeleting(null)}
                title={a("Supprimer ce contenu ?")}
                onConfirm={() =>
                    router.delete(base + "/" + deleting, {
                        preserveScroll: true,
                    })
                }
            />
        </>
    );
}
