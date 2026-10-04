import type { Project } from "@/types/content";

export const projects: Project[] = [
  {
    id: "culinapos",
    slug: "culinapos",
    title: {
      fr: "CulinaPOS",
      en: "CulinaPOS",
    },
    shortDescription: {
      fr: "Réunir les commandes, la caisse et les stocks dans un produit pensé pour le terrain.",
      en: "Bringing orders, point of sale and inventory together in a product built for real operations.",
    },
    description: {
      fr: "Une plateforme de gestion de restaurant : menus, commandes, caisse, stocks, clients et rapports d’activité.",
      en: "Restaurant management: menus, orders, point of sale, inventory, customers and reporting.",
    },
    role: {
      fr: "Développement d’un produit SaaS métier dans l’écosystème Axum Industries.",
      en: "Business SaaS product development within the Axum Industries ecosystem.",
    },
    context: {
      fr: "Faire fonctionner les commandes, la caisse et les stocks comme un ensemble cohérent.",
      en: "Make orders, payments and inventory work as one coherent system.",
    },
    category: "SaaS",
    technologies: [],
    media: [
      {
        src: "/images/projects/culinapos/public-preview.jpg",
        alt: {
          fr: "Capture réelle de la présentation publique de CulinaPOS et de son aperçu de tableau de bord.",
          en: "Actual capture of CulinaPOS’s public presentation and dashboard preview.",
        },
        width: 1265,
        height: 712,
        kind: "screenshot",
      },
    ],
    links: [],
    featured: true,
    confidential: false,
    sections: [],
  },
  {
    id: "whasend",
    slug: "whasend",
    title: {
      fr: "WhatsApp Sender",
      en: "WhatsApp Sender",
    },
    shortDescription: {
      fr: "Connecter les applications métier aux conversations WhatsApp.",
      en: "Connecting business applications to WhatsApp conversations.",
    },
    description: {
      fr: "Intégration WhatsApp, planification et automatisation des notifications. Le produit est également connu sous le nom Whasend.",
      en: "WhatsApp integration, scheduling and automated notifications. The product is also known as Whasend.",
    },
    role: {
      fr: "Développement d’une solution d’automatisation de messagerie.",
      en: "Development of a messaging automation solution.",
    },
    context: {
      fr: "Intégrer les notifications et les envois de messages aux processus applicatifs.",
      en: "Integrate notifications and messages into application workflows.",
    },
    category: "Automatisation",
    technologies: ["Node.js"],
    media: [
      {
        src: "/images/projects/whasend/public-preview.jpg",
        alt: {
          fr: "Capture réelle de la présentation publique de Whasend avec son exemple d’intégration API.",
          en: "Actual capture of Whasend’s public presentation and API integration example.",
        },
        width: 1265,
        height: 712,
        kind: "screenshot",
      },
    ],
    links: [],
    featured: true,
    confidential: false,
    sections: [],
  },
  {
    id: "maliyaflow",
    slug: "maliyaflow",
    title: {
      fr: "MaliyaFlow",
      en: "MaliyaFlow",
    },
    shortDescription: {
      fr: "Finances personnelles, tâches et routines dans une application iOS.",
      en: "Personal finances, tasks and routines in an iOS application.",
    },
    description: {
      fr: "MaliyaFlow réunit un aperçu des transactions et du budget, un calendrier de tâches et un espace de conseils et de routines.",
      en: "MaliyaFlow brings together a transaction and budget overview, a task calendar, and an area for guidance and routines.",
    },
    context: {
      fr: "Suivre son argent et organiser son quotidien depuis une même application.",
      en: "Keeping track of money and organising everyday life in one application.",
    },
    category: "Mobile",
    technologies: [],
    media: [
      {
        src: "/images/projects/maliyaflow/home.jpeg",
        alt: {
          fr: "Accueil : tâches du jour, transactions et budget",
          en: "Home: daily tasks, transactions and budget",
        },
        kind: "screenshot",
        width: 591,
        height: 1280,
      },
      {
        src: "/images/projects/maliyaflow/tasks.jpeg",
        alt: {
          fr: "Calendrier des tâches et sélection du jour",
          en: "Task calendar and day selection",
        },
        kind: "screenshot",
        width: 591,
        height: 1280,
      },
      {
        src: "/images/projects/maliyaflow/growth.jpeg",
        alt: {
          fr: "Espace croissance : conseils et routines",
          en: "Growth area: guidance and routines",
        },
        kind: "screenshot",
        width: 591,
        height: 1280,
      },
      {
        src: "/images/projects/maliyaflow/performance.jpeg",
        alt: {
          fr: "Suivi de la discipline et de la santé financière",
          en: "Discipline and financial health overview",
        },
        kind: "screenshot",
        width: 591,
        height: 1280,
      },
      {
        src: "/images/projects/maliyaflow/login.jpeg",
        alt: {
          fr: "Écran de connexion MaliyaFlow",
          en: "MaliyaFlow sign-in screen",
        },
        kind: "screenshot",
        width: 591,
        height: 1280,
      },
    ],
    links: [],
    featured: false,
    confidential: false,
    status: {
      fr: "Application iOS",
      en: "iOS application",
    },
    sections: [
      {
        title: {
          fr: "Un aperçu des finances",
          en: "A financial overview",
        },
        body: {
          fr: "L’accueil donne accès aux transactions, au budget, aux catégories et aux comptes. L’espace Performances permet de choisir entre le franc congolais (CDF) et le dollar américain (USD).",
          en: "The home screen provides access to transactions, budget, categories and accounts. The Performance area includes a CDF / USD selector.",
        },
      },
      {
        title: {
          fr: "Des tâches aux habitudes",
          en: "From tasks to habits",
        },
        body: {
          fr: "Le calendrier permet de parcourir les jours et leurs tâches. L’espace Croissance regroupe des conseils financiers et un espace dédié aux routines.",
          en: "The calendar lets users browse days and their tasks. The Growth area brings together financial guidance and a dedicated entry for routines.",
        },
      },
      {
        title: {
          fr: "Suivre sa progression",
          en: "Tracking progress",
        },
        body: {
          fr: "L’écran Performances présente un score global, les jours actifs, la progression de niveau et des indicateurs de discipline et de santé financière.",
          en: "The Performance screen displays an overall score, active days, level progression, and discipline and financial health indicators.",
        },
      },
    ],
  },
  {
    id: "axum",
    slug: "axum",
    title: {
      fr: "Axum Industries",
      en: "Axum Industries",
    },
    shortDescription: {
      fr: "La présence numérique d’une initiative technologique ancrée à Kinshasa.",
      en: "The digital presence of a technology initiative rooted in Kinshasa.",
    },
    description: {
      fr: "Une présence web publique qui donne à découvrir Axum Industries et ses activités.",
      en: "A public web presence introducing Axum Industries and its activities.",
    },
    role: {
      fr: "Cofondateur, ingénieur logiciel et responsable technique.",
      en: "Co-founder, Software Engineer and Technical Lead.",
    },
    context: {
      fr: "Présenter les solutions, les projets et la démarche de l’entreprise.",
      en: "Present the company’s solutions, projects and approach.",
    },
    category: "Web",
    technologies: [],
    media: [
      {
        src: "/images/projects/axum/public-preview.jpg",
        alt: {
          fr: "Capture réelle de la page publique Axum Industries présentant ses solutions technologiques.",
          en: "Actual capture of Axum Industries’ public technology solutions page.",
        },
        width: 1265,
        height: 712,
        kind: "screenshot",
      },
    ],
    links: [
      {
        type: "official",
        url: "https://axumindustries.com/",
      },
    ],
    featured: false,
    confidential: false,
    sections: [],
  },
  {
    id: "institutionnel",
    slug: "projet-institutionnel",
    title: {
      fr: "FOMIN",
      en: "FOMIN",
    },
    shortDescription: {
      fr: "Contribuer à un logiciel de gestion de la redevance minière, chez Taprinella Logistic.",
      en: "Contributing to mining royalty management software at Taprinella Logistic.",
    },
    description: {
      fr: "Dans le cadre de mon expérience chez Taprinella Logistic, j’ai contribué au développement et à l’évolution du logiciel de gestion de la redevance minière du FOMIN.",
      en: "Participation in the development and evolution of FOMIN’s mining royalty management software as part of my work at Taprinella Logistic.",
    },
    context: {
      fr: "Un logiciel métier existant, utilisé dans un contexte institutionnel lié à la redevance minière.",
      en: "Existing business software used in an institutional context involving mining royalties.",
    },
    role: {
      fr: "Ingénieur / développeur chez Taprinella Logistic — contribution au projet FOMIN.",
      en: "Engineer / developer at Taprinella Logistic — contribution to the FOMIN project.",
    },
    category: "Institutionnel",
    technologies: [],
    media: [
      {
        src: "/images/projects/fomin/fomin-dashboard.png",
        alt: {
          fr: "Tableau de bord du logiciel de gestion de la redevance minière du FOMIN",
          en: "FOMIN mining royalty management dashboard",
        },
        width: 1672,
        height: 941,
        kind: "screenshot",
      },
    ],
    links: [],
    featured: true,
    confidential: true,
    sections: [
      {
        title: {
          fr: "Développement et maintenance",
          en: "Development and maintenance",
        },
        body: {
          fr: "Faire évoluer une application existante demande de comprendre ses règles métier, de maintenir ses fonctionnalités et de corriger les anomalies dans un cadre professionnel.",
          en: "Evolving existing software requires understanding its business rules, maintaining its features and fixing issues in a professional setting.",
        },
      },
      {
        title: {
          fr: "Confidentialité",
          en: "Confidentiality",
        },
        body: {
          fr: "Certains détails techniques et opérationnels ne sont pas présentés pour des raisons de confidentialité.",
          en: "Some technical and operational details are omitted for confidentiality.",
        },
      },
    ],
  },
  {
    id: "libiki-lya-kongo",
    slug: "libiki-lya-kongo",
    title: {
      fr: "Libiki Lya Kongo",
      en: "Libiki Lya Kongo",
    },
    shortDescription: {
      fr: "Une plateforme web associative réalisée dans l’écosystème Axum Industries.",
      en: "An association website created within the Axum Industries ecosystem.",
    },
    description: {
      fr: "Une plateforme web associative réalisée dans l’écosystème Axum Industries.",
      en: "An association website created within the Axum Industries ecosystem.",
    },
    context: {
      fr: "Une présence numérique pour rendre une organisation, ses activités et ses services accessibles.",
      en: "A digital presence that makes an organisation, its activities and services accessible.",
    },
    category: "Web",
    technologies: [],
    media: [
      {
        src: "/images/projects/libiki-lya-kongo/public-preview.jpg",
        alt: {
          fr: "Site web de Libiki Lya Kongo",
          en: "Screenshot of the Libiki Lya Kongo public website",
        },
        kind: "screenshot",
        width: 1265,
        height: 712,
      },
    ],
    links: [
      {
        type: "official",
        url: "https://libikilyakongo.org/",
        enabled: true,
      },
    ],
    featured: false,
    confidential: false,
    sections: [],
  },
  {
    id: "esikanayo",
    slug: "esikanayo",
    title: {
      fr: "Esikanayo",
      en: "Esikanayo",
    },
    shortDescription: {
      fr: "Une initiative entrepreneuriale tournée vers le développement web et la digitalisation.",
      en: "An entrepreneurial initiative focused on web development and digitalisation.",
    },
    description: {
      fr: "Une initiative entrepreneuriale tournée vers le développement web et la digitalisation.",
      en: "An entrepreneurial initiative focused on web development and digitalisation.",
    },
    context: {
      fr: "Une présence numérique pour rendre une organisation, ses activités et ses services accessibles.",
      en: "A digital presence that makes an organisation, its activities and services accessible.",
    },
    category: "Web",
    technologies: [],
    media: [
      {
        src: "/images/projects/esikanayo/public-preview.jpg",
        alt: {
          fr: "Site web de Esikanayo",
          en: "Screenshot of the Esikanayo public website",
        },
        kind: "screenshot",
        width: 1265,
        height: 712,
      },
    ],
    links: [
      {
        type: "official",
        url: "https://esikanayo.com/",
        enabled: true,
      },
    ],
    featured: false,
    confidential: false,
    sections: [],
  },
  {
    id: "agriculture-pour-tous",
    slug: "agriculture-pour-tous",
    title: {
      fr: "Agriculture Pour Tous",
      en: "Agriculture Pour Tous",
    },
    shortDescription: {
      fr: "Une réalisation web associée à l’écosystème Esikanayo.",
      en: "A web project associated with the Esikanayo ecosystem.",
    },
    description: {
      fr: "Une réalisation web associée à l’écosystème Esikanayo.",
      en: "A web project associated with the Esikanayo ecosystem.",
    },
    context: {
      fr: "Une présence numérique pour rendre une organisation, ses activités et ses services accessibles.",
      en: "A digital presence that makes an organisation, its activities and services accessible.",
    },
    category: "Web",
    technologies: [],
    media: [
      {
        src: "/images/projects/agriculture/public-preview.jpg",
        alt: {
          fr: "Site web de Agriculture Pour Tous",
          en: "Screenshot of the Agriculture Pour Tous public website",
        },
        kind: "screenshot",
        width: 1270,
        height: 714,
      },
    ],
    links: [
      {
        type: "official",
        url: "https://agriculturepourtous.com/",
        enabled: false,
      },
    ],
    featured: false,
    confidential: false,
    sections: [],
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);
export const publicLinks = (p: Project) =>
  p.links.filter((link) => link.enabled !== false);
