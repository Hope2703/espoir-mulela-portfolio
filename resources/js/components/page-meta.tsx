import { Head } from "@inertiajs/react";
import type { Meta } from "@/types/page";
export function PageMeta({ meta }: { meta: Meta }) {
    return (
        <Head>
            <title>{meta.title}</title>
            <meta
                head-key="description"
                name="description"
                content={meta.description}
            />
            <link head-key="canonical" rel="canonical" href={meta.canonical} />
            <meta head-key="robots" name="robots" content={meta.robots} />
            {Object.entries(meta.alternates).map(([lang, url]) => (
                <link
                    key={lang}
                    head-key={"alternate-" + lang}
                    rel="alternate"
                    hrefLang={lang}
                    href={url}
                />
            ))}
            <link
                head-key="alternate-default"
                rel="alternate"
                hrefLang="x-default"
                href={meta.alternates.fr}
            />
            <meta
                head-key="og-title"
                property="og:title"
                content={meta.title}
            />
            <meta
                head-key="og-description"
                property="og:description"
                content={meta.description}
            />
            <meta
                head-key="og-url"
                property="og:url"
                content={meta.canonical}
            />
            <meta
                head-key="og-image"
                property="og:image"
                content={meta.image}
            />
            <meta head-key="og-type" property="og:type" content="website" />
            <meta
                head-key="twitter-card"
                name="twitter:card"
                content="summary_large_image"
            />
            <meta
                head-key="twitter-title"
                name="twitter:title"
                content={meta.title}
            />
            <meta
                head-key="twitter-description"
                name="twitter:description"
                content={meta.description}
            />
            <meta
                head-key="twitter-image"
                name="twitter:image"
                content={meta.image}
            />
            <script head-key="json-ld" type="application/ld+json">
                {JSON.stringify(meta.jsonLd).replaceAll("<", "\u003c")}
            </script>
        </Head>
    );
}
