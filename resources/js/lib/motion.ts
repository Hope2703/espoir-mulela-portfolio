import type { Variants } from "motion/react";
import type { CSSProperties } from "react";
export const motionTiming = {
    micro: 0.18,
    ui: 0.28,
    reveal: 0.44,
    media: 0.56,
    stagger: 0.07,
};
export const motionEase = [0.22, 1, 0.36, 1] as const;
export const motionViewport = { once: true, amount: 0.2 } as const;
// Shared by server-rendered CSS sequences and Motion components.
export const motionVariables = {
    "--motion-ease": `cubic-bezier(${motionEase.join(",")})`,
    "--motion-fast": `${motionTiming.micro}s`,
    "--motion-normal": `${motionTiming.ui}s`,
    "--motion-ui": `${motionTiming.ui}s`,
    "--motion-reveal": `${motionTiming.reveal}s`,
    "--motion-media": `${motionTiming.media}s`,
    "--motion-stagger": `${motionTiming.stagger}s`,
    "--motion-compact-reveal": `${motionTiming.reveal * 0.8}s`,
    "--motion-compact-media": `${motionTiming.media * 0.8}s`,
    "--motion-compact-stagger": `${motionTiming.stagger * 0.7}s`,
} as CSSProperties;
// Keyframes start only on intersection; SSR and no-JS content remain readable.
export const revealVariants: Record<
    "rise" | "mask" | "media" | "composition",
    Variants
> = {
    rise: { visible: { opacity: [0, 1], y: [22, 0] } },
    mask: {
        visible: {
            clipPath: ["inset(0 0 85% 0)", "inset(0 0 0% 0)"],
            y: [8, 0],
        },
    },
    media: {
        visible: {
            clipPath: ["inset(0 0 12% 0)", "inset(0 0 0% 0)"],
            scale: [1.03, 1],
            y: [10, 0],
        },
    },
    composition: { visible: { opacity: [0, 1], y: [16, 0] } },
};
