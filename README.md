# Portfolio d’Espoir Mulela Mastolo

Application Laravel 13 / React 19 / Inertia 3, bilingue FR/EN, PostgreSQL, SSR Node et Vite. Le portfolio et son administration constituent un seul projet. La composition verte, Manrope, le portrait, les thèmes et les animations du site initial sont conservés. Aucune fonctionnalité CV.

## Démarrage

PHP 8.4 avec pdo_pgsql, mbstring, openssl, fileinfo, DOM/XML et SQLite pour les tests par défaut ; Composer 2 ; Node 22.18+ ou 24 ; PostgreSQL. Depuis la racine :

```sh
composer install
cp .env.example .env
php artisan key:generate
# Configurer DB_* pour une base PostgreSQL existante dédiée.
php artisan migrate --seed
php artisan storage:link
php artisan admin:create
npm install
npm run build
composer run dev
```

Sous PowerShell, remplacer cp par Copy-Item. Ouvrir http://127.0.0.1:8000 ; connexion /login et dashboard /admin. Vite assure également le SSR en développement. Pour un bootstrap local explicite, renseigner ADMIN_EMAIL et ADMIN_PASSWORD dans .env puis lancer `php artisan db:seed --class=AdminUserSeeder`. Aucun mot de passe n’est versionné ; un compte existant garde son mot de passe. Le seed général ne crée pas d’admin. /admin/profile permet de gérer son compte.

Pour MailHog, lancer son serveur SMTP local sur 1025 et son interface sur 8025, puis renseigner ADMIN_EMAIL ; CONTACT_SEND_CONFIRMATION=true active l’accusé de réception visiteur. Contact et réinitialisation utilisent le même habillage email. Les messages restent enregistrés en base même sans notification email. Ne jamais tester un email réel sans autorisation.

## Vérification

```sh
npm run typecheck
npm run lint
npm test
composer lint
npm run build
```

Les contrôles HTTP et navigateur exigent un serveur Laravel et un SSR actifs. Les procédures exactes, PostgreSQL de test, MailHog, contrôles responsive et VPS sont dans [docs/deployment.md](docs/deployment.md). Voir aussi [architecture](docs/architecture.md) et [gestion du contenu](docs/content.md).

Neuf projets réels sont disponibles, dont THE AGENCY DRC avec deux captures réelles et son site en ligne ; activités et publications sont initialement vides. Le seed est idempotent et préserve les modifications administratives. La capture FOMIN déjà neutralisée est conservée ; aucun lien interne ni nouveau média confidentiel n’est diffusé. Instagram reste désactivé tant que son adresse réelle n’est pas fournie.

## Dashboard au quotidien

Vue d’ensemble regroupe visiteurs aujourd’hui/7 jours/30 jours, contenus publiés, messages non lus, top pages/projets et derniers messages. Le menu contient Contenu, Parcours, Communication, Site et Compte. Les catégories se gèrent depuis Compétences ; les images depuis chaque contenu ou Paramètres. Aucun menu Analytics ou Médias global.

Les listes montrent Modifier et un menu « … » pour Prévisualiser, Archiver ou Supprimer selon le module. La suppression des contenus et messages est logique ; le parcours et les réseaux sont supprimés directement après confirmation. Les tableaux deviennent des cartes sur mobile. Le drawer partage la navigation desktop et gère focus, Escape, overlay et scroll. FR/EN conserve les saisies ; l’icône thème bascule immédiatement clair/sombre, avec système comme préférence initiale.

## Manual QA Data

Ces données sont fictives et réservées à une instance locale de test. **À saisir vous-même** : elles ne sont incluses dans aucun seeder et ne doivent pas être publiées en production. Les champs ci-dessous correspondent aux formulaires finaux. Les dates utilisent le fuseau serveur configuré ; `2026-10-03T10:00` signifie 3 octobre 2026 à 10 h. Pour une publication immédiatement visible, cette date doit être passée sur l’instance testée. Garder MailHog comme unique destination SMTP.

### Ordre de vérification

