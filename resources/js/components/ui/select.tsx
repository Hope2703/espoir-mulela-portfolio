import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";

type Option = { value: string; label: string };
export function Select({
    id,
    label,
    value,
    onValueChange,
    options,
    placeholder,
    name,
    required,
    invalid,
    describedBy,
}: {
    id: string;
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    options: readonly Option[];
    placeholder?: string;
    name?: string;
    required?: boolean;
    invalid?: boolean;
    describedBy?: string;
}) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [above, setAbove] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const search = useRef({ text: "", time: 0 });
    const selected = options.findIndex((option) => option.value === value);
    function show(index = Math.max(selected, 0)) {
        const rect = trigger.current!.getBoundingClientRect();
        setAbove(
            window.innerHeight - rect.bottom < 320 &&
                rect.top > window.innerHeight - rect.bottom,
        );
        setActive(index);
        setOpen(true);
    }
    function choose(index: number) {
        onValueChange(options[index].value);
        setOpen(false);
        trigger.current?.focus();
    }
    useEffect(() => {
        if (!open) return;
        const dismiss = (event: PointerEvent) => {
            if (!root.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", dismiss);
        return () => document.removeEventListener("pointerdown", dismiss);
    }, [open]);
    useEffect(() => {
        if (open)
            document
                .getElementById(`${id}-option-${active}`)
                ?.scrollIntoView({ block: "nearest", behavior: "instant" });
    }, [active, open, id]);
    function keyboard(event: KeyboardEvent<HTMLButtonElement>) {
        const key = event.key;
        if (key === "Tab") {
            setOpen(false);
            return;
        }
        if (key === "Escape") {
            if (open) {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
            }
            return;
        }
        if (
            ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(key)
        ) {
            event.preventDefault();
            if (key === "Enter" || key === " ") {
                if (open) choose(active);
                else show();
            } else if (key === "Home") {
                if (open) setActive(0);
                else show(0);
            } else if (key === "End") {
                if (open) setActive(options.length - 1);
                else show(options.length - 1);
            } else if (!open) show();
            else
                setActive(
                    (index) =>
                        (index +
                            (key === "ArrowDown" ? 1 : -1) +
                            options.length) %
                        options.length,
                );
        } else if (
            key.length === 1 &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey
        ) {
            event.preventDefault();
            const normalize = (text: string) =>
                text
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase();
            const now = Date.now();
            search.current = {
                text:
                    now - search.current.time > 650
                        ? key
                        : search.current.text + key,
                time: now,
            };
            const query = normalize(search.current.text);
            const index = options.findIndex((option) =>
                normalize(option.label).startsWith(query),
            );
            if (index >= 0) {
                if (open) setActive(index);
                else show(index);
            }
        }
    }
    return (
        <div
            className="custom-select"
            ref={root}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                    setOpen(false);
            }}
        >
            <label id={`${id}-label`} htmlFor={id}>
                {label}
            </label>
            {name && <input type="hidden" name={name} value={value} />}
            <button
                ref={trigger}
                type="button"
                id={id}
                className="select-trigger"
                role="combobox"
                aria-expanded={open}
                aria-controls={`${id}-list`}
                aria-haspopup="listbox"
                aria-labelledby={`${id}-label ${id}-value`}
                aria-required={required}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                aria-activedescendant={
                    open ? `${id}-option-${active}` : undefined
                }
                onClick={() => (open ? setOpen(false) : show())}
                onKeyDown={keyboard}
            >
                <span id={`${id}-value`}>
                    {options[selected]?.label ?? placeholder}
                </span>
                <ChevronDown size={18} aria-hidden="true" />
            </button>
            {open && (
                <ul
                    id={`${id}-list`}
                    role="listbox"
                    aria-labelledby={`${id}-label`}
                    className={`select-menu ${above ? "opens-above" : ""}`}
                >
                    {options.map((option, index) => (
                        <li
                            key={option.value}
                            id={`${id}-option-${index}`}
                            role="option"
                            aria-selected={value === option.value}
                            className={active === index ? "is-active" : ""}
                            onPointerMove={() => setActive(index)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => choose(index)}
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();
                                    choose(index);
                                }
                            }}
                        >
                            <span>{option.label}</span>
                            {value === option.value && (
                                <Check size={16} aria-hidden="true" />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
