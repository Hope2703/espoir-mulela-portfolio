import { setRequestLocale } from "next-intl/server";
import { Home } from "@/features/profile/home";
import { metadata } from "@/lib/seo";
import type { Locale } from "@/types/content";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  return metadata((await params).locale, "home");
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Home locale={locale} />;
}
