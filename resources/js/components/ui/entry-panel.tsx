import { Reveal } from "@/components/motion/reveal";
import type { ReactNode } from "react";
export function EntryPanel({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <Reveal
            as="article"
            sequence="project"
            className={`entry-panel ${className}`}
            layout
        >
            {children}
        </Reveal>
    );
}
