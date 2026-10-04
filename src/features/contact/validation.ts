export const subjects = [
  "opportunity",
  "collaboration",
  "project",
  "consulting",
  "partnership",
  "event",
  "other",
] as const;
export type ContactData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
  token: string;
  locale: string;
};
export type FieldErrors = Partial<
  Record<"name" | "email" | "subject" | "message", string>
>;
export function validateContact(value: unknown): {
  data?: ContactData;
  errors: FieldErrors;
} {
  const v = (value && typeof value === "object" ? value : {}) as Record<
    string,
    unknown
  >;
  const str = (k: string) =>
    typeof v[k] === "string" ? (v[k] as string).trim() : "";
  const data: ContactData = {
    name: str("name"),
    email: str("email"),
    subject: str("subject"),
    message: str("message"),
    website: str("website"),
    token: str("token"),
    locale: str("locale") === "en" ? "en" : "fr",
  };
  const errors: FieldErrors = {};
  if (
    data.name.length < 2 ||
    data.name.length > 100 ||
    /[\r\n]/.test(data.name)
  )
    errors.name = "name";
  if (
    data.email.length > 254 ||
    !/^\S+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
    /[\r\n]/.test(data.email)
  )
    errors.email = "email";
  if (!subjects.includes(data.subject as (typeof subjects)[number]))
    errors.subject = "subject";
  if (data.message.length < 20 || data.message.length > 5000)
    errors.message = "message";
  return Object.keys(errors).length ? { errors } : { data, errors };
}
