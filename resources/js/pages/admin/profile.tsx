import { Button } from "@/components/admin/ui";
import { useLocalizedForm as useForm } from "@/hooks/use-localized-form";

import { Field, Errors, EditorSection } from "@/components/admin/forms";
import { useAdminTranslation } from "@/lib/admin-translations";
export default function Page({
    user,
}: {
    user: { name: string; email: string };
}) {
    const a = useAdminTranslation();
    const form = useForm({
        ...user,
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    return (
        <>
            <h1>{a("Mon compte")}</h1>
            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    form.put("/admin/profile", {
                        onSuccess: () =>
                            form.reset(
                                "current_password",
                                "password",
                                "password_confirmation",
                            ),
                    });
                }}
            >
                <Errors errors={form.errors} />
                <EditorSection title={a("Identité du compte")}>
                    <Field
                        name="name"
                        value={form.data.name}
                        error={form.errors.name}
                        onChange={(v) => form.setData("name", v)}
                        required
                    />
                    <Field
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.data.email}
                        error={form.errors.email}
                        onChange={(v) => form.setData("email", v)}
                        required
                    />
                </EditorSection>
                <EditorSection title={a("Sécurité")}>
                    <p>
                        {a(
                            "Le mot de passe actuel est nécessaire pour modifier votre email ou votre mot de passe.",
                        )}
                    </p>
                    <Field
                        name="current_password"
                        label={a("Mot de passe actuel")}
                        type="password"
                        autoComplete="current-password"
                        value={form.data.current_password}
                        error={form.errors.current_password}
                        onChange={(v) => form.setData("current_password", v)}
                    />
                    <Field
                        name="password"
                        label={a(
                            "Nouveau mot de passe (12 caractères minimum)",
                        )}
                        type="password"
                        autoComplete="new-password"
                        value={form.data.password}
                        error={form.errors.password}
                        onChange={(v) => form.setData("password", v)}
                    />
                    <Field
                        name="password_confirmation"
                        label={a("Confirmation du mot de passe")}
                        type="password"
                        autoComplete="new-password"
                        value={form.data.password_confirmation}
                        error={form.errors.password_confirmation}
                        onChange={(v) =>
                            form.setData("password_confirmation", v)
                        }
                    />
                </EditorSection>
                <Button type="submit" disabled={form.processing}>
                    {a(
                        form.processing
                            ? a("Enregistrement…")
                            : a("Enregistrer"),
                    )}
                </Button>
            </form>
        </>
    );
}
