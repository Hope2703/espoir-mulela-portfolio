import type { Metadata } from "next";
import localFont from "next/font/local";
import { themeScript } from "@/lib/theme";
import { motionVariables } from "@/lib/motion";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { navLabels } from "@/lib/routes";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/layout/back-to-top";
import { MotionRoot } from "@/components/motion/reveal";
import { IdentityJsonLd, siteUrl } from "@/lib/seo";
import "@/styles/site.css";
const manrope = localFont({
  src: "../../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: { icon: "/icon.svg" },
};
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={manrope.variable}
      style={motionVariables}
    >
      <body>
        {/* Trusted server HTML, parsed before visible content. Keep it outside
            head so Next can manage styles/metadata across locale navigation.
            A JSX script would be inert on that client-side remount. */}
        <div
          hidden
          dangerouslySetInnerHTML={{
            __html: `<script id="theme-init">${themeScript}</script>`,
          }}
        />
        <NextIntlClientProvider
          locale={locale}
          messages={{ Nav: navLabels[locale] }}
        >
          <MotionRoot>
            <a className="skip-link" href="#contenu">
              {locale === "fr" ? "Aller au contenu" : "Skip to content"}
            </a>
            <Navigation />
            <main id="contenu">{children}</main>
            <Footer locale={locale} />
            <BackToTop locale={locale} />
          </MotionRoot>
        </NextIntlClientProvider>
        <IdentityJsonLd />
      </body>
    </html>
  );
}
