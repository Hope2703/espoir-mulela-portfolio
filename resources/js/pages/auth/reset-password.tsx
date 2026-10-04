import { Button } from "@/components/admin/ui";
import { useLocalizedForm as useForm } from "@/hooks/use-localized-form";
import { Head } from "@inertiajs/react";
import { Field, Errors } from "@/components/admin/forms";
import { useAuthCopy } from "@/lib/admin-translations";
export default function Page({
    email,
    token,
}: {
    email: string;
    token: string;
}) {
    const form = useForm({
        email,
        token,
        password: "",
        password_confirmation: "",
    });
    const copy = useAuthCopy();
    return (
        <>
            <Head title={copy.new_password} />
            <h1>{copy.new_password}</h1>
            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post("/reset-password", {
                        onFinish: () =>
                            form.reset("password", "password_confirmation"),
                    });
                }}
            >
                <Errors errors={form.errors} />
                <Field
                    name="email"
                    label={copy.email}
                    type="email"
                    autoComplete="email"
                    value={form.data.email}
                    error={form.errors.email}
                    onChange={(v) => form.setData("email", v)}
                    required
                />
                <Field
                    name="password"
                    label={copy.new_password + " · " + copy.password_hint}
                    type="password"
                    autoComplete="new-password"
                    value={form.data.password}
                    error={form.errors.password}
                    onChange={(v) => form.setData("password", v)}
                    required
                />
                <Field
                    name="password_confirmation"
                    label={copy.confirmation}
                    type="password"
                    autoComplete="new-password"
                    value={form.data.password_confirmation}
                    error={form.errors.password_confirmation}
                    onChange={(v) => form.setData("password_confirmation", v)}
                    required
                />
                <Button
                    type="submit"
                    className="auth-submit"
                    disabled={form.processing}
                >
                    {form.processing ? copy.saving : copy.save}
                </Button>
            </form>
        </>
    );
}
