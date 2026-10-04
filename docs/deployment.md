# Lancement, vérification et VPS

## Versions et prérequis

Laravel 13.34.0, PHP utilisé 8.4.5, Inertia Laravel 3.5.1, React 19, Vite 8, Tailwind 4, TypeScript 5.9.3 et Node utilisé 24.19.0. Les versions exactes sont verrouillées dans composer.lock et package-lock.json. Conserver l’override SWC 1.15.11 : il corrigeait un binding Windows de l’ancien projet ; Vite React n’en dépend pas directement.

Installer PHP 8.4 avec pdo_pgsql, mbstring, openssl, fileinfo, ctype, tokenizer, DOM/XML ; pdo_sqlite/sqlite3 pour les tests rapides. Composer 2, Node 22.18+ ou 24, PostgreSQL et npm sont nécessaires. PostgreSQL 18 a été utilisé pour la validation ; aucune base existante de l’utilisateur n’a été réinitialisée.

## Installation locale

```sh
composer install
cp .env.example .env
php artisan key:generate
# Créer espoir_portfolio et un utilisateur PostgreSQL dédié ; configurer DB_*.
php artisan migrate --seed
php artisan storage:link
php artisan admin:create
npm install
npm run build
composer run dev
```

Sous Windows : Copy-Item .env.example .env ; activer pdo_pgsql dans php.ini. Le serveur utilise http://127.0.0.1:8000, /login et /admin. admin:create demande le nom, l’email et un mot de passe secret confirmé de douze caractères minimum. Aucun identifiant par défaut.

Alternative locale explicite : renseigner ADMIN_EMAIL et ADMIN_PASSWORD dans .env, puis `php artisan db:seed --class=AdminUserSeeder`. La configuration absente provoque une erreur claire ; un compte existant conserve son mot de passe et ses permissions. Le seed général ne crée aucun utilisateur. Le bootstrap et admin:create partagent AdminAccounts. Ne jamais versionner ces valeurs. Après bootstrap de production, retirer ADMIN_PASSWORD, reconstruire le cache de configuration et modifier le secret local initial via /admin/profile.

Les essais de migration ont utilisé un cluster isolé ignoré .local/postgres, lié à 127.0.0.1:55432, et le chargement local .local/php/pgsql.ini. Ce dispositif est uniquement de QA ; configurer son propre PostgreSQL pour une installation durable. Dans cette session Windows, PHP_INI_SCAN_DIR doit viser .local/php si l’extension n’est pas activée dans php.ini.

composer run dev lance PHP et Vite ; le plugin Inertia 3 fournit automatiquement le SSR en développement. Pour vérifier le build de production, arrêter Vite, supprimer public/hot s’il est resté après un arrêt forcé, puis utiliser deux terminaux :

```sh
php artisan serve --host=127.0.0.1 --port=8000
php artisan inertia:start-ssr
```

## MailHog

Lancer MailHog en local (binaire officiel ou conteneur) ; SMTP 127.0.0.1:1025, interface http://127.0.0.1:8025. Exemple binaire :

```sh
MailHog -smtp-bind-addr 127.0.0.1:1025 -ui-bind-addr 127.0.0.1:8025 -api-bind-addr 127.0.0.1:8025
```

L’exemple .env configure déjà SMTP sans authentification : MAIL_MAILER=smtp, MAIL_HOST=127.0.0.1, MAIL_PORT=1025, MAIL_USERNAME/MAIL_PASSWORD vides, MAIL_SCHEME=null. Ajouter ADMIN_EMAIL pour une notification capturée par MailHog et CONTACT_SEND_CONFIRMATION=true pour l’accusé visiteur. Si Laravel est dans Docker, MAIL_HOST=mailhog convient seulement si ce nom désigne le service dans son réseau. Le dashboard conserve le message même si SMTP est indisponible. Les tests automatisés utilisent Mail::fake et Notification::fake ; les essais navigateur vérifient aussi notification, confirmation et reset dans MailHog, sans email réel. Les vues email partagent un layout Blade responsive en tables, styles inline, expéditeur, signature et CTA ; aucun composant React n’intervient dans leur rendu.

## Variables

