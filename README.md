# Espoir Mulela — Personal Website

## Présentation

Site personnel d’Espoir Mulela Mastolo : identité professionnelle, portfolio, parcours et contact. Huit projets documentés, français par défaut et anglais secondaire. Les espaces activités et publications sont prêts à recevoir du contenu réel et restent actuellement vides. Le site constitue le profil vivant ; aucune fonctionnalité CV n’est conservée.

## Stack

Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4, Motion, next-intl, Lucide et Manrope locale. MDX local pour les futures publications. Resend via son API HTTP pour le contact. Node.js 22.18+ ou 24 LTS.

## Installation

```sh
npm install
```

Conserver `package-lock.json` ; `npm ci` convient aux installations reproductibles. Copier `.env.example` vers `.env.local` si une configuration locale est nécessaire. Aucun secret réel n’est fourni.

## Développement

```sh
npm run dev
```

Ouvrir http://127.0.0.1:3000.

## Build

```sh
npm run build
npm run start
```

Le serveur écoute sur http://127.0.0.1:3000. Un autre port est possible avec `npm run start -- --port 3002`. Vercel détecte automatiquement Next.js ; aucun export statique ne doit être configuré.

## Variables d’environnement

| Variable                      | Rôle                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`        | Origine canonique finale, metadataBase et origine autorisée du formulaire.   |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro international public ; vide, utilise le numéro existant.              |
| `SITE_INDEXABLE`              | Active robots/sitemap si `true` et si l’origine est configurée.              |
| `CONTACT_EMAIL`               | Destinataire du formulaire.                                                  |
| `CONTACT_FROM`                | Expéditeur vérifié chez Resend.                                              |
| `RESEND_API_KEY`              | Clé privée du service email.                                                 |
| `CONTACT_SECRET`              | Secret stable de signature des jetons du formulaire.                         |
| `CONTACT_TRUST_PROXY`         | Autorise l’usage de l’IP transmise par un proxy fiable ; `false` par défaut. |

Sans configuration email, aucun succès n’est simulé : le texte reste dans le formulaire. Les contacts directs restent disponibles. Le guide [déploiement](docs/deployment.md) précise les valeurs attendues et les contrôles.

## Structure rapide

```text
src/
  app/          Routes Next.js, layouts, API, sitemap et robots
  components/   UI, layout, médias et animations réutilisables
  features/     Profile, projects, activities, publications, contact
  content/      Catalogues éditoriaux typés et futurs fichiers MDX
  data/         Profil et parcours
  hooks/        Synchronisation du thème
  i18n/         Configuration FR/EN
  lib/          Routes, SEO, thème et politique de publication
  styles/       Tokens et styles responsive
  types/        Contrats du contenu
public/images/  Portrait et captures de projets
scripts/        Vérifications HTTP, contact et navigateur
tests/          Validation, contenu et contrastes
docs/           Architecture, contenu, déploiement
```

## Commandes

| Commande                                      | Usage                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`                                 | Serveur de développement.                                                     |
| `npm run build`                               | Build de production.                                                          |
| `npm run start`                               | Serveur de production après build.                                            |
| `npm run lint`                                | ESLint, TypeScript, règles React Hooks et accessibilité ; zéro avertissement. |
| `npm run typecheck`                           | TypeScript strict, variables et imports inutilisés inclus.                    |
| `npm test`                                    | Tests Node de validation, contenu et contrastes.                              |
| `npm run check:site -- http://127.0.0.1:3002` | Pages, liens, SEO, 404 et erreurs API ; serveur requis.                       |

Contrôles complémentaires : `node scripts/check-contact.mjs` (serveur local sans service email, avec secret de test), `node scripts/check-browser.mjs` (Playwright). Installation du navigateur et précautions dans [deployment.md](docs/deployment.md). Les captures et rapports locaux vont dans `artifacts/`, ignoré par Git.

## Internationalisation

FR sans préfixe : `/`, `/projets`, `/a-propos`, `/activites`, `/publications`, `/contact`. EN : `/en`, `/en/projects`, `/en/about`, `/en/activities`, `/en/publications`, `/en/contact`. Les slugs de projet sont partagés entre langues. La navigation conserve la page lors du changement de langue.

## Thème

Clair, sombre ou système, avec préférence persistée quand le stockage est disponible. Le footer expose les trois choix. Le thème est appliqué avant le rendu du corps. Les animations respectent uniquement `prefers-reduced-motion`.

## Ajouter du contenu

Consulter [docs/content.md](docs/content.md) : projets, médias, expériences, traductions, activités et publications. Ne jamais inventer de chiffres ou d’expérience, ni exposer d’informations confidentielles FOMIN.

## Architecture

[docs/architecture.md](docs/architecture.md) décrit les chemins et le fonctionnement réels. [AGENTS.md](AGENTS.md) donne les règles et points d’entrée pour une IA qui reprend le projet.

## Déploiement

[docs/deployment.md](docs/deployment.md) couvre Vercel, domaine, variables, Resend, DNS, rollback et checklist. La publication nécessite votre domaine et vos accès ; aucun déploiement distant n’a été effectué. La limitation des tentatives du formulaire est en mémoire par instance, pas distribuée.
