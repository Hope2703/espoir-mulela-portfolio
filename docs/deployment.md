# Mise en production

## Prérequis

Node.js 22.18+ ou 24 LTS, npm, un dépôt Git privé ou public et un compte Vercel. Ce dossier n’avait pas de dépôt `.git` lors de la passe du 4 octobre 2026 : créer le dépôt et le publier avant l’import Vercel. Aucune mise en ligne n’est effectuée par les scripts du projet.

Le projet utilise Next.js 16.3.8 ; conserver `package-lock.json`. L’override `@swc/core: 1.15.11` évite une erreur de chargement du binding natif Windows observée avec la version résolue plus récente. Le réévaluer avec un build Windows et Linux avant suppression. ESLint 9 est conservé pour la compatibilité du plugin d’accessibilité ; ne pas appliquer une montée majeure forcée.

## Variables d’environnement

Copier `.env.example` dans `.env.local` pour les essais. Les secrets ne sont jamais préfixés `NEXT_PUBLIC_`.

| Variable                      | Utilisation                                                                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`        | Origine HTTPS canonique finale, sans slash final. Alimente metadataBase, canonical, hreflang, OG, sitemap et origine autorisée du formulaire. Vide en local : fallback `http://127.0.0.1:3000`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro public avec indicatif. Vide : numéro confirmé dans `src/data/profile.ts`.                                                                                                                |
| `SITE_INDEXABLE`              | `true` en production finale uniquement. `false` sur les previews ; bloque robots et vide le sitemap.                                                                                            |
| `CONTACT_EMAIL`               | Adresse destinataire des messages.                                                                                                                                                              |
| `CONTACT_FROM`                | Adresse expéditrice autorisée par le domaine Resend vérifié.                                                                                                                                    |
| `RESEND_API_KEY`              | Clé serveur Resend.                                                                                                                                                                             |
| `CONTACT_SECRET`              | Secret aléatoire stable partagé par toutes les instances, pour signer les jetons.                                                                                                               |
| `CONTACT_TRUST_PROXY`         | `true` uniquement si l’hébergement garantit la réécriture de `X-Forwarded-For`. Sinon conserver `false`.                                                                                        |

Générer le secret localement avec `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`, puis le stocker dans les secrets Vercel, jamais dans Git. Reconstruire après une modification de l’URL, du numéro ou de l’indexation : le contenu est pré-généré et les variables publiques sont intégrées au build.

## Build local

```sh
npm install
npm run lint
npm run typecheck
npm test
npm run build
npm run start -- --port 3002
```

Sans service email, le formulaire affiche une indisponibilité et garde le texte dans les champs. Pour tester le contrat API signé sans email réel, fournir seulement `CONTACT_SECRET`, puis lancer `node scripts/check-contact.mjs`. Ce script consomme le quota local ; redémarrer le serveur avant un autre test de formulaire. Ne jamais l’utiliser avec Resend actif.

Dans un second terminal :

```sh
npm run check:site -- http://127.0.0.1:3002
npx playwright install chromium
node scripts/check-browser.mjs http://127.0.0.1:3002
```

Le navigateur peut aussi être Chrome déjà installé : définir `PLAYWRIGHT_CHANNEL=chrome` dans le terminal. Playwright est une dépendance de développement et n’est pas lancé pendant le build Vercel. Le script capture sept vues dans `artifacts/`, vérifie les sept largeurs de 375 à 1440 px, les thèmes et les interactions. `artifacts/` reste ignoré par Git ; aucun export de test ne part dans `public/`.

## Déploiement Vercel

Importer le dépôt, choisir le preset Next.js et Node.js 24, conserver `npm run build` et les réglages de sortie automatiques. Ajouter les variables dans l’environnement concerné, puis déployer. Ne pas configurer `output: "export"` : le formulaire et les images ont besoin du runtime Next.js. Pour une preview avec formulaire, `NEXT_PUBLIC_SITE_URL` doit correspondre à son origine, et `SITE_INDEXABLE` rester `false`. Voir les [environnements Vercel](https://vercel.com/docs/deployments/environments).

## Configuration du domaine

Ajouter le domaine dans le projet Vercel et appliquer les enregistrements demandés par son tableau de bord. Choisir une URL canonique et rediriger ses variantes vers elle. Renseigner ensuite cette origine dans `NEXT_PUBLIC_SITE_URL` et redéployer. Procédure : [configuration du domaine Vercel](https://vercel.com/docs/domains/set-up-custom-domain).

## Resend

Vérifier un domaine d’envoi, créer une clé API adaptée et renseigner les quatre variables `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_EMAIL`, `CONTACT_SECRET`. L’adresse du visiteur devient `reply_to`, jamais l’expéditeur. L’implémentation emploie directement l’[API Send Email](https://resend.com/docs/api-reference/emails/send-email), sans SDK supplémentaire.

## DNS

Utiliser les valeurs actuelles affichées par Vercel pour le site et par Resend pour l’authentification de l’expéditeur. Conserver les enregistrements email existants du domaine. Resend vérifie notamment SPF et DKIM ; attendre la confirmation de vérification avant l’envoi réel. Voir [domaines vérifiés Resend](https://resend.com/docs/dashboard/domains/introduction). Ne pas copier une IP ou un enregistrement DNS d’un ancien tutoriel.

## Tests après déploiement

Vérifier les pages FR/EN, les redirections d’anciens slugs, les 404 du CV, images, navigation clavier/mobile, choix clair/sombre/système, réduction des animations et contact direct. Contrôler `/robots.txt`, `/sitemap.xml`, `/api/og?lang=fr`, `/api/og?lang=en`, canonical et hreflang sur le domaine final.

Effectuer un envoi réel autorisé depuis le formulaire : réception dans `CONTACT_EMAIL`, réponse vers l’adresse du visiteur, et absence de faux succès après échec. Les essais locaux sans clé ne vérifient pas la délivrabilité. Aucun analytics n’est installé ; en ajouter seulement si souhaité.

## Rollback simple

Dans Vercel, restaurer le dernier déploiement validé via les actions du projet. Si nécessaire, rétablir aussi les variables modifiées puis redéployer le commit précédent. Ne jamais compter sur le rollback du code pour annuler une modification DNS ou un secret révoqué. Il n’y a aucune migration de base de données.

## Checklist Production

- [ ] Dépôt Git créé et publié, lockfile inclus.
- [ ] Domaine final, DNS et HTTPS vérifiés.
- [ ] Variables d’environnement définies pour le bon environnement.
- [ ] WhatsApp, email public et LinkedIn vérifiés.
- [ ] Resend et domaine expéditeur vérifiés.
- [ ] `CONTACT_SECRET` stable configuré sur toutes les instances.
- [ ] metadataBase/canonical/hreflang sur le domaine final.
- [ ] OpenGraph FR/EN vérifié.
- [ ] Analytics ajouté uniquement si souhaité.
- [ ] Formulaire testé jusqu’à la réception réelle.
- [ ] Mobile, clavier, thèmes et reduced-motion vérifiés.
- [ ] SEO : `SITE_INDEXABLE=true`, robots et sitemap vérifiés.
- [ ] Build production et tests réussis.

La limitation anti-abus applicative est locale à chaque instance ; les protections de trafic de la plateforme doivent être adaptées si nécessaire. Aucun secret, email envoyé ni déploiement réel n’est requis pour les tests locaux.
