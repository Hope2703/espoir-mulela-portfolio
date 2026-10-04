import { Head } from "@inertiajs/react";
import Link from "@/components/ui/link";
import { useLocale } from "@/lib/navigation";
export default function ErrorPage({
    status,
    copy,
}: {
    status: number;
    copy: { labels: Record<number, string>; hint: string; home: string };
}) {
    const locale = useLocale();
    return (
        <main className="wrap section">
            <Head title={String(status)}>
                <meta name="robots" content="noindex" />
            </Head>
            <p className="eyebrow">{status} / ESPOIR MULELA</p>
            <h1>{copy.labels[status]}</h1>
            <p>{copy.hint}</p>
            <Link className="button" href={locale === "en" ? "/en" : "/"}>
                {copy.home} ↗
            </Link>
        </main>
    );
}
