import { useDocumentLocale } from "@/hooks/use-document-locale";
import { useAdminTranslation } from "@/lib/admin-translations";
import { useState, type ReactNode } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import { Menu, ExternalLink, LogOut } from "lucide-react";
import Link from "@/components/ui/link";
import { SessionControls } from "@/components/layout/session-controls";
import { ToastStack } from "@/components/ui/form-feedback";
import { Button, Dialog, buttonClass } from "@/components/admin/ui";
import type { SharedProps } from "@/types/page";
import { motionVariables } from "@/lib/motion";
const groups = [
    ["", [["/admin", "Vue d’ensemble"]]],
    [
        "Contenu",
        [
            ["/admin/projects", "Projets"],
            ["/admin/activities", "Activités"],
            ["/admin/publications", "Publications"],
        ],
    ],
    [
        "Parcours",
        [
            ["/admin/experiences", "Expériences"],
            ["/admin/education", "Formation"],
            ["/admin/certifications", "Certifications"],
            ["/admin/skills", "Compétences"],
        ],
    ],
    ["Communication", [["/admin/messages", "Messages"]]],
    [
        "Site",
        [
            ["/admin/social-links", "Réseaux sociaux"],
            ["/admin/settings", "Paramètres"],
        ],
    ],
    ["Compte", [["/admin/profile", "Profil"]]],
] as const;
function Navigation({ close }: { close: () => void }) {
    const a = useAdminTranslation();
    const page = usePage<SharedProps>();
    const path = page.url.split("?")[0];
    return (
        <>
            <Link className="admin-brand" href="/admin" onClick={close}>
                ↳ ESPOIR MULELA<span className="accent">.</span>
            </Link>
            <nav aria-label={a("Administration")}>
                {groups.map(([heading, links]) => (
                    <div key={heading}>
                        {heading && <p className="eyebrow">{a(heading)}</p>}
                        {links.map(([href, label]) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={close}
                                aria-current={
                                    (
                                        href === "/admin"
                                            ? path === href
                                            : path.startsWith(href)
                                    )
                                        ? "page"
                                        : undefined
                                }
                            >
                                {a(label)}
                            </Link>
                        ))}
                    </div>
                ))}
                <Button variant="ghost" onClick={() => router.post("/logout")}>
                    <LogOut size={17} />
                    {a("Déconnexion")}
                </Button>
            </nav>
        </>
    );
}
export default function AdminLayout({ children }: { children: ReactNode }) {
    useDocumentLocale();
    const a = useAdminTranslation();
    const [open, setOpen] = useState(false);
    return (
        <div style={motionVariables}>
            <Head title={a("Administration — Espoir Mulela")}>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <a className="skip-link" href="#admin-main">
                {a("Aller au contenu")}
            </a>
            <div className="admin-shell">
                <aside className="admin-sidebar">
                    <Navigation close={() => setOpen(false)} />
                </aside>
                <div className="admin-content">
                    <header className="admin-topbar">
                        <Button
                            className="admin-menu"
                            variant="icon"
                            aria-label={a("Menu")}
                            aria-expanded={open}
                            aria-haspopup="dialog"
                            onClick={() => setOpen(true)}
                        >
                            <Menu size={22} />
                        </Button>
                        <span className="admin-private-label">
                            {a("ESPACE PRIVÉ /")}
                        </span>
                        <div className="actions">
                            <SessionControls />
                            <Link
                                href="/"
                                className={buttonClass("icon")}
                                aria-label={a("Voir le site ↗")}
                                title={a("Voir le site ↗")}
                            >
                                <ExternalLink size={19} />
                            </Link>
                        </div>
                    </header>
                    <main id="admin-main" tabIndex={-1}>
                        {children}
                    </main>
                </div>
            </div>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title={a("Menu")}
                drawer
            >
                <Navigation close={() => setOpen(false)} />
            </Dialog>
            <ToastStack />
        </div>
    );
}
