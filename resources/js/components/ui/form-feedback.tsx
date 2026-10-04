import { useEffect, useState, type ReactNode } from "react";
import { usePage } from "@inertiajs/react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useAuthCopy } from "@/lib/admin-translations";
import { Button } from "@/components/admin/ui";
import type { SharedProps } from "@/types/page";
function human(message: string, fallback: string) {
    return /^(auth|validation|passwords)\.[\w.]+$/.test(message)
        ? fallback
        : message;
}
export function Alert({
    title,
    children,
    tone = "error",
}: {
    title?: string;
    children: ReactNode;
    tone?: "error" | "success" | "info";
}) {
    return (
        <div
            className={"feedback feedback-" + tone}
            role={tone === "error" ? "alert" : "status"}
        >
            <span aria-hidden>
                {tone === "success" ? (
                    <CheckCircle2 size={18} />
                ) : (
                    <AlertCircle size={18} />
                )}
            </span>
            <div>
                {title && <strong>{title}</strong>}
                {children}
            </div>
        </div>
    );
}
export function FormError({ message, id }: { message?: string; id?: string }) {
    const copy = useAuthCopy();
    return message ? (
        <p className="field-error" id={id}>
            {human(message, copy.fallback)}
        </p>
    ) : null;
}
export function FormErrorSummary({
    errors,
    title,
}: {
    errors: Record<string, string>;
    title?: string;
}) {
    const copy = useAuthCopy();
    const messages = [...new Set(Object.values(errors).filter(Boolean))];
    return messages.length ? (
        <Alert title={title ?? copy.fix}>
            <ul>
                {messages.map((message) => (
                    <li key={message}>{human(message, copy.fallback)}</li>
                ))}
            </ul>
        </Alert>
    ) : null;
}
function Toast({
    message,
    tone,
}: {
    message: string;
    tone: "error" | "success" | "info";
}) {
    const copy = useAuthCopy();
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        if (tone === "error") return;
        const timer = window.setTimeout(() => setVisible(false), 6500);
        return () => window.clearTimeout(timer);
    }, [tone]);
    return visible ? (
        <div className="toast">
            <Alert tone={tone}>{human(message, copy.fallback)}</Alert>
            <Button
                variant="icon"
                onClick={() => setVisible(false)}
                aria-label={copy.close}
            >
                <X size={16} />
            </Button>
        </div>
    ) : null;
}
export function ToastStack() {
    const { flash, notificationId } = usePage<SharedProps>().props;
    return (
        <div className="toast-stack">
            {Object.entries(flash)
                .filter(([, message]) => message)
                .map(([tone, message]) => (
                    <Toast
                        key={notificationId + tone + message}
                        message={message!}
                        tone={tone as "error" | "success" | "info"}
                    />
                ))}
        </div>
    );
}
