export function includeEntry(entry: { status: "draft" | "published" }) {
  return entry.status === "published";
}
