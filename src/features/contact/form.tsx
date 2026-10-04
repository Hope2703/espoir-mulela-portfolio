"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { Select } from "@/components/ui/select";
import type { Locale } from "@/types/content";
import { validateContact, subjects, type FieldErrors } from "./validation";
const copy = {
  fr: {
    name: "Nom",
    email: "Email",
    subject: "Sujet",
    message: "Message",
    choose: "Choisir un sujet",
    send: "Envoyer le message",
    sending: "Envoi en cours…",
    success:
      "Votre message a bien été envoyé. Merci pour votre prise de contact.",
    error:
      "Le message n’a pas pu être envoyé. Réessayez ou contactez-moi directement par email.",
    unconfigured:
      "L’envoi est indisponible pour le moment. Votre texte reste dans le formulaire. Vous pouvez me contacter par WhatsApp ou par email.",
    limited:
      "Trop de tentatives rapprochées. Réessayez plus tard ou utilisez le contact direct.",
    invalid: "Vérifiez les champs indiqués.",
    names: [
      "Opportunité professionnelle",
      "Collaboration",
      "Projet",
      "Conseil",
      "Partenariat",
      "Événement",
      "Autre",
    ],
    fields: {
      name: "Indiquez un nom de 2 à 100 caractères.",
      email: "Indiquez une adresse email valide.",
      subject: "Choisissez un sujet.",
      message: "Votre message doit contenir entre 20 et 5 000 caractères.",
    },
    privacy:
      "Les informations saisies servent uniquement à répondre à votre demande. Elles ne sont pas publiées sur le site.",
  },
  en: {
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    choose: "Choose a subject",
    send: "Send message",
    sending: "Sending…",
    success: "Your message has been sent. Thank you for getting in touch.",
    error:
      "The message could not be sent. Please try again or email me directly.",
    unconfigured:
      "Sending is currently unavailable. Your text remains in the form. You can contact me on WhatsApp or by email.",
    limited:
      "Too many recent attempts. Please try later or contact me directly.",
    invalid: "Please check the highlighted fields.",
    names: [
      "Professional opportunity",
      "Collaboration",
      "Project",
      "Consulting",
      "Partnership",
      "Event",
      "Other",
    ],
    fields: {
      name: "Enter a name between 2 and 100 characters.",
      email: "Enter a valid email address.",
      subject: "Choose a subject.",
      message: "Your message must contain between 20 and 5,000 characters.",
    },
    privacy:
      "Your details are only used to respond to your enquiry. They are not published on the website.",
  },
};
export function ContactForm({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [subject, setSubject] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({}),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const token = useRef("");
  const available = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  async function refresh() {
    try {
      const response = await fetch("/api/contact");
      const data = await response.json();
      token.current = data.token ?? "";
      available.current = data.available === true;
    } catch {
      token.current = "";
      available.current = false;
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setStatus("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const result = validateContact({ ...values, locale, token: token.current });
    setErrors(result.errors);
    if (!result.data) {
      setStatus(t.invalid);
      const first = Object.keys(result.errors)[0];
      form.current?.querySelector<HTMLElement>(`#${first}`)?.focus();
      return;
    }
    if (!available.current) {
      setStatus(t.unconfigured);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await response.json();
      if (response.ok && data.ok === true) {
        setStatus(t.success);
        form.current?.reset();
      } else {
        setErrors(data.errors ?? {});
        setStatus(
          response.status === 503
            ? t.unconfigured
            : response.status === 429
              ? t.limited
              : t.error,
        );
      }
    } catch {
      setStatus(t.error);
    } finally {
      setBusy(false);
      void refresh();
    }
  }
  return (
    <form
      ref={form}
      onSubmit={submit}
      onReset={() => setSubject("")}
      className="contact-form"
      noValidate
    >
      <div className="form-row">
        {(["name", "email"] as const).map((key) => (
          <div key={key}>
            <label htmlFor={key}>{t[key]}</label>
            <input
              id={key}
              name={key}
              type={key === "email" ? "email" : "text"}
              autoComplete={key === "email" ? "email" : "name"}
              required
              maxLength={key === "email" ? 254 : 100}
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `${key}-error` : undefined}
            />
            {errors[key] && (
              <p id={`${key}-error`} className="field-error">
                {t.fields[key]}
              </p>
            )}
          </div>
        ))}
      </div>
      <Select
        label={t.subject}
        id="subject"
        name="subject"
        required
        value={subject}
        onValueChange={setSubject}
        placeholder={t.choose}
        invalid={!!errors.subject}
        describedBy={errors.subject ? "subject-error" : undefined}
        options={subjects.map((value, i) => ({ value, label: t.names[i] }))}
      />
      {errors.subject && (
        <p id="subject-error" className="field-error">
          {t.fields.subject}
        </p>
      )}
      <label htmlFor="message">{t.message}</label>
      <textarea
        id="message"
        name="message"
        rows={7}
        required
        minLength={20}
        maxLength={5000}
        aria-invalid={!!errors.message}
        aria-describedby={errors.message ? "message-error" : "message-hint"}
      />
      <p id="message-hint" className="form-hint">
        20–5 000 {locale === "fr" ? "caractères" : "characters"}
      </p>
      {errors.message && (
        <p id="message-error" className="field-error">
          {t.fields.message}
        </p>
      )}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input name="website" id="website" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="form-hint">{t.privacy}</p>
      <button className="button" type="submit" disabled={busy}>
        {busy ? t.sending : t.send}
        {busy ? (
          <LoaderCircle size={18} className="spinner" />
        ) : (
          <ArrowUpRight size={18} />
        )}
      </button>
      <p role="status" className="form-status">
        {status}
      </p>
    </form>
  );
}
