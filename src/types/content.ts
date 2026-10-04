export type Locale = "fr" | "en";
export type Localized = Record<Locale, string>;
export type Media = {
  src: string;
  alt: Localized;
  kind: "screenshot" | "portrait";
  width: number;
  height: number;
};
export type ProjectMedia = Omit<Media, "kind"> & { kind: "screenshot" };
export type SocialLink = { name: string; href: string; label: string };
export type Profile = {
  name: string;
  navigationName: string;
  location: Localized;
  introduction: Localized;
  portrait: Media | null;
  socials: SocialLink[];
};
export type Experience = {
  organization: string;
  role: Localized;
  period?: string;
  description: Localized;
  contributions: Localized[];
};
export type Education = {
  organization: string;
  title: Localized;
  period?: string;
  description: Localized;
};
export type Certification = {
  organization: string;
  title: string;
  detail: Localized;
};
export type Skill = {
  title: Localized;
  description: Localized;
  tools: string[];
};
export type ProjectLink = {
  enabled?: boolean;
  type: "official" | "repository";
  url: string;
};
export type Project = {
  id: string;
  slug: string;
  title: Localized;
  shortDescription: Localized;
  description: Localized;
  role?: Localized;
  context: Localized;
  category: "Web" | "Mobile" | "SaaS" | "Institutionnel" | "Automatisation";
  technologies: string[];
  media: ProjectMedia[];
  links: ProjectLink[];
  featured: boolean;
  confidential: boolean;
  status?: Localized;
  sections: { title: Localized; body: Localized }[];
};
export type Publication = {
  title: string;
  slug: string;
  description: string;
  date: string | null;
  cover?: string;
  tags: string[];
  langue: Locale;
  readingTime: number;
  status: "draft" | "published";
  file: string;
};
export type Activity = {
  id: string;
  slug: string;
  title: Localized;
  type: Localized;
  description: Localized;
  role: Localized;
  date: string | null;
  location: Localized;
  status: "draft" | "published";
};
