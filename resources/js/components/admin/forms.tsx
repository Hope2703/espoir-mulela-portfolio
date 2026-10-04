import { usePage } from "@inertiajs/react";
import { FormError, FormErrorSummary } from "@/components/ui/form-feedback";
import { useAdminTranslation } from "@/lib/admin-translations";
import type { ReactNode } from "react";
import { Input, Textarea } from "./ui";
export { Pagination as PaginationLinks } from "./ui";
type Scalar = string | number | boolean | null | File;
export type Value =
    | Scalar
    | Scalar[]
    | Record<string, Scalar>
    | Record<string, Scalar | Record<string, Scalar>>[];
export type Data = Record<string, Value>;
export const labels: Record<string, string> = {
    projects: "Projets",
    activities: "Activités",
    publications: "Publications",
    experiences: "Expériences",
    education: "Formation",
    certifications: "Certifications",
    "skill-categories": "Catégories de compétences",
    skills: "Compétences",
    "social-links": "Réseaux sociaux",
    organization: "Organisation",
    role: "Rôle",
    description: "Description",
    title: "Titre",
    slug: "Slug",
    excerpt: "Résumé",
    summary: "Résumé",
    event_date: "Date de l’activité",
    visible: "Visible",
    context: "Contexte",
    body: "Contenu Markdown",
    seo_title: "Titre SEO",
    seo_description: "Description SEO",
    type: "Type",
    location: "Lieu",
    period: "Période affichée",
    started_at: "Date de début",
    ended_at: "Date de fin",
    current: "En cours",
    sort_order: "Ordre",
    name: "Nom",
    label: "Libellé",
    url: "URL",
    enabled: "Actif",
    platform: "Plateforme",
    skill_category_id: "Catégorie",
    professional_title: "Titre professionnel",
    introduction: "Présentation",
    email: "Email",
    whatsapp: "Numéro WhatsApp",
};
export function Field({
    name,
    label,
    value,
    error,
    onChange,
    area = false,
    type = "text",
    required = false,
    autoComplete,
}: {
    name: string;
    label?: string;
    value: string | number;
    error?: string;
    onChange: (v: string) => void;
    area?: boolean;
    type?: string;
    required?: boolean;
    autoComplete?: string;
}) {
    const a = useAdminTranslation();
    const serverErrors = usePage().props.errors as Record<string, string>;
    error = error ?? serverErrors[name];
    const props = {
        autoComplete,
        id: name,
        value,
        onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => onChange(e.target.value),
        "aria-invalid": !!error,
        "aria-describedby": error ? name + "-error" : undefined,
        required,
    };
    return (
        <div className="form-field">
            <label htmlFor={name}>
                {label
                    ? a(label.replace(/\s\((fr|en)\)$/i, "")) +
                      (label.match(/\s\((fr|en)\)$/i)?.[0]?.toUpperCase() ?? "")
                    : a(labels[name.split(".")[0]] ?? "Champ")}
            </label>
            {area ? (
                <Textarea {...props} rows={name.startsWith("body") ? 18 : 4} />
            ) : (
                <Input {...props} type={type} />
            )}{" "}
            <FormError message={error} id={name + "-error"} />
        </div>
    );
}
export function Errors({ errors }: { errors: Record<string, string> }) {
    return <FormErrorSummary errors={errors} />;
}
export function EditorSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="admin-panel">
            <h2>{title}</h2>
            {children}
        </section>
    );
}
