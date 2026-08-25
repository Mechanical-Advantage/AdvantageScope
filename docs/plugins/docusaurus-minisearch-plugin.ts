// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import type { LoadContext, Plugin } from "@docusaurus/types";
import fs from "fs";
import path from "path";

export interface SearchDocument {
  id: string;
  pageTitle: string;
  sectionTitle: string;
  url: string;
  content: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanText(text: string): string {
  return (
    text
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, " ")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, " ")
      // Remove import / export statements (including multiline)
      .replace(/^\s*import\s+[\s\S]*?['"][^'"]+['"]\s*;?/gm, " ")
      .replace(/^\s*export\s+[\s\S]*?;?/gm, " ")
      // Remove self-closing JSX elements (like <DocCardList ... /> or <Button ... /> or <img ... />)
      .replace(/<[A-Za-z][A-Za-z0-9_]*[\s\S]*?\/>/g, " ")
      // Remove opening and closing JSX / HTML tags (like <Tabs>, </Tabs>, <TabItem>, </TabItem>, <div>, etc.)
      .replace(/<\/?[A-Za-z][A-Za-z0-9_]*(\s+[^>]*)?>/g, " ")
      // Remove markdown image syntax ![alt](url) -> keep alt text
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Remove markdown link syntax [text](url) -> keep text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // Remove admonitions (:::info, :::tip[Title], :::)
      .replace(/^:::[^\n]*$/gm, " ")
      // Remove horizontal rules
      .replace(/^(\*{3,}|-{3,}|_{3,})\s*$/gm, " ")
      // Remove blockquotes, list markers
      .replace(/^(\s*[-*+]\s+|\s*\d+\.\s+|>+\s*)/gm, " ")
      // Remove inline code ticks
      .replace(/`([^`]+)`/g, "$1")
      // Remove bold / italic / strikethrough markdown symbols
      .replace(/(\*\*|__|\*|_|~~)/g, "")
      // Collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

function parseMarkdownDoc(filePath: string, docsDir: string): SearchDocument[] {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const relativePath = path.relative(docsDir, filePath).replace(/\\/g, "/");

  // Determine route URL
  let routePath = "/" + relativePath.replace(/\.mdx?$/, "");
  if (routePath.endsWith("/index")) {
    routePath = routePath.slice(0, -"/index".length);
  }
  if (routePath === "") {
    routePath = "/";
  }

  // Parse frontmatter
  let body = fileContent;
  let pageTitle = "";
  const frontmatterMatch = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (frontmatterMatch) {
    const fmContent = frontmatterMatch[1];
    body = fileContent.slice(frontmatterMatch[0].length);

    const titleMatch = fmContent.match(/^title:\s*(.*)$/m);
    if (titleMatch) {
      pageTitle = titleMatch[1].trim().replace(/^["']|["']$/g, "");
    }
    const slugMatch = fmContent.match(/^slug:\s*(.*)$/m);
    if (slugMatch) {
      routePath = slugMatch[1].trim().replace(/^["']|["']$/g, "");
    }
  }

  // Remove top import/export statements before heading extraction
  body = body.replace(/^\s*import\s+[\s\S]*?['"][^'"]+['"]\s*;?/gm, " ");
  body = body.replace(/^\s*export\s+[\s\S]*?;?/gm, " ");

  // Fallback to first heading if title not in frontmatter
  if (!pageTitle) {
    const h1Match = body.match(/^#\s+(.+)$/m);
    if (h1Match) {
      pageTitle = cleanText(h1Match[1]);
    }
  }
  if (!pageTitle) {
    pageTitle = path.basename(filePath, path.extname(filePath));
    if (pageTitle === "index") {
      pageTitle = path.basename(path.dirname(filePath));
    }
    // Convert kebab-case to Title Case
    pageTitle = pageTitle
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  // Split by headings (##, ###, ####, or #)
  const lines = body.split("\n");
  const sections: { title: string; id: string; lines: string[] }[] = [];
  let currentSection = { title: pageTitle, id: "", lines: [] as string[] };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch && headingMatch[2].trim().length > 0) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      let rawHeading = headingMatch[2].trim();
      let explicitId = "";
      const explicitIdMatch = rawHeading.match(/\{#([^}]+)\}$/);
      if (explicitIdMatch) {
        explicitId = explicitIdMatch[1];
        rawHeading = rawHeading.replace(/\{#([^}]+)\}$/, "").trim();
      }
      const cleanHeading = cleanText(rawHeading);
      const headingId = explicitId || slugify(cleanHeading);
      currentSection = {
        title: cleanHeading || pageTitle,
        id: headingId,
        lines: []
      };
    } else {
      currentSection.lines.push(line);
    }
  }
  if (currentSection.lines.length > 0 || sections.length === 0) {
    sections.push(currentSection);
  }

  const docs: SearchDocument[] = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const content = cleanText(section.lines.join("\n"));
    if (!content && section.title === pageTitle && i > 0) continue;
    if (!content && !section.title) continue;

    const url = section.id ? `${routePath}#${section.id}` : routePath;
    docs.push({
      id: url,
      pageTitle,
      sectionTitle: section.title,
      url,
      content
    });
  }

  return docs;
}

function walkDir(dir: string): string[] {
  let files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      files.push(fullPath);
    }
  }
  return files;
}

export default function minisearchPlugin(context: LoadContext): Plugin<SearchDocument[]> {
  const docsDir = path.resolve(context.siteDir, "docs");

  return {
    name: "docusaurus-minisearch-plugin",

    async loadContent() {
      const files = walkDir(docsDir);
      const allDocs: SearchDocument[] = [];
      for (const file of files) {
        const docs = parseMarkdownDoc(file, docsDir);
        allDocs.push(...docs);
      }
      return allDocs;
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData({ documents: content });
    }
  };
}
