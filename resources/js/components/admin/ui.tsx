import {
    useEffect,
    useEffectEvent,
    useId,
    useRef,
    useState,
    type ButtonHTMLAttributes,
    type InputHTMLAttributes,
    type TextareaHTMLAttributes,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, X } from "lucide-react";
import Link from "@/components/ui/link";
import { useAdminTranslation } from "@/lib/admin-translations";
import type { Pagination as PageData } from "@/types/page";

type Variant =
    "primary" | "secondary" | "outline" | "ghost" | "danger" | "icon";
export const buttonClass = (variant: Variant = "primary") =>
    `admin-button admin-button-${variant}`;
export function Button({
    variant = "primary",
    className = "",
    type = "button",
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
    return (
        <button
            type={type}
            className={`${buttonClass(variant)} ${className}`}
            {...props}
        />
    );
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input {...props} className={`admin-input ${props.className ?? ""}`} />
    );
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className={`admin-input ${props.className ?? ""}`}
        />
    );
}
export function Checkbox({
    children,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
    return (
        <label className="admin-checkbox">
            <input {...props} type="checkbox" />
            {children}
        </label>
    );
}
export function Badge({
    children,
    status,
}: {
    children: ReactNode;
    status?: string;
}) {
    return (
        <span className={`admin-badge badge-${status ?? "neutral"}`}>
            {children}
        </span>
    );
}
export function Tabs({
    value,
    onChange,
}: {
    value: "fr" | "en";
    onChange: (locale: "fr" | "en") => void;
}) {
    const a = useAdminTranslation();
    return (
        <div
            className="admin-tabs"
            role="group"
            aria-label={a("Langue du contenu")}
        >
            {(["fr", "en"] as const).map((locale) => (
                <Button
                    key={locale}
                    variant="ghost"
                    aria-pressed={value === locale}
                    onClick={() => onChange(locale)}
                >
                    {locale === "fr" ? "Français" : "English"}
                </Button>
            ))}
        </div>
    );
}
export function Dialog({
    open,
    onClose,
    title,
    children,
    drawer = false,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    drawer?: boolean;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const id = useId();
    const a = useAdminTranslation();
    const close = useEffectEvent(onClose);
    useEffect(() => {
        const dialog = ref.current!;
        if (!open) {
            dialog.close();
            return;
        }
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = "hidden";
        const backdrop = (event: MouseEvent) => {
            if (event.target === dialog) close();
        };
        dialog.addEventListener("click", backdrop);
        return () => {
            dialog.removeEventListener("click", backdrop);
            dialog.close();
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);
    return (
        <dialog
            ref={ref}
            aria-labelledby={id}
            className={`admin-dialog ${drawer ? "admin-drawer" : ""}`}
            onCancel={(e) => {
                e.preventDefault();
                onClose();
            }}
        >
            <section>
                <header>
                    <h2 id={id}>{title}</h2>
                    <Button
                        variant="icon"
                        aria-label={a("Fermer")}
                        onClick={onClose}
                    >
                        <X size={20} />
                    </Button>
                </header>
                {children}
            </section>
        </dialog>
    );
}
export function ConfirmAction({
    open,
    onClose,
    onConfirm,
    title,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
}) {
    const a = useAdminTranslation();
    return (
        <Dialog open={open} onClose={onClose} title={title}>
            <p>{a("Cette entrée sera retirée du site.")}</p>
            <div className="admin-dialog-actions">
                <Button variant="outline" onClick={onClose}>
                    {a("Annuler")}
                </Button>
                <Button
                    variant="danger"
                    onClick={() => {
                        onClose();
                        onConfirm();
                    }}
                >
                    {a("Supprimer")}
                </Button>
            </div>
        </Dialog>
    );
}
export type MenuAction = {
    label: string;
    onSelect: () => void;
    danger?: boolean;
};
export function Dropdown({ actions }: { actions: MenuAction[] }) {
    const a = useAdminTranslation();
    const id = useId();
    const trigger = useRef<HTMLButtonElement>(null);
    const menu = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{
        top: number;
        right: number;
    } | null>(null);
    useEffect(() => {
        if (!position) return;
        menu.current
            ?.querySelector<HTMLButtonElement>("button")
            ?.focus({ preventScroll: true });
        const dismiss = (e: Event) => {
            if (
                !menu.current?.contains(e.target as Node) &&
                !trigger.current?.contains(e.target as Node)
            )
                setPosition(null);
        };
        const reposition = () => setPosition(null);
        document.addEventListener("pointerdown", dismiss);
        window.addEventListener("resize", reposition);
        window.addEventListener("scroll", reposition, true);
        return () => {
            document.removeEventListener("pointerdown", dismiss);
            window.removeEventListener("resize", reposition);
            window.removeEventListener("scroll", reposition, true);
        };
    }, [position]);
    return (
        <>
            <button
                ref={trigger}
                type="button"
                className={buttonClass("icon")}
                aria-label={a("Autres actions")}
                aria-haspopup="menu"
                aria-expanded={!!position}
                aria-controls={position ? id : undefined}
                onClick={() => {
                    const rect = trigger.current!.getBoundingClientRect();
                    setPosition(
                        position
                            ? null
                            : {
                                  top: Math.max(
                                      8,
                                      Math.min(
                                          rect.bottom + 6,
                                          window.innerHeight -
                                              actions.length * 44 -
                                              16,
                                      ),
                                  ),
                                  right: Math.max(
                                      8,
                                      window.innerWidth - rect.right,
                                  ),
                              },
                    );
                }}
            >
                <MoreHorizontal size={20} />
            </button>
            {position &&
                createPortal(
                    <div
                        id={id}
                        ref={menu}
                        role="menu"
                        tabIndex={-1}
                        className="admin-dropdown"
                        style={position}
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget))
                                setPosition(null);
                        }}
                        onKeyDown={(e) => {
                            const buttons = [
                                ...e.currentTarget.querySelectorAll<HTMLButtonElement>(
                                    "button",
                                ),
                            ];
                            const current = buttons.indexOf(
                                document.activeElement as HTMLButtonElement,
                            );
                            if (
                                [
                                    "ArrowDown",
                                    "ArrowUp",
                                    "Home",
                                    "End",
                                ].includes(e.key)
                            ) {
                                e.preventDefault();
                                buttons[
                                    e.key === "Home"
                                        ? 0
                                        : e.key === "End"
                                          ? buttons.length - 1
                                          : (current +
                                                (e.key === "ArrowDown"
                                                    ? 1
                                                    : -1) +
                                                buttons.length) %
                                            buttons.length
                                ]?.focus({ preventScroll: true });
                            }
                            if (e.key === "Escape") {
                                e.preventDefault();
                                setPosition(null);
                                trigger.current?.focus({ preventScroll: true });
                            }
                        }}
                    >
                        {actions.map((action) => (
                            <button
                                type="button"
                                role="menuitem"
                                key={action.label}
                                className={action.danger ? "is-danger" : ""}
                                onClick={() => {
                                    setPosition(null);
                                    trigger.current?.focus({
                                        preventScroll: true,
                                    });
                                    action.onSelect();
                                }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
        </>
    );
}
export function Pagination<T>({ items }: { items: PageData<T> }) {
    const a = useAdminTranslation();
    return (
        <nav className="admin-pagination" aria-label="Pagination">
            {items.links.map((link, index) => {
                const label =
                    index === 0
                        ? `← ${a("Précédent")}`
                        : index === items.links.length - 1
                          ? `${a("Suivant")} →`
                          : link.label;
                return link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll
                        aria-current={link.active ? "page" : undefined}
                        className={buttonClass("ghost")}
                    >
                        {label}
                    </Link>
                ) : (
                    <span
                        key={index}
                        aria-disabled="true"
                        className={buttonClass("ghost")}
                    >
                        {label}
                    </span>
                );
            })}
        </nav>
    );
}
export function Table({
    headers,
    children,
}: {
    headers: string[];
    children: ReactNode;
}) {
    return (
        <div className="admin-table-wrap">
            <table className="admin-table">
                <thead>
                    <tr>
                        {headers.map((h) => (
                            <th key={h}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}
