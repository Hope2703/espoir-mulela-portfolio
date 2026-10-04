import { useForm, usePage } from "@inertiajs/react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { Select } from "@/components/ui/select";
import type { Locale } from "@/types/content";
import type { SharedProps } from "@/types/page";
export function ContactForm({ locale }: { locale: Locale }) {
    const { flash, contactCopy: t } = usePage<SharedProps>().props;
    const form = useForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
    });
    return (
        <form
            className="contact-form"
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                form.post(locale === "fr" ? "/contact" : "/en/contact", {
                    preserveScroll: true,
                    onSuccess: () => form.reset(),
                    onError: (errors) => {
                        const first = Object.keys(errors)[0];
                        document.getElementById(first)?.focus();
                    },
                });
            }}
        >
            <div className="form-row">
                {(["name", "email"] as const).map((key) => (
                    <div key={key}>
                        <label htmlFor={key}>{t[key]}</label>
                        <input
                            id={key}
                            name={key}
                            type={key === "email" ? "email" : "text"}
                            autoComplete={key === "email" ? "email" : "name"}
                            required
                            maxLength={key === "email" ? 254 : 100}
                            value={form.data[key]}
                            onChange={(e) => form.setData(key, e.target.value)}
                            aria-invalid={!!form.errors[key]}
                            aria-describedby={
                                form.errors[key] ? key + "-error" : undefined
                            }
                        />
                        {form.errors[key] && (
                            <p id={key + "-error"} className="field-error">
                                {form.errors[key]}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            <Select
                label={t.subject}
                id="subject"
                name="subject"
                required
                value={form.data.subject}
                onValueChange={(v) => form.setData("subject", v)}
                placeholder={t.choose}
                invalid={!!form.errors.subject}
                describedBy={form.errors.subject ? "subject-error" : undefined}
                options={t.names.map((label) => ({ value: label, label }))}
            />
            {form.errors.subject && (
                <p id="subject-error" className="field-error">
                    {form.errors.subject}
                </p>
            )}
            <label htmlFor="message">{t.message}</label>
            <textarea
                id="message"
                name="message"
                rows={7}
                required
                minLength={20}
                maxLength={5000}
                value={form.data.message}
                onChange={(e) => form.setData("message", e.target.value)}
                aria-invalid={!!form.errors.message}
                aria-describedby={
                    form.errors.message ? "message-error" : "message-hint"
                }
            />
            <p id="message-hint" className="form-hint">
                20–5 000 {locale === "fr" ? "caractères" : "characters"}
            </p>
            {form.errors.message && (
                <p id="message-error" className="field-error">
                    {form.errors.message}
                </p>
            )}
            <div className="honeypot" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.data.website}
                    onChange={(e) => form.setData("website", e.target.value)}
                />
            </div>
            <p className="form-hint">{t.privacy}</p>
            <button className="button" disabled={form.processing} type="submit">
                {form.processing ? t.sending : t.send}
                {form.processing ? (
                    <LoaderCircle size={18} className="spinner" />
                ) : (
                    <ArrowUpRight size={18} />
                )}
            </button>
            <p role="status" className="form-status">
                {flash.success}
            </p>
        </form>
    );
}
