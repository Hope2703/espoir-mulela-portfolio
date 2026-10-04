# Architecture

## Monolithe Laravel / Inertia

Le navigateur appelle les routes web Laravel, avec sessions et CSRF. Les contrôleurs interrogent Eloquent/PostgreSQL et rendent les pages Inertia React. Il n’existe ni API REST intermédiaire ni duplication du catalogue de projets. Fortify fournit login, logout et réinitialisation de mot de passe ; l’inscription est désactivée. Le middleware admin exige un utilisateur authentifié avec is_admin.

Le point d’entrée resources/js/app.tsx est partagé par le navigateur et le SSR automatique Inertia 3. @inertiajs/vite résout les pages et construit bootstrap/ssr/app.js. Laravel rend resources/views/app.blade.php : une seule racine HTML, langue, CSRF, thème avant peinture, métadonnées de secours et tête SSR. Le thème n’utilise aucun script Next. Les layouts public, admin et auth réutilisent les mêmes tokens.

## Données

Tables applicatives : projects, project_media, activities, activity_media, publications, experiences, education, certifications, skill_categories, skills, social_links, site_settings, contact_messages, page_views. Infrastructure Laravel : users, password_reset_tokens, sessions, cache, cache_locks, jobs, job_batches, failed_jobs.

Les champs traduits sont des objets JSONB {fr,en}. Les slugs FR et EN peuvent différer et ont des index uniques par langue. Les contenus principaux sont soft-deleted. Les médias sont liés par clés étrangères, ordonnés, et les couvertures précèdent les captures. Les fichiers ont des noms générés et sont exposés via storage:link. Les migrations prennent aussi en charge SQLite pour les tests rapides.

## Routes

| Page | FR | EN |
| --- | --- | --- |
| Accueil | / | /en |
| Projets | /projets | /en/projects |
| Projet | /projets/{slug} | /en/projects/{slug} |
| Parcours | /a-propos | /en/about |
| Activités | /activites | /en/activities |
| Activité | /activites/{slug} | /en/activities/{slug} |
| Publications | /publications | /en/publications |
| Publication | /publications/{slug} | /en/publications/{slug} |
| Contact | /contact | /en/contact |

POST /contact et /en/contact traitent le formulaire. /sitemap.xml, /robots.txt et /og/{fr|en}.png servent le SEO. Les anciens slugs maliflow, maliya-flow et association-web-platform redirigent en 301 dans les deux langues. Les chemins CV et register sont absents.

Sous /admin : dashboard, projects, activities, publications, experiences, education, certifications, skill-categories, skills, social-links, messages, media et settings. Les contenus ont index/create/store/edit/update/destroy, PATCH archive et preview privé ; les registres de parcours ont les six opérations CRUD. Les messages utilisent index/show/PATCH/DELETE (suppression logique). Médias : GET/POST puis PUT/DELETE par type et identifiant ; paramètres : GET/PUT. Le registre complet s’inspecte avec php artisan route:list.

Auth utilise uniquement /login, /logout, /forgot-password et /reset-password/{token}. /admin/profile (GET/PUT) gère le compte connecté. POST /locale conserve fr/en en session pour auth/admin sans changer leur URL ni réinitialiser les formulaires. Le public détermine sa langue par le chemin SEO ; il ne remplace pas cette préférence privée. SetLocale constitue le middleware unique. lang/{fr,en}/{auth,passwords,validation,auth-ui,admin}.php fournit les erreurs et textes natifs. FormError, FormErrorSummary, Alert et ToastStack partagent les retours accessibles ; une erreur d’identifiants est globale au login, la validation reste sous les champs.

AdminAccounts centralise création, validation et hash. AdminUserSeeder est séparé du seed général, exige ADMIN_EMAIL/ADMIN_PASSWORD et préserve tout compte existant. admin:create appelle le même service. Les mots de passe ne sont jamais transmis dans les propriétés Inertia. Les changements sensibles du profil vérifient le mot de passe actuel et régénèrent la session.

La déconnexion Fortify invalide la session et régénère le CSRF ; sa réponse conserve uniquement la préférence de langue dans la nouvelle session. Les limites login/reset gardent leur seuil, avec un retour traduit adapté à Inertia plutôt qu’une page technique. Chaque réponse porte un identifiant de notification pour permettre deux toasts successifs de texte identique. useLocalizedForm efface les anciennes erreurs au changement de langue, en conservant données et onglet.

## Publication, SEO et confidentialité

HasTranslations::published exige status=published et published_at absent ou passé. PortfolioData construit les propriétés publiques sans données administratives. Un projet confidentiel n’expose aucun lien ni média non audité. La seule exception initiale est la capture FOMIN neutralisée, marquée public_safe par le seeder après vérification SHA-256 ; les uploads ne peuvent pas activer ce marqueur. Les prévisualisations exigent un admin et restent noindex.

PageMeta produit title, description, canonical, hreflang, OpenGraph, Twitter et JSON-LD Person/WebSite/BreadcrumbList/Article. Les slugs traduits pilotent le changement de langue. Le sitemap ne contient que les éléments publiés. SITE_INDEXABLE=false interdit l’indexation ; le sitemap reste consultable pour la vérification. SSR doit fonctionner en production pour exposer le contenu complet aux moteurs sans JavaScript.

## Contact et analytics

