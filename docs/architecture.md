# Architecture

## Overview

Site personnel bilingue, sans base de données ni CMS. Les données TypeScript alimentent des composants de fonctionnalités, appelés par les pages App Router. Le seul service externe applicatif est Resend, facultatif tant que le formulaire n’est pas activé. Les liens WhatsApp, LinkedIn et email restent utilisables.

## App Router Structure

- `src/app/[locale]/layout.tsx` : unique racine HTML, police locale, thème, navigation et footer.
- `src/app/[locale]/page.tsx` : accueil.
- `src/app/[locale]/[...path]/page.tsx` : résolution des pages et détails depuis `src/lib/routes.ts` et les registres de contenu. Un slug inconnu renvoie 404.
- `src/app/[locale]/template.tsx` : transition lors des navigations.
- `src/app/api/contact/route.ts` : préparation du formulaire et envoi serveur.
- `src/app/api/og/route.tsx`, `sitemap.ts`, `robots.ts` : SEO.

Le préfixe interne `/fr` est réécrit par `src/proxy.ts`. Les URL publiques françaises n’ont pas de préfixe ; l’anglais utilise `/en`. Les anciens slugs MaliyaFlow et Libiki redirigent en 308 dans `next.config.ts`. Les anciennes routes CV et les anciens articles fictifs retournent 404.

Les liens internes passent par `src/components/ui/link.tsx`. Le préchargement spéculatif est désactivé : la combinaison Next.js/next-intl installée renvoie des 404 RSC au scroll sur certaines routes réécrites, même lorsque leur navigation fonctionne. Le clic conserve la navigation client Next.js. Réactiver le prefetch seulement après validation navigateur d’une version corrigeant ce comportement.

## Rendering Strategy

Les 28 pages actuelles sont pré-générées par `generateStaticParams`. Les registres sont lus au build : modifier le contenu nécessite un nouveau déploiement. Les API contact et OG sont dynamiques. Un export HTML statique ne convient pas à ces API ni à l’optimisation des images.

## Server vs Client Components

Server Components par défaut : accueil, parcours, case studies, listes éditoriales, données et SEO. Les Client Components couvrent la navigation mobile, les préférences, Motion, le filtrage des projets, la galerie MaliyaFlow et le formulaire. Les textes de projet ne sont pas définis dans ces composants.

## Internationalisation

`src/i18n/routing.ts` définit `fr` et `en`, sans détection automatique. `request.ts` configure next-intl. `src/lib/routes.ts` est la source des segments et libellés de navigation ; utiliser `href()` et `switchLocalePath()`. Les données bilingues utilisent `Localized = Record<Locale, string>`. Les publications ont une entrée par langue, avec le même slug. Ajouter les deux traductions ensemble garantit les liens alternatifs SEO.

## Theme Architecture

`src/lib/theme.ts` contient la clé `espoir-theme`, le script initial et les opérations de préférence. Un script natif synchrone dans le `<head>` applique `data-theme` avant le corps du document, indépendamment de l’hydratation React. Il ne passe pas par la file d’exécution de `next/script`.

Seul `<html>` utilise `suppressHydrationWarning`, car cet attribut peut différer du rendu serveur. Aucun `<html>` ni `<body>` supplémentaire n’est rendu par les fonctionnalités. `src/hooks/use-theme.ts` synchronise le système, les onglets et les deux contrôles avec `useSyncExternalStore`. L’instantané serveur reste `system`. Si le stockage est interdit, le choix reste utilisable en mémoire pour l’onglet courant.

Le bouton du header alterne clair/sombre ; le sélecteur du footer permet aussi de revenir au système. Les couleurs et `color-scheme` sont pilotés par les tokens de `src/styles/site.css`.

## Motion Architecture

Quatre familles : apparition avec déplacement court, dévoilement par masque, fondu de navigation/galerie, interactions de survol/menu. Le hero utilise des animations CSS décalées de 0 à 800 ms ; il reste présent dans le HTML dès le départ. `Reveal` dans `src/components/motion/reveal.tsx` déclenche les apparitions au scroll avec Motion. `PageTransition` anime les changements de page.

`prefers-reduced-motion` est l’unique préférence de mouvement : CSS et Motion la respectent. Aucun interrupteur interne ni animation décorative permanente. Le loader du formulaire ne tourne que pendant l’envoi.

## Data Layer

- `src/data/profile.ts` : identité, contacts publics, expériences, formation, compétences, certifications, résumé du parcours.
- `src/content/projects/index.ts` : catalogue unique `Project[]`, recherche et liens publics.
- `src/content/activities/index.ts` : registre vide `Activity[]`.
- `src/content/publications/index.ts` : registre vide `Publication[]`.
- `src/lib/content-policy.ts` : seuls les contenus `published` sont visibles, y compris en développement.
- `src/types/content.ts` : contrats partagés ; `ContactData` et sa validation restent dans la fonctionnalité contact.

## Media Handling

Images locales dans `public/images/profile/` et `public/images/projects/`. `next/image` gère les formats servis et tailles responsives. Seul le portrait critique est préchargé. `Portrait` prévoit des initiales si aucune photo n’est définie. `ProjectMedia` rend les captures, la galerie mobile ou une identité textuelle en absence d’image.

FOMIN n’embarque que la capture déjà expurgée ; ne jamais ajouter un original contenant des informations privées. L’absence de média donne un fallback utilisable.

## SEO

`src/lib/seo.tsx` centralise title, description, canonical, hreflang, OpenGraph, Twitter, Person, WebSite, BreadcrumbList et Article. Article n’est produit que pour une publication réelle et publiée. Les registres vides ne génèrent aucune route de détail éditoriale. `SITE_INDEXABLE=true` et une URL explicite sont nécessaires à l’indexation ; sinon robots bloque les robots et le sitemap reste vide.

## Contact Flow

Le formulaire charge un jeton et la disponibilité via GET. La validation est partagée avec POST. Sans configuration, le texte reste dans les champs, sans succès fictif. POST vérifie l’origine, JSON, la limite de 24 Ko, les champs, le honeypot et le jeton HMAC (âge compris entre 1,5 seconde et une heure).

La limite de cinq tentatives par quinze minutes est **en mémoire par instance**, par adresse email et par IP si le proxy est explicitement fiable ; sinon le quota est commun à l’instance. Elle ne constitue pas une limite distribuée sur Vercel. Utiliser les protections de la plateforme si l’exposition le demande. Aucune donnée personnelle ni secret n’est journalisé.

L’API appelle Resend via `fetch`, avec un délai de dix secondes et une clé d’idempotence dérivée du jeton. `CONTACT_SECRET` doit être stable entre instances en production. Les statuts distinguent validation, origine, quota, indisponibilité et échec du fournisseur. Le succès signifie que Resend a accepté l’envoi, pas qu’un destinataire l’a lu.

## Error Handling

`error.tsx` propose une nouvelle tentative ; `not-found.tsx` une sortie vers les pages utiles. Les API retournent des codes sans détails internes. Les détails éditoriaux absents ne sont jamais remplacés par un contenu inventé. Les fichiers MDX sont locaux, contrôlés et inclus dans le traçage du build Vercel ; ne jamais compiler du MDX fourni par un visiteur.

## Adding New Features

Ajouter le contenu d’abord, puis une fonctionnalité dans `src/features/` si nécessaire. Réutiliser `components/ui`, les helpers de routes et les tokens. Ne créer une nouvelle route qu’après l’avoir enregistrée avec ses deux langues. Voir [content.md](content.md) et [deployment.md](deployment.md) pour les procédures et contrôles.
