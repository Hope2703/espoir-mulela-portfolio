import { Link as InertiaLink } from "@inertiajs/react";
import type { ComponentProps } from "react";
export default function Link(props: ComponentProps<typeof InertiaLink>) {
    return <InertiaLink {...props} />;
}