ContactRequest valide les champs et le honeypot ; le middleware throttle limite les essais. Le message est enregistré avant Laravel Mail. Une panne SMTP ne supprime pas le message ; le succès confirme sa réception par le site, pas sa délivrance email. ADMIN_EMAIL vide désactive la notification. Les emails utilisent une vue Blade échappée et Reply-To visiteur.

resources/views/mail/layout.blade.php fournit l’habillage commun en tables et styles inline : notification administrateur avec détail/date et CTA dashboard, accusé visiteur optionnel via CONTACT_SEND_CONFIRMATION, ResetPassword et VerifyEmail (préparé, vérification email non activée). La demande de reset retourne le même message pour adresse connue, inconnue ou déjà sollicitée ; limitation de débit conservée. Les essais SMTP ciblent exclusivement MailHog local.

Le footer public possède trois colonnes identité/navigation/contact ; les préférences privées se trouvent dans les contrôles compacts de login/admin. L’entrée hero progresse jusqu’à environ 1200 ms, avec masques de titres et photo ; Reveal déclenche les séquences au seuil de 20 % et conserve le stagger. Sans JavaScript ou avec reduced-motion, le contenu reste lisible. BackToTop utilise scrollTo absolu top/left zéro, fluide sauf reduced-motion, sans déplacer le focus sur le skip link. L’admin garde des transitions discrètes.

TrackPageView ignore administrateurs, robots, préchargements et requêtes non publiques. Un identifiant aléatoire en session est pseudonymisé par HMAC ; aucune IP brute ni empreinte d’appareil n’est conservée. Seuls identifiant pseudonymisé, chemin sans query string, relation éventuelle au contenu et date sont collectés. Les référents, langues et événements sociaux ont été retirés. Vue d’ensemble affiche les visiteurs uniques aujourd’hui/7/30 jours, les trois compteurs de contenus publiés, les messages non lus, cinq top pages/projets des 30 derniers jours et cinq derniers messages. Aucun écran Analytics séparé, nombre fabriqué ou graphique décoratif. Aucune purge automatique n’est activée.

## Administration simplifiée

resources/js/components/admin/ui.tsx centralise Button (primary/secondary/outline/ghost/danger/icon), Input, Textarea, Checkbox, Dialog, Dropdown, Pagination, Table et Badge/Tabs. ToastStack reste dans form-feedback.tsx ; le Select partagé de components/ui/select.tsx fonctionne au clavier et remplace tous les selects natifs. Les listes conservent Modifier visible et déplacent les actions secondaires dans « … », avec confirmation de suppression. Les tableaux deviennent des cartes à 640 px. La sidebar desktop est remplacée sous 900 px par le même Navigation dans un dialog modal natif : focus piégé/restauré, Escape, overlay et verrou de scroll nettoyé à la fermeture. Les catégories sont contextuelles aux compétences, les médias aux contenus/paramètres.

La migration 2026_10_04_210000_simplify_portfolio_content transforme les anciennes sections en Markdown dans description avant de retirer les champs obsolètes. Le texte indésirable de The Agency est exclu, ses images et son URL réelle sont conservées. La migration 2026_10_04_220000_reduce_visit_collection retire la collecte superflue. 2026_10_04_230000_simplify_social_links retire les libellés/icônes stockés ; ils sont dérivés des quatre champs utiles. Les anciennes migrations restent intactes. content_key conserve l’import idempotent ; confidential/public_safe et dimensions protègent la confidentialité et le rendu des images. Ces métadonnées internes n’ajoutent pas de champs éditoriaux inutiles.

L’accueil utilise les projets featured, une formation (priorité current puis ordre) et deux expériences (même priorité) comme résumé, puis les derniers contenus publiés et non futurs. Aucun réglage manuel de sections d’accueil : hero_title est une composition de code dérivée du titre professionnel, navigationName et localisation courte dérivent de l’identité, journeyNotes est une projection du parcours. À propos affiche uniquement les compétences visibles. Les descriptions de projets et d’activités, ainsi que le corps des publications, passent par le même Markdown assaini (HTML brut retiré, liens dangereux désactivés). Les activités exposent html.fr/html.en, rendus dans .prose selon la langue courante ; une description absente produit une chaîne HTML vide. La durée de lecture des publications est calculée.

Les couvertures de publications et galeries d’activités utilisent components/media/editorial-media.tsx et le composant Image existant. Le conteneur est centré, limité à 1050 px (largeur des en-têtes éditoriaux) et à la largeur disponible ; chaque image conserve sa taille naturelle ou se réduit proportionnellement, sans agrandissement. La galerie est verticale, centrée et espacée de façon responsive. Les images Markdown des articles suivent les mêmes règles de dimensionnement et de centrage, avec des styles limités aux pages éditoriales.

## Migration vérifiée

L’audit a exporté directement les données de l’ancien profil et du catalogue dans database/seeders/data/portfolio.json. Les tests comparent textes réunis dans les descriptions, noms et médias avec cette source. tests/fixtures/parity.json conserve les SHA-256 des treize médias originaux. Les captures comparatives et rapports restent dans artifacts/, ignoré par Git.

L’ancien code Next, ses routes/configurations et ses tests spécifiques ont été retirés après validation Laravel, PostgreSQL, SSR et navigateur. Le verrou npm est régénéré sans Next/next-intl/MDX. L’override @swc/core 1.15.11 est conservé conformément à la contrainte initiale ; Vite React n’utilise pas SWC. Les deux lockfiles sont la référence reproductible des versions.
