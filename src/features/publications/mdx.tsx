import { readFile } from "node:fs/promises";
import path from "node:path";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { Publication } from "@/types/content";
// Only checked-in, trusted MDX from the content registry. Never compile user input or remote MDX.
export async function ArticleBody({
  publication,
}: {
  publication: Publication;
}) {
  if (!/^[a-z0-9-]+\.(fr|en)\.mdx$/.test(publication.file)) {
    throw new Error("Invalid local publication filename");
  }
  const source = await readFile(
    path.join(process.cwd(), "src/content/publications", publication.file),
    "utf8",
  );
  const { default: Content } = await evaluate(source, { ...runtime });
  return (
    <div className="prose">
      <Content />
    </div>
  );
}
