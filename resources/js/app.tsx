import "@fontsource-variable/manrope";
import { createInertiaApp } from "@inertiajs/react";
import PublicLayout from "@/layouts/public-layout";
import AdminLayout from "@/layouts/admin-layout";
import AuthLayout from "@/layouts/auth-layout";
void createInertiaApp({
    layout: (name) =>
        name.startsWith("public/")
            ? PublicLayout
            : name.startsWith("admin/")
              ? AdminLayout
              : name.startsWith("auth/")
                ? AuthLayout
                : null,
    progress: { color: "#17634f" },
});
