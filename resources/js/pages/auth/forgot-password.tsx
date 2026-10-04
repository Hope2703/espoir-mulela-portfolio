import { Button } from "@/components/admin/ui";
import { useLocalizedForm as useForm } from "@/hooks/use-localized-form";
import { Head, usePage } from "@inertiajs/react";
import { Field } from "@/components/admin/forms";
import { Alert } from "@/components/ui/form-feedback";
import { useAuthCopy } from "@/lib/admin-translations";
export default function Page() {
    const form = useForm({ email: "" });
    const { status } = usePage().props;
    const copy = useAuthCopy();
    return (
        <>
            <Head title={copy.reset} />
            <h1>{copy.forgot}</h1>
            <p>{copy.reset_intro}</p>
            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post("/forgot-password");
                }}
            >
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
                <Button
                    type="submit"
                    className="auth-submit"
                    disabled={form.processing}
                >
                    {form.processing ? copy.sending : copy.send_link}
                </Button>
                {typeof status === "string" && (
                    <Alert tone="success">
                        <p>{status}</p>
                    </Alert>
                )}
            </form>
        </>
    );
}