1. Ouvrir `/login`, basculer FR/EN et clair/sombre, vérifier une connexion invalide puis se connecter. Vérifier que la langue privée persiste sans changer l’URL.
2. Créer les contenus ci-dessous **en Brouillon**, remplir les deux onglets puis Enregistrer. Vérifier les validations d’un champ obligatoire vide, d’un slug existant et d’une traduction manquante. Ne pas modifier les contenus réels.
3. Modifier chaque entrée, vérifier les valeurs conservées et la prévisualisation privée FR/EN. Basculer la langue de l’interface pendant une saisie pour vérifier sa conservation.
4. Ajouter les images indiquées depuis « Gérer les médias » ; vérifier alt FR/EN, type et ordre. Enregistrer les descriptions et les paramètres SEO.
5. Passer Projet, Activité et Publication en Publié puis Enregistrer. Vérifier les index/détails FR/EN, le sitemap, le projet à la une, la dernière activité/publication sur l’accueil, ainsi que le parcours sur À propos.
6. Modifier la date de publication du projet à `2099-01-01T10:00`, enregistrer et vérifier son absence publique ; restaurer `2026-10-03T10:00`. Passer ensuite le projet en Archivé via « … » et vérifier son retrait public. Le remettre en Publié par Modifier pour continuer.
7. Envoyer le message via Contact ; vérifier notification et accusé dans MailHog, compteur non lu, Lire, Marquer non lu, Archiver puis Restaurer.
8. Tester 375/390/430 px et desktop dans les deux thèmes : drawer, Escape, focus clavier, fermeture après navigation, cartes, Select au clavier, menus et annulation d’une suppression. Tester Recherche/Statut/Filtrer puis Réinitialiser. Une page unique rend Précédent/Suivant indisponibles ; les liens numérotés apparaissent automatiquement au-delà de 15 contenus ou 20 entrées de parcours/messages.
9. Tester Paramètres en modifiant temporairement la bio puis restaurer immédiatement sa valeur initiale. Ne pas changer le vrai mot de passe pour ce test ; les tests automatiques vérifient ce flux sur des comptes isolés.
10. Effectuer le nettoyage ci-dessous et vérifier que les neuf projets réels sont les seuls projets publiés, et que les activités/publications retrouvent leur état initial vide.

### Projet

Route : `/admin/projects/create`. « Contexte et rôle » et « SEO » ouvrent les champs secondaires.

| Champ | FR | EN |
| --- | --- | --- |
| Titre | Projet Test QA | QA Test Project |
| Slug | projet-test-qa | qa-test-project |
| Résumé | Projet fictif réservé à la vérification locale du portfolio et de son administration. | Fictional project reserved for local portfolio and administration checks. |
| Description | Voir le Markdown FR ci-dessous | Voir le Markdown EN ci-dessous |
| Contexte | Vérifier la correspondance entre les champs du dashboard et la page publique, sans décrire un client réel. | Check how dashboard fields map to the public page without describing a real client. |
| Rôle | Saisie et vérification de données de test locales. | Entering and checking local test data. |
| Titre SEO | Projet Test QA — vérification locale | QA Test Project — local verification |
| Description SEO | Contenu fictif utilisé uniquement pour tester les pages FR/EN du portfolio en local. | Fictional content used only to test the portfolio’s French and English pages locally. |

Description FR :

```md
## Besoin

Vérifier une présentation **claire et bilingue** dans le portfolio local.

## Solution

Renseigner le formulaire puis comparer les deux versions publiques.

## Résultat attendu

Le titre, le résumé, les images et le lien correspondent aux valeurs saisies. Aucune réalisation professionnelle n’est revendiquée.
```

Description EN :

```md
## Need

Verify a **clear, bilingual presentation** in the local portfolio.

## Solution

Fill in the form and compare both public versions.

## Expected outcome

The title, summary, images and link match the entered values. No professional achievement is claimed.
```

| Champ commun | Valeur exacte |
| --- | --- |
| Site officiel public | `https://example.com` |
| À la une | Oui |
| Confidentiel | Non |
| Statut initial → final | Brouillon → Publié |
| Ordre | `90` |
| Date de publication | `2026-10-03T10:00` |

