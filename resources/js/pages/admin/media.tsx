import { useLocalizedForm as useForm } from "@/hooks/use-localized-form";
import { useAdminTranslation } from "@/lib/admin-translations";
import { useState, useEffect } from "react";
import {
    Button,
    Input,
    ConfirmAction,
    buttonClass,
} from "@/components/admin/ui";
import { Select } from "@/components/ui/select";
import Link from "@/components/ui/link";
import { router } from "@inertiajs/react";
import { Field, Errors, EditorSection } from "@/components/admin/forms";
import type { Localized } from "@/types/content";
type Media = {
    id: number;
    path: string;
    alt: Localized;
    type: string;
    sort_order: number;
};
type Owner = {
    id: number;
    title: Localized;
    confidential?: boolean;
    media?: Media[];
    cover?: string;
};
function MediaCard({ media, type }: { media: Media; type: string }) {
    const a = useAdminTranslation();

    const [removing, setRemoving] = useState(false);
    const form = useForm({
        alt: media.alt,
        type: media.type,
        sort_order: media.sort_order,
    });
    return (
        <article className="admin-panel">
            <img src={"/storage/" + media.path} alt={media.alt.fr} />
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.put("/admin/media/" + type + "/" + media.id, {
                        preserveScroll: true,
                    });
                }}
            >
                <Errors errors={form.errors} />
                {(["fr", "en"] as const).map((l) => (
                    <Field
                        key={l}
                        name={"alt-" + type + "-" + media.id + "-" + l}
                        label={a("Texte alternatif ") + l}
                        value={form.data.alt[l]}
                        onChange={(v) =>
                            form.setData("alt", { ...form.data.alt, [l]: v })
                        }
                    />
                ))}
                <Field
                    name={"order-" + type + "-" + media.id}
                    label={a("Ordre")}
                    type="number"
                    value={form.data.sort_order}
                    onChange={(v) => form.setData("sort_order", Number(v))}
                />
                <Select
                    id={"type-" + type + "-" + media.id}
                    label={a("Type")}
                    value={form.data.type}
                    onValueChange={(v) => form.setData("type", v)}
                    options={["cover", "desktop", "mobile", "other"].map(
                        (t) => ({ value: t, label: a(t) }),
                    )}
                />
                <div className="actions">
                    <Button
                        type="submit"
                        variant="secondary"
                        disabled={form.processing}
                    >
                        {a("Enregistrer")}
                    </Button>
                    <Button variant="danger" onClick={() => setRemoving(true)}>
                        {a("Retirer")}
                    </Button>
                </div>
            </form>
            <ConfirmAction
                open={removing}
                title={a("Retirer ce média ?")}
                onClose={() => setRemoving(false)}
                onConfirm={() =>
                    router.delete("/admin/media/" + type + "/" + media.id, {
                        preserveScroll: true,
                    })
                }
            />
        </article>
    );
}
export default function Page({
    projects,
    activities,
    publications,
    selection,
}: {
    projects: Owner[];
    activities: Owner[];
    publications: Owner[];
    selection: { type: string; id: number };
}) {
    const a = useAdminTranslation();

    const form = useForm({
        owner_type: selection.type,
        owner_id:
            selection.id ||
            (selection.type === "activity"
                ? activities[0]?.id
                : selection.type === "publication"
                  ? publications[0]?.id
                  : projects[0]?.id) ||
            0,
        file: null as File | null,
        alt: { fr: "", en: "" },
        type: "cover",
        sort_order: 0,
    });
    const [preview, setPreview] = useState("");
    useEffect(
        () => () => {
            if (preview) URL.revokeObjectURL(preview);
        },
        [preview],
    );
    const owners =
        form.data.owner_type === "project"
            ? projects
            : form.data.owner_type === "activity"
              ? activities
              : publications;
    return (
        <>
            <div className="admin-heading">
                <h1>{a("Médias")}</h1>
                <Link
                    className={buttonClass("outline")}
                    href={
                        selection.type === "portrait"
                            ? "/admin/settings"
                            : "/admin/" +
                              (selection.type === "activity"
                                  ? "activities"
                                  : selection.type + "s") +
                              "/" +
                              selection.id +
                              "/edit"
                    }
                >
                    {a("Retour")}
                </Link>
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post("/admin/media", {
                        forceFormData: true,
                        onSuccess: () => {
                            form.reset("file");
                            setPreview("");
                        },
                        preserveScroll: true,
                    });
                }}
            >
                <Errors errors={form.errors} />
                <EditorSection title={a("Ajouter une image")}>
                    <Select
                        id="owner_type"
                        label={a("Destination")}
                        value={form.data.owner_type}
                        onValueChange={(type) =>
                            form.setData((d) => ({
                                ...d,
                                owner_type: type,
                                owner_id:
                                    (type === "project"
                                        ? projects
                                        : type === "activity"
                                          ? activities
                                          : publications)[0]?.id ?? 0,
                            }))
                        }
                        options={[
                            { value: "project", label: a("Projet") },
                            { value: "activity", label: a("Activité") },
                            {
                                value: "publication",
                                label: a("Couverture de publication"),
                            },
                            {
                                value: "portrait",
                                label: a("Photographie du profil"),
                            },
                        ]}
                    />
                    {form.data.owner_type !== "portrait" && (
                        <>
                            <Select
                                id="owner_id"
                                label={a("Contenu")}
                                value={String(form.data.owner_id)}
                                onValueChange={(v) =>
                                    form.setData("owner_id", Number(v))
                                }
                                options={owners
                                    .filter(
                                        (o) =>
                                            !o.confidential ||
                                            o.id === form.data.owner_id,
                                    )
                                    .map((o) => ({
                                        value: String(o.id),
                                        label:
                                            o.title.fr +
                                            (o.confidential
                                                ? a(" — confidentiel")
                                                : ""),
                                    }))}
                            />
                        </>
                    )}
                    <label htmlFor="file">
                        {a("Image JPG, PNG ou WebP, 8 Mo maximum")}
                    </label>
                    <Input
                        id="file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        required
                        onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            form.setData("file", file);
                            setPreview(file ? URL.createObjectURL(file) : "");
                        }}
                    />
                    {preview && (
                        <img
                            className="upload-preview"
                            src={preview}
                            alt={a("Aperçu du fichier sélectionné")}
                        />
                    )}
                    {(["fr", "en"] as const).map((l) => (
                        <Field
                            key={l}
                            name={"upload-alt-" + l}
                            label={a("Texte alternatif ") + l}
                            value={form.data.alt[l]}
                            onChange={(v) =>
                                form.setData("alt", {
                                    ...form.data.alt,
                                    [l]: v,
                                })
                            }
                            required
                        />
                    ))}
                    <Select
                        id="upload-type"
                        label={a("Type")}
                        value={form.data.type}
                        onValueChange={(v) => form.setData("type", v)}
                        options={["cover", "desktop", "mobile", "other"].map(
                            (t) => ({ value: t, label: a(t) }),
                        )}
                    />
                    <Field
                        name="sort_order"
                        type="number"
                        value={form.data.sort_order}
                        onChange={(v) => form.setData("sort_order", Number(v))}
                    />
                    <Button type="submit" disabled={form.processing}>
                        {a("Ajouter ↗")}
                    </Button>
                    {form.progress && (
                        <progress max={100} value={form.progress.percentage} />
                    )}
                </EditorSection>
            </form>
            {[
                ["project", projects],
                ["activity", activities],
            ].map(([type, items]) => (
                <section key={type as string}>
                    {(items as Owner[])
                        .filter(
                            (o) =>
                                type === form.data.owner_type &&
                                o.id === form.data.owner_id,
                        )
                        .map((o) => (
                            <div key={o.id}>
                                <h2>{o.title.fr}</h2>
                                <div className="media-grid">
                                    {o.media?.map((m) => (
                                        <MediaCard
                                            key={m.id}
                                            media={m}
                                            type={type as string}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                </section>
            ))}
        </>
    );
}
