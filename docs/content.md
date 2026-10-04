# Gestion du contenu

Les exemples ci-dessous décrivent la structure ; ils ne sont pas des expériences à publier. Ne saisir que des faits confirmés. Tous les chemins sont relatifs à la racine.

## Ajouter un projet

Modifier `src/content/projects/index.ts`. Ajouter un objet `Project` à `projects`. Les champs obligatoires sont `id`, `slug`, `title`, `shortDescription`, `description`, `context`, `category`, `technologies`, `media`, `links`, `featured`, `confidential`, `sections`. `role` et `status` sont facultatifs.

```ts
const project: Project = {
  id: "nom-du-projet",
  slug: "nom-du-projet",
  title: { fr: "Nom officiel", en: "Official name" },
  shortDescription: { fr: "Résumé vérifié.", en: "Verified summary." },
  description: { fr: "Contribution vérifiée.", en: "Verified contribution." },
  context: { fr: "Contexte vérifié.", en: "Verified context." },
  category: "Web",
  technologies: [],
  media: [],
  links: [],
  featured: false,
  confidential: false,
  sections: [],
};
```

Catégories : `Web`, `Mobile`, `SaaS`, `Institutionnel`, `Automatisation`. Un slug contient des minuscules ASCII, chiffres et tirets, reste identique en FR/EN et doit être unique. Les pages sont générées automatiquement sous `/projets/[slug]` et `/en/projects/[slug]`. En cas de renommage, ajouter les redirections dans `next.config.ts`.

`featured` alimente la sélection d’accueil ; conserver trois projets pour la composition actuelle. Les autres apparaissent dans « Aussi dans mon univers ». Ajouter uniquement les technologies attestées. Un lien officiel est `{ type: "official", url: "https://…" }` ; `enabled: false` empêche son affichage. Aucune URL interne ne doit même entrer dans le registre.

Les noms officiels sont **MaliyaFlow**, **Libiki Lya Kongo**, **FOMIN**. Pour FOMIN, attribuer la contribution au travail chez Taprinella Logistic, sans données métier, IP, accès, montants ou architecture confidentielle.

## Ajouter une activité

Ajouter une entrée dans `src/content/activities/index.ts` (`activityEntries`). Le registre est volontairement vide. Contrat `Activity` dans `src/types/content.ts` :

```ts
const activity: Activity = {
  id: "evenement-confirme",
  slug: "evenement-confirme",
  title: { fr: "Titre confirmé", en: "Confirmed title" },
  type: { fr: "Intervention", en: "Talk" },
  description: { fr: "Description factuelle.", en: "Factual description." },
  role: { fr: "Rôle réel", en: "Actual role" },
  date: null,
  location: { fr: "Lieu confirmé", en: "Confirmed location" },
  status: "draft",
};
```

`date` peut être une date ISO `YYYY-MM-DD` vérifiée ou `null`. Passer à `published` uniquement après validation. Les pages sont dans `src/features/activities/pages.tsx`. Il n’y a pas de champ image d’activité actuellement ; `public/images/activities/` est l’emplacement prévu si ce besoin est ajouté, pas une fonctionnalité à prétendre existante.

## Ajouter une publication

1. Écrire les fichiers locaux `src/content/publications/mon-sujet.fr.mdx` et `mon-sujet.en.mdx`.
2. Ajouter deux entrées `Publication` dans `src/content/publications/index.ts`, de même slug, une par `langue`.
3. Renseigner des dates et durées de lecture réelles ; commencer par `draft`.

```ts
const publication: Publication = {
  title: "Titre validé",
  slug: "mon-sujet",
  description: "Résumé validé.",
  date: null,
  tags: ["Développement"],
  langue: "fr",
  readingTime: 4,
  status: "draft",
  file: "mon-sujet.fr.mdx",
};
```

Le contrat est dans `src/types/content.ts`. `cover` est facultatif : URL locale d’une image réelle pour le JSON-LD, par exemple `/images/publications/mon-sujet.webp`. La mise en page actuelle ne rend pas de couverture visible. Le MDX accepte titres, paragraphes, listes, liens et code ; ne pas répéter le H1 de la page dans le corps. Aucun frontmatter n’est traité : les métadonnées vivent dans le registre TypeScript. Seul du MDX de confiance est compilé côté serveur par `src/features/publications/mdx.tsx`.

Publier les deux langues ensemble : le switch de langue et le SEO emploient le même slug. `published` ajoute automatiquement les liens et routes ; Article JSON-LD est alors émis. Sans publication, la page conserve son état vide.

## Modifier mon parcours

`src/data/profile.ts` : `profile` pour l’introduction et la photo, `education` pour la formation, `certifications` pour les certifications, `journeyNotes` pour le résumé d’accueil. Garder ces notes cohérentes avec les données détaillées. Le hero se compose dans `src/features/profile/home.tsx` ; ses animations sont dans `src/styles/site.css`.

## Modifier mes expériences

Éditer `experiences` dans `src/data/profile.ts`. Chaque `Experience` contient `organization`, `role`, `description`, `contributions` et éventuellement `period`. Les trois champs textuels de présentation sont bilingues, `contributions` étant un tableau de textes bilingues. Ne pas ajouter une période non confirmée.

## Modifier mes compétences

Éditer `skills` dans le même fichier : `title`, `description`, `tools`. Les noms de technologies restent identiques entre langues. La convention existante `Français / English` dans `tools` permet de traduire les libellés génériques.

## Modifier mes informations de contact

`profile.socials` dans `src/data/profile.ts` contient les liens publics. `NEXT_PUBLIC_WHATSAPP_NUMBER` remplace le numéro WhatsApp (chiffres et indicatif international) ; vide, il conserve le numéro confirmé existant. L’adresse email publique se modifie dans `profile.socials`, indépendamment du destinataire serveur `CONTACT_EMAIL`. Les réglages Resend sont détaillés dans [deployment.md](deployment.md).

## Ajouter une image

Utiliser `public/images/projects/{slug}/nom-lisible.webp` ou un JPEG/PNG adapté, et `public/images/profile/` pour le portrait. Ne pas conserver les exports intermédiaires. Dans le projet :

```ts
media: [
  {
    src: "/images/projects/nom-du-projet/tableau-de-bord.webp",
    alt: {
      fr: "Description utile de l’écran",
      en: "Useful screen description",
    },
    kind: "screenshot",
    width: 1280,
    height: 720,
  },
];
```

Donner les dimensions réelles, sans déformer l’image. L’alt décrit l’écran sans annoncer une retouche. La galerie MaliyaFlow utilise ses cinq images dans l’ordre accueil, tâches, croissance, performances, connexion. Aucune légende visible ne doit revenir sous ses captures. Pour le portrait, `profile.portrait = null` active les initiales.

## Ajouter une traduction

Chaque objet `Localized` contient `fr` et `en`. Les libellés de navigation sont dans `src/lib/routes.ts`, les textes d’interface dans leur fonctionnalité, et les messages de validation dans `src/features/contact/form.tsx`. Éviter d’introduire un deuxième système de dictionnaires.

## Vérifier après modification

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run start -- --port 3002
```

Dans un autre terminal : `npm run check:site -- http://127.0.0.1:3002`. Le script lit automatiquement les slugs et médias du catalogue de projets. Les contrôles navigateur sont décrits dans [deployment.md](deployment.md). Relire FR/EN et vérifier les images, noms officiels et informations confidentielles.
