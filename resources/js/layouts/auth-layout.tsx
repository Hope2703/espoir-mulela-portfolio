import { useDocumentLocale } from "@/hooks/use-document-locale";
import type { ReactNode } from "react";
import { motionVariables } from "@/lib/motion";
import { Head } from "@inertiajs/react";
import Link from "@/components/ui/link";
import { SessionControls } from "@/components/layout/session-controls";
import { ToastStack } from "@/components/ui/form-feedback";
import { useAuthCopy } from "@/lib/admin-translations";
export default function AuthLayout({ children }: { children: ReactNode }) {
    useDocumentLocale();
    const copy = useAuthCopy();
    return (
        <main className="auth-shell" style={motionVariables}>
            <Head>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <header className="auth-topbar">
                <Link className="admin-brand" href="/">
                    ↳ ESPOIR MULELA<span className="accent">.</span>
                </Link>
                <SessionControls />
            </header>
            <div className="admin-panel">{children}</div>
            <Link className="text-link auth-back" href="/">
                ← {copy.back}
            </Link>
            <ToastStack />
        </main>
    );
}
