import type {
  Profile,
  Experience,
  Education,
  Certification,
  Skill,
  SocialLink,
} from "@/types/content";
const whatsapp =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, "") ||
  "243853621283";
// Only a real, explicitly configured Instagram profile becomes a public link.
const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ?? "";
const instagramEnabled =
  /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?$/.test(instagram);
export const socialLinks: SocialLink[] = [
  {
    name: "WhatsApp",
    href: `https://wa.me/${whatsapp}`,
    label: `+${whatsapp}`,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/espoir-mulela-20a282247",
    label: "Espoir Mulela",
  },
  ...(instagramEnabled
    ? [{ name: "Instagram", href: instagram, label: "Espoir Mulela" }]
    : []),
  {
    name: "Email",
    href: "mailto:espoirmulela67@gmail.com",
    label: "espoirmulela67@gmail.com",
  },
];
export const profile: Profile = {
  name: "Espoir Mulela Mastolo",
  navigationName: "ESPOIR MULELA",
  location: {
    fr: "Kinshasa, République démocratique du Congo",
    en: "Kinshasa, Democratic Republic of the Congo",
  },
  introduction: {
    fr: "Je pars du besoin métier pour construire des solutions numériques utiles, fiables et évolutives. De la première discussion à la mise en production, je relie les usages, le code et les systèmes.",
    en: "I start with the business need to build useful, reliable digital solutions that can evolve. From the first conversation to production, I connect people’s workflows, code and systems.",
  },
  portrait: {
    src: "/images/profile/espoir-mulela.jpg",
    alt: { fr: "Espoir Mulela Mastolo", en: "Espoir Mulela Mastolo" },
    width: 1707,
    height: 2560,
    kind: "portrait",
  },
  socials: socialLinks,
};
export const experiences: Experience[] = [
  {
    organization: "Axum Industries",
    role: {
      fr: "Cofondateur · Ingénieur logiciel · Responsable technique",
      en: "Co-founder · Software Engineer · Technical Lead",
    },
    description: {
      fr: "Construire des produits et donner une direction technique à une initiative entrepreneuriale.",
      en: "Building products and shaping the technical direction of an entrepreneurial initiative.",
    },
    contributions: [
      {
        fr: "Conception de produits numériques, développement backend et full-stack.",
        en: "Digital product design, backend and full-stack development.",
      },
      {
        fr: "Architecture applicative, modélisation des données et déploiement.",
        en: "Application architecture, data modelling and deployment.",
      },
    ],
  },
  {
    organization: "Esikanayo",
    role: {
      fr: "Cofondateur · Ingénieur logiciel",
      en: "Co-founder · Software Engineer",
    },
    description: {
      fr: "Accompagner la digitalisation, du besoin exprimé à une plateforme utilisable.",
      en: "Supporting digitalisation, from a stated need to a usable platform.",
    },
    contributions: [
      {
        fr: "Analyse des besoins et conception de plateformes web.",
        en: "Requirements analysis and web platform design.",
      },
      {
        fr: "Développement, accompagnement technique, déploiement et maintenance.",
        en: "Development, technical support, deployment and maintenance.",
      },
    ],
  },
  {
    organization: "Taprinella Logistic SARL",
    role: { fr: "Développeur logiciel", en: "Software Developer" },
    description: {
      fr: "Contribution au développement du logiciel de gestion de la redevance minière du FOMIN, dans le cadre de mon travail chez Taprinella Logistic.",
      en: "Contributing to FOMIN’s mining royalty management software as part of my work at Taprinella Logistic.",
    },
    contributions: [
      {
        fr: "FOMIN : développement et maintenance d’un logiciel métier existant de gestion de la redevance minière.",
        en: "FOMIN: development and maintenance of existing mining royalty management software.",
      },
      {
        fr: "Déploiement, administration technique et collaboration avec les équipes réseau et IT.",
        en: "Deployment, technical administration and collaboration with network and IT teams.",
      },
    ],
  },
  {
    organization: "Ministère des Finances — RDC",
    role: { fr: "Stage en informatique", en: "IT internship" },
    description: {
      fr: "Une expérience de l’informatique au contact des utilisateurs dans un contexte institutionnel.",
      en: "An experience of IT close to users in an institutional setting.",
    },
    contributions: [
      {
        fr: "Support informatique, maintenance et assistance technique aux utilisateurs.",
        en: "IT support, maintenance and technical assistance for users.",
      },
    ],
  },
];
export const education: Education[] = [
  {
    organization: "Université Protestante au Congo — UPC",
    period: "2021–2025",
    title: {
      fr: "Licence — parcours en ingénierie logicielle",
      en: "Bachelor’s degree — software engineering studies",
    },
    description: {
      fr: "Diplôme obtenu avec la mention Bien. Une base en algorithmique, programmation, conception logicielle, bases de données et développement web.",
      en: "Degree awarded with the distinction “Bien”. A foundation in algorithms, programming, software design, databases and web development.",
    },
  },
  {
    organization: "Kadea Academy",
    period: "2026",
    title: {
      fr: "Formation en développement en intelligence artificielle",
      en: "Artificial Intelligence development programme",
    },
    description: {
      fr: "Spécialisation en cours dans la continuité de mon parcours logiciel. Le travail actuel porte sur Python, la programmation, la logique et les fondamentaux algorithmiques nécessaires à la suite du programme.",
      en: "An ongoing specialisation extending my software engineering background. Current work focuses on Python, programming, logic and the algorithmic foundations needed for the next stages.",
    },
  },
  {
    organization: "New Hope College",
    title: {
      fr: "Formation en anglais — niveau 4",
      en: "English training — Level 4",
    },
    description: {
      fr: "Un parcours linguistique pour travailler, apprendre et échanger dans un contexte international.",
      en: "Language training to work, learn and communicate internationally.",
    },
  },
];
export const certifications: Certification[] = [
  {
    organization: "Duolingo",
    title: "Duolingo English Test",
    detail: { fr: "110 / 160 · niveau B2", en: "110 / 160 · B2 level" },
  },
  {
    organization: "ANSSI",
    title: "SecNumAcadémie",
    detail: {
      fr: "Fondamentaux de cybersécurité, protection des données et sécurité des accès.",
      en: "Cybersecurity foundations, data protection and access security.",
    },
  },
];
export const skills: Skill[] = [
  {
    title: { fr: "Applications & produits", en: "Applications & products" },
    description: {
      fr: "Concevoir des parcours lisibles et des outils adaptés aux usages métier.",
      en: "Designing clear user journeys and tools suited to business workflows.",
    },
    tools: ["Laravel", "React", "TypeScript", "JavaScript"],
  },
  {
    title: { fr: "Backend & données", en: "Backend & data" },
    description: {
      fr: "Structurer la logique métier, les API et les données qui font fonctionner le produit.",
      en: "Structuring the business logic, APIs and data behind a product.",
    },
    tools: ["PHP", "Node.js", "SQL", "API REST"],
  },
  {
    title: { fr: "Systèmes & exploitation", en: "Systems & operations" },
    description: {
      fr: "Relier développement, déploiement, maintenance et sécurité applicative.",
      en: "Connecting development, deployment, maintenance and application security.",
    },
    tools: ["Git", "Linux", "Windows Server", "Déploiement / Deployment"],
  },
  {
    title: { fr: "IA & Data", en: "AI & Data" },
    description: {
      fr: "Une spécialisation en cours chez Kadea Academy, centrée actuellement sur Python et les bases de la programmation.",
      en: "A direction of specialisation supported by my current training at Kadea Academy.",
    },
    tools: ["Python", "Algorithmique / Algorithms"],
  },
];

