import Link from "@/components/ui/link";
import { getLocale } from "next-intl/server";
export default async function NotFound() {
  const locale = await getLocale(),
    fr = locale === "fr";
  return (
    <section className="wrap error-page">
      <p className="eyebrow">404</p>
      <h1>{fr ? "Ce chemin s’arrête ici." : "This path ends here."}</h1>
      <p>
        {fr
          ? "Cette page n’existe pas, ou n’est pas encore publiée."
          : "This page does not exist, or has not been published yet."}
      </p>
      <Link className="button" href={fr ? "/" : "/en"}>
        {fr ? "Revenir à l’accueil" : "Back to home"} ↳
      </Link>
    </section>
  );
}