Après le premier enregistrement, ouvrir Gérer les médias. Destination Projet, Contenu Projet Test QA. Image de test existante : `public/images/projects/culinapos/public-preview.jpg` (réutilisation locale de fichier, aucune attribution au projet fictif). Type `cover`, Ordre `0`, alt FR `Image réutilisée pour le test local QA`, alt EN `Image reused for the local QA test`. Pour vérifier l’ordre, ajouter une seconde copie de ce même fichier, Type `desktop`, Ordre `1`, alt FR `Seconde image du test local QA`, alt EN `Second image for the local QA test`.

### Activité

Route : `/admin/activities/create`.

| Champ | FR | EN |
| --- | --- | --- |
| Titre | Atelier Test QA | QA Test Workshop |
| Slug | atelier-test-qa | qa-test-workshop |
| Résumé | Activité fictive pour vérifier l’accueil, les listes et les traductions sur l’instance locale. | Fictional activity for checking the home page, lists and translations on the local instance. |
| Description | Vérification locale des champs, de la date et du lien de l’activité. Cette activité ne décrit aucun événement réel. | Local verification of the activity fields, date and link. This activity describes no real event. |
| Rôle (Contexte et rôle) | Participant de test | Test participant |
| Lieu (Contexte et rôle) | Instance locale QA | Local QA instance |

| Champ commun | Valeur exacte |
| --- | --- |
| Type | `workshop` |
| Date de l’activité | `2026-10-03` |
| Site officiel public | `https://example.com/qa-workshop` |
| Statut initial → final | Brouillon → Publié |
| Date de publication | `2026-10-03T11:00` |
| Image | Aucune ; optionnelle |

### Publication

Route : `/admin/publications/create`.

| Champ | FR | EN |
| --- | --- | --- |
| Titre | Publication Test QA | QA Test Publication |
| Slug | publication-test-qa | qa-test-publication |
| Résumé | Article fictif destiné à vérifier le rendu Markdown, le SEO et les traductions en local. | Fictional article for checking Markdown rendering, SEO and translations locally. |
| Titre SEO | Publication Test QA — Markdown | QA Test Publication — Markdown |
| Description SEO | Test local des titres, listes, liens et blocs de code d’une publication bilingue. | Local test of headings, lists, links and code blocks in a bilingual publication. |

Contenu Markdown FR :

````md
# Vérification du rendu

Cette publication fictive teste un **texte important**, un paragraphe normal et le code inline `status = published`.

## Liste de contrôle

- Le titre est visible.
- Les paragraphes restent lisibles sur mobile.
- La traduction anglaise possède son propre slug.

