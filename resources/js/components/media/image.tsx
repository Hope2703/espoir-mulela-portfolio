import type { ImgHTMLAttributes } from "react";
type Props = ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    preload?: boolean;
};
export default function Image({ fill, preload, style, alt, ...props }: Props) {
    return (
        <img
            {...props}
            alt={alt ?? ""}
            loading={preload ? "eager" : "lazy"}
            fetchPriority={preload ? "high" : undefined}
            style={{
                ...(fill
                    ? ({
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                      } as const)
                    : {}),
                ...style,
            }}
        />
    );
}
