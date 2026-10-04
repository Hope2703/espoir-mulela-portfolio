import { useState } from "react";
import { useLocalizedForm as useForm } from "@/hooks/use-localized-form";
import { useAdminTranslation } from "@/lib/admin-translations";
import {
    Field,
    Errors,
    EditorSection,
    type Data,
} from "@/components/admin/forms";
import { Button, Tabs, buttonClass } from "@/components/admin/ui";
import Link from "@/components/ui/link";
import type { Localized } from "@/types/content";
export default function Page({ settings }: { settings: Data }) {
    const a = useAdminTranslation();
    const [locale, setLocale] = useState<"fr" | "en">("fr");
    const form = useForm<Data>(settings);
    return (
        <>
            <h1>{a("Paramètres du site")}</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.put("/admin/settings");
                }}
            >
                <Errors errors={form.errors as Record<string, string>} />
                <Tabs value={locale} onChange={setLocale} />
                <EditorSection title={a("Identité")}>
                    {[
                        "name",
                        "professional_title",
                        "introduction",
                        "email",
                        "whatsapp",
                        "location",
                        "seo_title",
                        "seo_description",
                    ].map((k) => {
                        const translated = typeof form.data[k] === "object";
                        return (
                            <Field
                                key={k}
                                name={k + (translated ? "." + locale : "")}
                                value={
                                    translated
                                        ? (form.data[k] as Localized)[locale]
                                        : String(form.data[k] ?? "")
                                }
                                area={[
                                    "introduction",
                                    "seo_description",
                                ].includes(k)}
                                type={k === "email" ? "email" : "text"}
                                onChange={(v) =>
                                    form.setData(
                                        k,
                                        translated
                                            ? {
                                                  ...(form.data[
                                                      k
                                                  ] as Localized),
                                                  [locale]: v,
                                              }
                                            : v,
                                    )
                                }
                            />
                        );
                    })}
                </EditorSection>
                <div className="admin-form-actions">
                    <Button type="submit" disabled={form.processing}>
                        {a("Enregistrer ↗")}
                    </Button>
                    <Link
                        href="/admin/media?owner_type=portrait"
                        className={buttonClass("ghost")}
                    >
                        {a("Photographie")}
                    </Link>
                </div>
            </form>
        </>
    );
}