| Groupe | Variables et usage |
| --- | --- |
| Application | APP_NAME, APP_ENV, APP_KEY stable, APP_DEBUG, APP_URL canonique, APP_LOCALE=fr, APP_FALLBACK_LOCALE=fr |
| PostgreSQL | DB_CONNECTION=pgsql, DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD |
| Sessions/cache | SESSION_DRIVER=database, SESSION_LIFETIME, SESSION_ENCRYPT=true, SESSION_SECURE_COOKIE, CACHE_STORE=database |
| Email | MAIL_MAILER=smtp, MAIL_SCHEME, MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_ADDRESS, MAIL_FROM_NAME, ADMIN_EMAIL |
| Exécution | QUEUE_CONNECTION=sync, LOG_CHANNEL, LOG_LEVEL, INERTIA_SSR_ENABLED=true, INERTIA_SSR_URL=http://127.0.0.1:13714 |
| Frontend/SEO | VITE_APP_NAME, SITE_INDEXABLE=false pour local/previews, true seulement sur domaine final |

Les secrets restent dans .env, jamais dans Git ni dans une variable VITE_*. L’email public et le numéro WhatsApp sont administrés en base ; ADMIN_EMAIL sert au destinataire des notifications et au bootstrap explicitement demandé. ADMIN_PASSWORD ne sert qu’au bootstrap.

## Contrôles

```sh
npm run typecheck
npm run lint
npm test
composer lint
npm run build
npm run check:site -- http://127.0.0.1:8000
node scripts/check-browser.mjs http://127.0.0.1:8000
```

Le script navigateur utilise Chrome installé par défaut ; PLAYWRIGHT_CHANNEL peut sélectionner un autre canal installé. Il contrôle les largeurs 375, 390, 430, 768, 820, 1024 et 1440, clair/sombre, images, débordements, navigation, changement de langue, menu clavier et persistance du thème. --quick réduit les pages publiques et les largeurs testées (390/1440) ; --admin ajoute les modules privés, dont profil, éditeurs et médias contextuels. Il utilise E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD, ou les valeurs ADMIN_EMAIL/ADMIN_PASSWORD du .env local ignoré. Ne pas utiliser un compte de production. Les scripts navigateur ne fonctionnent que sur localhost. Rapports et captures dans artifacts/, jamais public.

PHPUnit utilise SQLite en mémoire par défaut. Pour PostgreSQL, créer une base de test dédiée, puis définir DB_CONNECTION=pgsql, DB_DATABASE=espoir_portfolio_test et les autres DB_* avant php artisan test. RefreshDatabase réinitialise cette base : ne jamais viser la base de production. Les tests couvrent contenus et empreintes, traductions, publication, autorisations, CRUD, uploads, confidentialité FOMIN, contact/honeypot/throttle, visites, archivage/suppression, visibilité des compétences, migrations, SEO, Markdown et seed idempotent.

### Parcours navigateur avec écritures isolées

`check:admin` crée et supprime des contenus automatiques, vérifie filtres/pagination, saisies FR/EN, publication, archivage, messages, deux emails MailHog et retour en haut. Il exige le serveur local 8001 et E2E_DISPOSABLE=true. Les fixtures automatiques sont distinctes du jeu « Manual QA Data », qui reste à saisir manuellement depuis le README.

Dans un terminal PowerShell réservé à la base de test locale existante :

```powershell
$env:PHP_INI_SCAN_DIR = (Join-Path (Get-Location) '.local/php')
$env:DB_CONNECTION = 'pgsql'
$env:DB_HOST = '127.0.0.1'
$env:DB_PORT = '55432'
$env:DB_DATABASE = 'espoir_portfolio_test'
# Renseigner DB_USERNAME/DB_PASSWORD pour ce cluster local.
$env:APP_URL = 'http://127.0.0.1:8001'
php artisan migrate
php tests/fixtures/bootstrap-browser.php
php artisan serve --host=127.0.0.1 --port=8001 --no-reload
```

Le helper refuse toute autre connexion, hôte, port ou base. Il réutilise ADMIN_EMAIL/ADMIN_PASSWORD du .env local ignoré pour un compte jetable, et écrit ses identifiants dans artifacts/browser-credentials.json, ignoré par Git. MailHog doit être actif et CONTACT_SEND_CONFIRMATION=true. Dans un deuxième terminal :

```powershell
$env:E2E_DISPOSABLE = 'true'
$env:E2E_CREDENTIALS_FILE = 'artifacts/browser-credentials.json'
npm run check:admin
```

