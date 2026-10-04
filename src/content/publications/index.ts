import type { Publication, Locale } from "@/types/content";
import { includeEntry } from "@/lib/content-policy";

export const publicationEntries: Publication[] = [];
export const getPublications = (locale: Locale) =>
  publicationEntries.filter((p) => p.langue === locale && includeEntry(p));
