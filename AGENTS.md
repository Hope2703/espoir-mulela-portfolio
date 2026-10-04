<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Context

Site personnel FR/EN d’Espoir Mulela Mastolo. Design existant validé : vert, Manrope, compositions éditoriales, portrait réel. Huit projets réels ; activités et publications vides. Pas de CMS ni base de données.

# Owner

Espoir Mulela Mastolo, Kinshasa, RDC.

# Purpose

Identité professionnelle, portfolio, parcours et contact. Le site est un profil vivant : aucune fonctionnalité CV.

# Technology Stack

Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, Motion, next-intl. MDX local de confiance. Resend par fetch serveur. Node 22.18+ ou 24. Conserver le lockfile et l’override SWC expliqué dans `docs/deployment.md`.

# Important Directories

`src/app` route les pages ; `src/features` compose les fonctionnalités ; `src/components` fournit UI/layout/media/motion ; `src/content` contient les registres éditoriaux ; `src/data` le profil ; `src/lib` routes/SEO/thème ; `src/styles` les tokens ; `src/types` les contrats. Médias publics dans `public/images`. Tests et scripts hors `src`.

# Architecture Rules

- Server Components par défaut ; client uniquement pour interactions, préférences et Motion.
- Contenu séparé de l’UI. Un seul catalogue de projets, aucune liste FR/EN parallèle.
- Utiliser `href()` et `switchLocalePath()` de `src/lib/routes.ts`.
- Importer les liens internes depuis `src/components/ui/link.tsx` ; le prefetch est désactivé pour éviter les 404 RSC constatées avec les routes localisées (voir architecture).
- Une seule racine HTML dans `src/app/[locale]/layout.tsx`. Ne pas réintroduire `next/script` pour l’initialisation du thème.
- Utiliser les composants et tokens existants. Pas de nouveau design system ni abstraction sans duplication réelle.
- Les brouillons ne sont visibles dans aucun environnement. Publier les deux traductions d’un article avec un slug commun.

# Content Rules

- Aucun fait, expérience, client, résultat, métrique ou technologie inventé.
- Noms exacts : MaliyaFlow ; Libiki Lya Kongo.
- FOMIN : contribution chez Taprinella Logistic. Ne jamais exposer accès, IP, URLs internes, identifiants, montants ou détails confidentiels, même dans les données envoyées au client.
- Français par défaut, traduction anglaise soignée. Aucun contenu de démonstration ni CV.

# Design Rules

Respecter la composition validée, les thèmes clair/sombre/système, le responsive et les quatre familles de mouvement. `prefers-reduced-motion` est la seule restriction d’animation. Pas de loader bloquant, bouton de désactivation des animations ni légende sous les captures MaliyaFlow.

# Where To Change X

| Besoin                                         | Point d’entrée                                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Navigation / URL                               | `src/lib/routes.ts`, `src/components/layout/navigation.tsx`, `src/proxy.ts`                         |
| Footer                                         | `src/components/layout/footer.tsx`, `preferences.tsx` dans le même dossier                          |
| Hero / accueil                                 | `src/features/profile/home.tsx` ; textes du profil et résumé dans `src/data/profile.ts`             |
| Projets                                        | `src/content/projects/index.ts` ; types dans `src/types/content.ts`                                 |
| Profil / expériences / formation / compétences | `src/data/profile.ts`                                                                               |
| Activités                                      | `src/content/activities/index.ts`, `src/features/activities/pages.tsx`                              |
| Publications                                   | `src/content/publications/index.ts`, fichiers MDX voisins ; rendu dans `src/features/publications/` |
| Traductions                                    | Champs `fr/en` des données, textes de fonctionnalité ; config dans `src/i18n/`                      |
| Thème                                          | `src/lib/theme.ts`, `src/hooks/use-theme.ts`, tokens de `src/styles/site.css`                       |
| Animations                                     | `src/components/motion/reveal.tsx`, séquence hero dans `src/styles/site.css`                        |
| Contact                                        | `src/features/contact/`, `src/app/api/contact/route.ts`, `.env.example`                             |
| SEO                                            | `src/lib/seo.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/api/og/route.tsx`            |
| Images                                         | `public/images/profile/`, `public/images/projects/{slug}/`, données `media` du projet               |

# Before Finishing Any Task

Lancer `npm run typecheck`, `npm run lint`, `npm test`. Lancer `npm run build` pour toute modification applicative/configuration. Pour routes/SEO : serveur production et `npm run check:site`. Pour UI/thème : `node scripts/check-browser.mjs`, voir `docs/deployment.md`. Signaler précisément les vérifications non exécutées. Ne pas envoyer d’email réel pendant les tests sans autorisation.

# Do Not

Ne pas redessiner le site sans demande, inventer du contenu, ajouter des secrets, supprimer un fichier sans vérifier ses références, stocker les rapports de test dans `public`, ajouter des packages redondants ou multiplier les documents. Conserver seulement README, AGENTS et les trois guides `docs/architecture.md`, `docs/content.md`, `docs/deployment.md`. Documenter le code réel après modification.
