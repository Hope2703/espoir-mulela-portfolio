import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { usePathname } from "@/lib/navigation";
import {
    createContext,
    useContext,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import {
    motionEase,
    motionTiming,
    motionViewport,
    motionVariables,
    revealVariants,
} from "@/lib/motion";
const CompactMotion = createContext(false);
const compactQuery = "(max-width: 700px)";
const subscribe = (notify: () => void) => {
    const query = window.matchMedia(compactQuery);
    query.addEventListener("change", notify);
    return () => query.removeEventListener("change", notify);
};
export function MotionRoot({ children }: { children: ReactNode }) {
    const compact = useSyncExternalStore(
        subscribe,
        () => window.matchMedia(compactQuery).matches,
        () => false,
    );
    return (
        <div style={motionVariables}>
            <MotionConfig
                reducedMotion="user"
                transition={{ duration: motionTiming.ui, ease: motionEase }}
            >
                <CompactMotion value={compact}>{children}</CompactMotion>
            </MotionConfig>
        </div>
    );
}
export function Reveal({
    children,
    kind = "rise",
    className = "",
    delay = 0,
    as = "div",
    sequence,
    layout = false,
}: {
    children: ReactNode;
    kind?: keyof typeof revealVariants;
    className?: string;
    delay?: number;
    as?: "div" | "article" | "section" | "footer" | "ol" | "li";
    sequence?:
        "project" | "timeline" | "process" | "contact" | "footer" | "about";
    layout?: boolean;
}) {
    const reduced = useReducedMotion();
    const compact = useContext(CompactMotion);
    const [entered, setEntered] = useState(false);
    const Component = motion[as];
    return (
        <Component
            className={className}
            initial={false}
            layout={layout && !reduced}
            data-reveal={kind}
            data-sequence={sequence}
            data-revealed={entered ? "true" : "false"}
            variants={revealVariants[sequence ? "composition" : kind]}
            whileInView={reduced ? undefined : "visible"}
            viewport={motionViewport}
            onViewportEnter={() => setEntered(true)}
            onFocusCapture={() => setEntered(true)}
            transition={{
                duration: reduced
                    ? 0
                    : (kind === "media"
                          ? motionTiming.media
                          : motionTiming.reveal) * (compact ? 0.8 : 1),
                delay: reduced ? 0 : delay,
                ease: motionEase,
            }}
        >
            {children}
        </Component>
    );
}
export function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    return (
        <div key={pathname} className="page-transition">
            {children}
        </div>
    );
}