Consulter le [lien de test](https://example.com).

## Exemple de code

```js
const preview = { locale: "fr", status: "draft" };
```

### Conclusion du test

Ce texte ne décrit aucune publication professionnelle réelle.
````

Contenu Markdown EN :

````md
# Rendering check

This fictional publication tests **important text**, an ordinary paragraph and inline code `status = published`.

## Checklist

- The heading is visible.
- Paragraphs remain readable on mobile.
- The French translation has its own slug.

Open the [test link](https://example.com).

## Code example

```js
const preview = { locale: "en", status: "draft" };
```

### Test conclusion

This text describes no real professional publication.
````

| Champ commun | Valeur exacte |
| --- | --- |
| Statut initial → final | Brouillon → Publié |
| Ordre | `90` |
| Date de publication | `2026-10-03T12:00` |
| Couverture | Optionnelle : même fichier QA que le projet, via Gérer les médias |

Pour la couverture : Destination Couverture de publication, Contenu Publication Test QA, fichier `public/images/projects/culinapos/public-preview.jpg`, Type `cover`, Ordre `0`, alt FR `Couverture du test local de publication`, alt EN `Cover for the local publication test`. Le temps de lecture est calculé automatiquement ; aucun champ tags ou technologies.

### Expérience

Route : `/admin/experiences/create`.

| Champ | FR | EN |
| --- | --- | --- |
| Rôle | Expérience Test QA | QA Test Experience |
| Description | Expérience fictive pour tester l’affichage du parcours sur l’instance locale. | Fictional experience for testing the journey on the local instance. |
| Contributions, une par ligne | Saisir le formulaire bilingue. (ligne 1)<br>Vérifier l’ordre des entrées. (ligne 2) | Fill in the bilingual form. (line 1)<br>Check the entry order. (line 2) |

Organisation `Organisation Test QA` ; Période affichée `2026 (QA)` ; Date de début `2026-09-01` ; Date de fin `2026-09-30` ; En cours Non ; Ordre `90`. Les deux lignes de contributions doivent se correspondre dans les deux langues.

### Formation

Route : `/admin/education/create`.

| Champ | FR | EN |
| --- | --- | --- |
| Titre | Formation Test QA | QA Test Education |
| Description | Formation fictive réservée au test local du parcours bilingue. | Fictional education entry reserved for local bilingual journey testing. |

Organisation `École Test QA` ; Période affichée `2026 (QA)` ; Date de début `2026-08-01` ; Date de fin `2026-08-31` ; En cours Non ; Ordre `90`.

### Certification

Route : `/admin/certifications/create`.

| Champ | FR | EN |
| --- | --- | --- |
| Titre | Certification Test QA | QA Test Certification |
| Description | Certification fictive, sans organisme ni qualification réelle revendiquée. | Fictional certification claiming no real issuing body or qualification. |

Organisation `Organisme Test QA` ; Ordre `90`. Le formulaire final ne comporte ni date ni lien de certificat.

### Quatre compétences

Route : `/admin/skills/create`. Les catégories existantes se sélectionnent avec le Select partagé. Aucun niveau ni pourcentage. Les noms sont communs aux deux langues.

| Nom exact | Catégorie FR / EN | Ordre | Visible |
| --- | --- | --- | --- |
| QA Interface | Applications & produits / Applications & products | `90` | Oui |
| QA Données | Backend & données / Backend & data | `91` | Oui |
| QA Exploitation | Systèmes & exploitation / Systems & operations | `92` | Oui |
| QA Masquée | IA & Data / AI & Data | `93` | Non |

Vérifier que QA Masquée reste absente d’À propos. La rendre visible, enregistrer, vérifier son apparition, puis la masquer de nouveau. Ne pas supprimer les catégories réelles lors du nettoyage.

### Message via Contact

Route : `/contact`. Nom `Visiteur Test QA` ; Email `qa.visitor@example.test` ; Sujet sélectionner `Autre` ; Message `Message fictif réservé au test local : vérifier la notification MailHog, la lecture, l’archivage et la suppression dans le dashboard.` Le honeypot reste vide. Avec CONTACT_SEND_CONFIRMATION=true, deux emails arrivent dans MailHog ; aucun email réel n’est envoyé. Le champ Langue est déterminé par l’URL de la page.

### Réseau optionnel

Route : `/admin/social-links/create`, uniquement si GitHub n’existe pas déjà. Plateforme `GitHub` ; URL `https://github.com/qa-test-account` ; Actif Non ; Ordre `90`. URL syntaxique fictive, ne pas activer ce compte ni cliquer vers lui. Si GitHub existe déjà, ignorer cette création et conserver la donnée réelle. Aucun champ Libellé : celui-ci dérive de la plateforme.

### Nettoyage exact

1. Remettre Projet Test QA en Brouillon, retirer ses deux images depuis Gérer les médias, puis supprimer le projet par « … » et confirmer. La couverture optionnelle de la publication reste attachée au contenu soft-deleted pour récupération ; le formulaire permet de la remplacer, sans action de suppression séparée.
2. Supprimer Atelier Test QA et Publication Test QA via leurs menus. Vérifier l’absence de `/projets/projet-test-qa`, `/en/projects/qa-test-project`, `/activites/atelier-test-qa`, `/en/activities/qa-test-workshop`, `/publications/publication-test-qa`, `/en/publications/qa-test-publication` et leur retrait du sitemap.
3. Supprimer uniquement Organisation Test QA, École Test QA et Organisme Test QA depuis leurs modules. Ces suppressions de parcours sont définitives.
4. Supprimer QA Interface, QA Données, QA Exploitation et QA Masquée ; garder les quatre catégories réelles.
5. Supprimer uniquement le message de Visiteur Test QA, et le réseau GitHub désactivé si vous l’avez créé. Restaurer les paramètres temporairement modifiés.
6. Les contenus et messages soft-deleted restent en base pour récupération et leurs slugs restent réservés. Un nouvel essai avec les mêmes slugs exige une restauration/maintenance de la base locale ; ne pas réutiliser ces slugs en production. Aucun effacement de contenu réel ni `migrate:fresh` sur une base utilisée.
