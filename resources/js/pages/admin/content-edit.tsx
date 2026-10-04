import { useState } from "react";
import { useLocalizedForm as useForm } from "@/hooks/use-localized-form";
import { useAdminTranslation } from "@/lib/admin-translations";
import {
    Field,
    Errors,
    EditorSection,
    labels,
    type Data,
} from "@/components/admin/forms";
import { Button, Checkbox, Tabs, buttonClass } from "@/components/admin/ui";
import { Select } from "@/components/ui/select";
import Link from "@/components/ui/link";
import type { Localized } from "@/types/content";
export default function Page({
    contentType,
    item,
}: {
    contentType: string;
    item: (Data & { id: number }) | null;
}) {
    const a = useAdminTranslation();
    const [locale, setLocale] = useState<"fr" | "en">("fr");
    const project = contentType === "projects",
        activity = contentType === "activities";
    const bilingual = [
        "title",
        "slug",
        activity ? "summary" : "excerpt",
        activity || project ? "description" : "body",
        ...(project
            ? ["context", "role"]
            : activity
              ? ["role", "location"]
              : []),
        ...(!activity ? ["seo_title", "seo_description"] : []),
    ];
    const initial: Data = {
        status: item?.status ?? "draft",
        published_at: String(item?.published_at ?? "").slice(0, 16),
        sort_order: item?.sort_order ?? 0,
    };
    for (const key of bilingual)
        initial[key] = item?.[key] ?? { fr: "", en: "" };
    if (project) {
        initial.featured = item?.featured ?? false;
        initial.confidential = item?.confidential ?? false;
    }
    if (activity) {
        initial.type = item?.type ?? "other";
        initial.event_date = String(item?.event_date ?? "").slice(0, 10);
    }
    if (project || activity) initial.external_url = item?.external_url ?? "";
    const form = useForm<Data>(initial);
    const translated = (k: string) => form.data[k] as Localized;
    const field = (k: string) => (
        <Field
            key={k}
            name={k + "." + locale}
            label={(labels[k] ?? k) + " (" + locale + ")"}
            value={translated(k)[locale]}
            area={[
                "description",
                "body",
                "excerpt",
                "summary",
                "context",
                "role",
                "seo_description",
            ].includes(k)}
            onChange={(v) => form.setData(k, { ...translated(k), [locale]: v })}
        />
    );
    const save = () =>
        item
            ? form.put("/admin/" + contentType + "/" + item.id)
            : form.post("/admin/" + contentType);
    return (
        <>
            <div className="admin-heading">
                <h1>
                    {a(item ? "Modifier" : "Ajouter")} /{" "}
                    {a(labels[contentType])}
                </h1>
                <Link
                    href={"/admin/" + contentType}
                    className={buttonClass("outline")}
                >
                    {a("Retour")}
                </Link>
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    save();
                }}
            >
                <Errors errors={form.errors as Record<string, string>} />
                <Tabs value={locale} onChange={setLocale} />
                <EditorSection title={a("Contenu")}>
                    {[
                        "title",
                        "slug",
                        activity ? "summary" : "excerpt",
                        project || activity ? "description" : "body",
                    ].map(field)}
                    {(project || activity) && (
                        <details className="admin-details">
                            <summary>{a("Contexte et rôle")}</summary>
                            {(project
                                ? ["context", "role"]
                                : ["role", "location"]
                            ).map(field)}
                        </details>
                    )}
                </EditorSection>
                <EditorSection title={a("Informations")}>
                    {(project || activity) && (
                        <Field
                            name="external_url"
                            label={a("Site officiel public")}
                            type="url"
                            value={String(form.data.external_url)}
                            onChange={(v) => form.setData("external_url", v)}
                        />
                    )}
                    {project && (
                        <>
                            <Checkbox
                                checked={Boolean(form.data.featured)}
                                onChange={(e) =>
                                    form.setData("featured", e.target.checked)
                                }
                            >
                                {a("À la une")}
                            </Checkbox>
                            <Checkbox
                                checked={Boolean(form.data.confidential)}
                                onChange={(e) =>
                                    form.setData(
                                        "confidential",
                                        e.target.checked,
                                    )
                                }
                            >
                                {a("Confidentiel")}
                            </Checkbox>
                        </>
                    )}
                    {activity && (
                        <>
                            <Field
                                name="type"
                                value={String(form.data.type)}
                                onChange={(v) => form.setData("type", v)}
                            />
                            <Field
                                name="event_date"
                                type="date"
                                value={String(form.data.event_date)}
                                onChange={(v) => form.setData("event_date", v)}
                            />
                        </>
                    )}
                    <Select
                        id="publication-status"
                        label={a("Statut")}
                        value={String(form.data.status)}
                        options={[
                            { value: "draft", label: a("Brouillon") },
                            { value: "published", label: a("Publié") },
                            { value: "archived", label: a("Archivé") },
                        ]}
                        onValueChange={(v) => form.setData("status", v)}
                    />
                    {!activity && (
                        <Field
                            name="sort_order"
                            type="number"
                            value={Number(form.data.sort_order)}
                            onChange={(v) =>
                                form.setData("sort_order", Number(v))
                            }
                        />
                    )}
                    <Field
                        name="published_at"
                        label={a("Date de publication (heure du serveur)")}
                        type="datetime-local"
                        value={String(form.data.published_at)}
                        onChange={(v) => form.setData("published_at", v)}
                    />
                    <p className="admin-help">
                        {a(
                            "Une date future masque le contenu jusqu’à cette date. Les deux traductions doivent être renseignées.",
                        )}
                    </p>
                </EditorSection>
                {!activity && (
                    <details className="admin-panel admin-details">
                        <summary>SEO</summary>
                        {["seo_title", "seo_description"].map(field)}
                    </details>
                )}
                <EditorSection title={a("Médias")}>
                    <p>
                        {a(
                            "Enregistrez le contenu, puis ajoutez et ordonnez ses images avec les textes alternatifs FR/EN.",
                        )}
                    </p>
                    {item && (
                        <Link
                            className={buttonClass("outline")}
                            href={
                                "/admin/media?owner_type=" +
                                (activity
                                    ? "activity"
                                    : project
                                      ? "project"
                                      : "publication") +
                                "&owner_id=" +
                                item.id
                            }
                        >
                            {a("Gérer les médias")}
                        </Link>
                    )}
                </EditorSection>
                <div className="admin-form-actions">
                    <Button type="submit" disabled={form.processing}>
                        {a("Enregistrer ↗")}
                    </Button>
                    {item && (
                        <a
                            className={buttonClass("ghost")}
                            href={
                                "/admin/" +
                                contentType +
                                "/" +
                                item.id +
                                "/preview?locale=" +
                                locale
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            {a("Prévisualiser")}
                        </a>
                    )}
                </div>
            </form>
        </>
    );
}