export const journeyNotes = [
  {
    label: { fr: "2021—2025", en: "2021—2025" },
    title: {
      fr: "Université Protestante au Congo",
      en: "Université Protestante au Congo",
    },
    description: {
      fr: "Ingénierie logicielle · mention Bien",
      en: "Software engineering · distinction “Bien”",
    },
    current: false,
  },
  {
    label: { fr: "EXPÉRIENCES & INITIATIVES", en: "EXPERIENCE & INITIATIVES" },
    title: {
      fr: "Travailler dans différents environnements.",
      en: "Understanding different environments.",
    },
    description: {
      fr: "Taprinella Logistic · Ministère des Finances · Axum Industries · Esikanayo",
      en: "Taprinella Logistic · Ministry of Finance · Axum Industries · Esikanayo",
    },
    current: false,
  },
  {
    label: { fr: "AUJOURD’HUI / 2026", en: "TODAY / 2026" },
    title: {
      fr: "Produits numériques. IA & Data.",
      en: "Digital products. AI & Data.",
    },
    description: {
      fr: "Je poursuis mon parcours entrepreneurial et une formation en développement en intelligence artificielle chez Kadea Academy.",
      en: "I continue my entrepreneurial journey alongside an Artificial Intelligence development programme at Kadea Academy.",
    },
    current: true,
  },
];
