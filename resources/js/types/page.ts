import type {
    Profile,
    Project,
    Publication,
    Activity,
    Experience,
    Education,
    Certification,
    Skill,
    Localized,
    Locale,
} from "./content";
export type JourneyNote = {
    label: Localized;
    title: Localized;
    description: Localized;
    current: boolean;
};
export type Portfolio = Profile & {
    hero_title: Localized;
    location_short: Localized;
    journeyNotes: JourneyNote[];
    professional_title: Localized;
    email: string;
    whatsapp: string;
    seo_title: Localized;
    seo_description: Localized;
};
export type Meta = {
    title: string;
    description: string;
    canonical: string;
    alternates: Record<string, string>;
    robots: string;
    image: string;
    jsonLd: unknown;
    switchUrl: string;
};
export type SharedProps = {
    copy: Record<string, string>;
    contactCopy: {
        name: string;
        email: string;
        subject: string;
        message: string;
        choose: string;
        send: string;
        sending: string;
        privacy: string;
        names: string[];
    };
    preview?: boolean;
    [key: string]: unknown;
    locale: Locale;
    adminCopy: Record<string, string>;
    authCopy: Record<string, string>;
    authFailure: string;
    notificationId: string;
    portfolio: Portfolio;
    ui: { nav: Record<string, string>; contact_success: string };
    meta?: Meta;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            is_admin: boolean;
        } | null;
    };
    flash: { success?: string; error?: string; info?: string };
    projects?: Project[];
    publications?: Publication[];
    activities?: Activity[];
    experiences?: Experience[];
    education?: Education[];
    certifications?: Certification[];
    skills?: Skill[];
};
export type Pagination<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};
