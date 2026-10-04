# Instructions du projet

## Contexte

Portfolio personnel FR/EN d’Espoir Mulela Mastolo, Kinshasa, RDC. Laravel 13, PHP 8.4, React 19, Inertia 3, TypeScript strict, PostgreSQL, Tailwind 4, Motion et Vite. Aucun Next.js, CMS externe, API REST parallèle ni fonctionnalité CV.

## Architecture

- Laravel possède les routes, validation, authentification, autorisations, traductions, données, email et SEO.
- Inertia transmet des propriétés publiques explicitement sélectionnées ; React compose l’interface.
- app/Http contient middleware, contrôleurs et Form Requests ; app/Models les modèles ; app/Services les données publiques et métadonnées.
- resources/js contient pages, fonctionnalités, composants, hooks et types ; resources/css/app.css les tokens et compositions.
- routes/public.php et routes/admin.php sont les registres de routes. Utiliser les liens internes resources/js/components/ui/link.tsx et les helpers resources/js/lib/routes.ts.
- Les textes UI sont dans lang/fr et lang/en ; les contenus éditoriaux traduits sont stockés en JSONB. Ne pas recréer de catalogues frontend concurrents.
- Les médias éditoriaux utilisent le disque public Laravel. Les fichiers source publics restent dans public/images ; aucun rapport de test dans public.

## Contenu et sécurité

- Aucun fait, expérience, client, résultat, métrique ou technologie inventé. Noms exacts : MaliyaFlow et Libiki Lya Kongo.
- FOMIN : contribution chez Taprinella Logistic. Ne jamais diffuser accès, IP, URL interne, identifiant, montant ou détail confidentiel, même dans les propriétés Inertia.
- Brouillons, archives et publications futures restent absents du public et du sitemap. Les deux langues sont obligatoires pour publier.
- Toutes les routes admin exigent auth et users.is_admin. Aucun compte automatique dans le seed général. admin:create ou AdminUserSeeder explicitement configuré par ADMIN_EMAIL/ADMIN_PASSWORD utilise le même service ; ne jamais versionner un mot de passe ni écraser celui d’un compte existant.
- Auth/admin : langue en session via POST /locale, URL unique, formulaires conservés. Public : langue par URL FR/EN pour le SEO. Les erreurs utilisent les catalogues Laravel natifs.
- CSRF, validation, limitation de débit, honeypot et contrôle des uploads doivent être conservés. Ne pas envoyer d’email réel pendant les essais sans autorisation.
- Analytics : aucun stockage d’IP brute ou fingerprint. Conserver uniquement l’identifiant de session pseudonymisé et les agrégats nécessaires.

## Design

Conserver la composition validée, vert, Manrope, portrait réel, thèmes clair/sombre avec système comme fallback initial, responsive et familles de mouvement. prefers-reduced-motion est la seule restriction d’animation. Aucun loader bloquant, bouton désactivant les animations ou légende sous les captures MaliyaFlow. Réutiliser les tokens et composants existants. Pour l’admin : ui.tsx partagé, Select unique, langues FR/EN et thème par icône. Aucun retour des technologies, sections dynamiques ou page Analytics. Catégories et médias restent contextuels. Le jeu Manual QA Data du README ne doit jamais entrer dans les seeders.

## Avant de terminer

Exécuter npm run typecheck, npm run lint, npm test, composer lint et npm run build. Pour routes/SEO : serveur SSR de production puis npm run check:site. Pour UI/thèmes : node scripts/check-browser.mjs ; voir docs/deployment.md. Signaler exactement les vérifications non exécutées.

Ne pas supprimer de fichier sans vérifier ses références. Conserver les deux lockfiles et l’override SWC tant qu’il n’a pas été réévalué. Documenter le code réel dans README, AGENTS et les trois guides docs/architecture.md, docs/content.md, docs/deployment.md uniquement.
