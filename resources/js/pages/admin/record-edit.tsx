import { useLocalizedForm as useForm } from "@/hooks/use-localized-form";
import { useAdminTranslation } from "@/lib/admin-translations";
import { useState } from "react";
import { Button, Checkbox, Tabs, buttonClass } from "@/components/admin/ui";
import { Select } from "@/components/ui/select";
import Link from "@/components/ui/link";

import {
    Field,
    Errors,
    EditorSection,
    labels,
    type Data,
} from "@/components/admin/forms";
import type { Localized } from "@/types/content";
import { FormError } from "@/components/ui/form-feedback";
type Props = {
    module: string;
    fields: Record<string, string>;
    item: (Data & { id: number }) | null;
    categories: { id: number; title: Localized }[];
};
export default function Page({ module, fields, item, categories }: Props) {
    const a = useAdminTranslation();

    const [locale, setLocale] = useState<"fr" | "en">("fr");
    const initial: Data = {};
    for (const [k, t] of Object.entries(fields))
        initial[k] =
            item?.[k] ??
            (t === "translated"
                ? { fr: "", en: "" }
                : t === "boolean"
                  ? k === "visible"
                  : t === "number"
                    ? 0
                    : t === "category"
                      ? (categories[0]?.id ?? "")
                      : t === "contributions"
                        ? []
                        : t === "platform"
                          ? "WhatsApp"
                          : "");
    const form = useForm<Data>(initial);
    const errors = form.errors as Record<string, string>;
    return (
        <>
            <h1>
                {item ? a("Modifier") : a("Ajouter")} / {a(labels[module])}
            </h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (item) form.put("/admin/" + module + "/" + item.id);
                    else form.post("/admin/" + module);
                }}
            >
                <Errors errors={errors} />
                <Tabs value={locale} onChange={setLocale} />
                <EditorSection title="Informations">
                    {Object.entries(fields).map(([key, type]) =>
                        type === "boolean" ? (
                            <Checkbox
                                key={key}
                                checked={Boolean(form.data[key])}
                                onChange={(e) =>
                                    form.setData(key, e.target.checked)
                                }
                            >
                                {a(labels[key] ?? "Champ")}
                            </Checkbox>
                        ) : type === "category" || type === "platform" ? (
                            <div className="form-field" key={key}>
                                <Select
                                    id={key}
                                    label={a(labels[key])}
                                    value={String(form.data[key])}
                                    onValueChange={(v) =>
                                        form.setData(
                                            key,
                                            type === "category" ? Number(v) : v,
                                        )
                                    }
                                    options={
                                        type === "category"
                                            ? categories.map((c) => ({
                                                  value: String(c.id),
                                                  label: c.title[locale],
                                              }))
                                            : [
                                                  "WhatsApp",
                                                  "LinkedIn",
                                                  "Instagram",
                                                  "Email",
                                                  "GitHub",
                                              ].map((p) => ({
                                                  value: p,
                                                  label: p,
                                              }))
                                    }
                                    invalid={!!errors[key]}
                                    describedBy={
                                        errors[key] ? key + "-error" : undefined
                                    }
                                />
                                <FormError
                                    message={errors[key]}
                                    id={key + "-error"}
                                />
                            </div>
                        ) : type === "contributions" ? (
                            <Field
                                key={key}
                                name={key}
                                label={
                                    a("Contributions (") +
                                    locale +
                                    a(", une par ligne)")
                                }
                                area
                                value={(form.data[key] as Localized[])
                                    .map((c) => c[locale])
                                    .join("\n")}
                                onChange={(v) => {
                                    const previous = form.data[
                                        key
                                    ] as Localized[];
                                    const lines = v.split("\n");
                                    form.setData(
                                        key,
                                        Array.from(
                                            {
                                                length: Math.max(
                                                    lines.length,
                                                    previous.length,
                                                ),
                                            },
                                            (_, i) => ({
                                                ...previous[i],
                                                fr: previous[i]?.fr ?? "",
                                                en: previous[i]?.en ?? "",
                                                [locale]: lines[i] ?? "",
                                            }),
                                        ),
                                    );
                                }}
                            />
                        ) : type === "translated" ? (
                            <Field
                                key={key}
                                name={key + "." + locale}
                                label={labels[key] + " (" + locale + ")"}
                                area={key === "description"}
                                value={(form.data[key] as Localized)[locale]}
                                error={errors[key + "." + locale]}
                                onChange={(v) =>
                                    form.setData(key, {
                                        ...(form.data[key] as Localized),
                                        [locale]: v,
                                    })
                                }
                            />
                        ) : (
                            <Field
                                key={key}
                                name={key}
                                value={String(form.data[key] ?? "")}
                                type={
                                    type === "number"
                                        ? "number"
                                        : type === "date"
                                          ? "date"
                                          : "text"
                                }
                                error={errors[key]}
                                onChange={(v) =>
                                    form.setData(
                                        key,
                                        type === "number" ? Number(v) : v,
                                    )
                                }
                            />
                        ),
                    )}
                </EditorSection>
                <div className="admin-form-actions">
                    <Button type="submit" disabled={form.processing}>
                        {a("Enregistrer ↗")}
                    </Button>
                    <Link
                        href={"/admin/" + module}
                        className={buttonClass("outline")}
                    >
                        {a("Retour")}
                    </Link>
                </div>
            </form>
        </>
    );
}
