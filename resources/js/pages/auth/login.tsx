import { Button, Checkbox } from "@/components/admin/ui";
import { useLocalizedForm as useForm } from "@/hooks/use-localized-form";
import { Head } from "@inertiajs/react";
import Link from "@/components/ui/link";
import { Field } from "@/components/admin/forms";
import { Alert } from "@/components/ui/form-feedback";
import { useAuthCopy } from "@/lib/admin-translations";
import { usePage } from "@inertiajs/react";
import type { SharedProps } from "@/types/page";
export default function Login() {
    const form = useForm({ email: "", password: "", remember: false });
    const copy = useAuthCopy();
    const { authFailure } = usePage<SharedProps>().props;
    const globalError =
        form.errors.email === authFailure ||
        form.errors.email?.includes("tentatives") ||
        form.errors.email?.includes("attempts");
    return (
        <>
            <Head title={copy.login} />
            <p className="eyebrow">{copy.private}</p>
            <h1>{copy.login}</h1>
            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post("/login", {
                        onFinish: () => form.reset("password"),
                    });
                }}
            >
                {globalError && (
                    <Alert title={copy.impossible}>
                        <p>{form.errors.email}</p>
                    </Alert>
                )}
                <Field
                    name="email"
                    label={copy.email}
                    type="email"
                    autoComplete="email"
                    value={form.data.email}
                    error={globalError ? "" : form.errors.email}
                    onChange={(v) => form.setData("email", v)}
                    required
                />
                <Field
                    name="password"
                    label={copy.password}
                    type="password"
                    autoComplete="current-password"
                    value={form.data.password}
                    error={form.errors.password}
                    onChange={(v) => form.setData("password", v)}
                    required
                />
                <div className="auth-options">
                    <Checkbox
                        checked={form.data.remember}
                        onChange={(e) =>
                            form.setData("remember", e.target.checked)
                        }
                    >
                        {copy.remember}
                    </Checkbox>
                    <Link className="text-link" href="/forgot-password">
                        {copy.forgot}
                    </Link>
                </div>
                <Button
                    type="submit"
                    className="auth-submit"
                    disabled={form.processing}
                    aria-busy={form.processing}
                >
                    {form.processing ? copy.signing_in : copy.sign_in} ↗
                </Button>
            </form>
        </>
    );
}