Après le parcours, arrêter le serveur 8001, puis lancer php artisan test dans le terminal configuré pour espoir_portfolio_test afin de nettoyer ses fixtures par RefreshDatabase. Supprimer artifacts/browser-credentials.json. Ne pas exécuter PHPUnit simultanément au parcours navigateur ; les deux utilisent la même base jetable. Le serveur et la base quotidiens restent séparés. Les captures et rapports restent dans artifacts/.

## VPS — installation initiale

Le domaine demandé est espoir.axumindustries.com ; la distribution du VPS reste à préciser. Installer ses paquets adaptés pour Nginx, PHP 8.4-FPM avec extensions, Composer 2, Node 24 et PostgreSQL. Préparer un utilisateur de déploiement, une base dédiée et /srv/espoir-portfolio, puis y cloner le dépôt. Ne pas exposer PostgreSQL, SSR ou MailHog à Internet.

```sh
cd /srv/espoir-portfolio
composer install --no-dev --prefer-dist --optimize-autoloader
cp .env.example .env
# Renseigner les valeurs production ci-dessous avant les migrations.
php artisan key:generate
php artisan migrate --seed --force
php artisan storage:link
php artisan admin:create
npm ci
npm run build
php artisan optimize
```

Configurer APP_ENV=production, APP_DEBUG=false, APP_URL=https://son-domaine, SESSION_SECURE_COOKIE=true, SITE_INDEXABLE=true ; DB_* réels et SMTP réel avec expéditeur vérifié. Conserver APP_KEY après création. Le transport initial est SMTP ; Resend peut être configuré ultérieurement avec un transport compatible, sans exposer sa clé au navigateur.

Autoriser PHP-FPM à écrire uniquement dans storage et bootstrap/cache. Les sources, .env et vendor ne doivent pas être modifiables par les requêtes web. Exemple, à adapter au propriétaire de déploiement :

```sh
sudo chgrp -R www-data storage bootstrap/cache
sudo chmod -R ug+rwX storage bootstrap/cache
```

Installer deploy/nginx.conf dans la configuration Nginx du site, remplacer server_name par son domaine, vérifier le socket PHP 8.4 et ajouter HTTPS avec son certificat. La racine doit être /srv/espoir-portfolio/public, jamais le dépôt. Le fichier fourni est une base HTTP locale avant configuration TLS. Activer la redirection HTTP→HTTPS et conserver les cookies sécurisés une fois TLS actif.

Installer deploy/espoir-ssr.service dans /etc/systemd/system ; vérifier les chemins php et node, puis :

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now espoir-ssr
sudo nginx -t
sudo systemctl reload nginx
php artisan inertia:check-ssr
```

Le service SSR écoute uniquement 127.0.0.1:13714. Aucun worker de queue n’est nécessaire avec QUEUE_CONNECTION=sync. Si un transport asynchrone est activé plus tard, ajouter un worker supervisé et ses contrôles avant de changer cette variable.

## Mise à jour, sauvegarde et rollback

Sauvegarder PostgreSQL et storage/app/public avant déploiement. Déployer un commit identifié et conserver la possibilité de restaurer le commit précédent avec ses lockfiles. Exécuter composer install --no-dev, npm ci, npm run build, php artisan migrate --force et php artisan optimize ; redémarrer espoir-ssr et recharger PHP-FPM. Ne pas lancer migrate:fresh sur un VPS. db:seed est idempotent mais n’est pas requis à chaque mise à jour.

Sauvegarder quotidiennement la base avec pg_dump et les fichiers uploadés dans un emplacement distinct protégé ; vérifier une restauration. Une migration de base n’est pas annulée par un simple rollback Git : examiner ses effets et restaurer la sauvegarde si nécessaire. Conserver APP_KEY et les secrets hors dépôt.

Contrôler après déploiement : santé /up, SSR, FR/EN, images, admin privé, contact, canonical/hreflang, sitemap et robots. Un test de délivrabilité réel exige l’autorisation du propriétaire. Les migrations de simplification conservent les textes et les médias existants. Un rollback reconstruit les colonnes supprimées mais ne reconstitue pas leurs anciennes métadonnées, les paramètres retirés ni les événements supprimés : la sauvegarde préalable reste la source d’un retour complet. Le seeder n’insère jamais le jeu « Manual QA Data », disponible uniquement dans le README.

La CI fournie exécute les contrôles sur PostgreSQL, sans clé SSH, secrets de déploiement ni publication automatique. Aucun VPS n’a été déployé pendant la migration.
