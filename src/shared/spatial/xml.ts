// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// A small, forgiving XML element parser for URDF. DOMParser is unavailable in workers and node tests, and
// URDF only needs elements and attributes: text content, CDATA, comments, processing instructions and
// doctypes are skipped. Entities in attribute values are decoded.

export interface XmlElement {
  name: string;
  attributes: { [name: string]: string };
  children: XmlElement[];
}

const ENTITIES: { [name: string]: string } = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-z]+);/g, (match, entity: string) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(parseInt(entity.slice(1), 10));
    return ENTITIES[entity] ?? match;
  });
}

/** Parses a document and returns its root element. Throws on unbalanced tags. */
export function parseXml(text: string): XmlElement {
  const root: XmlElement = { name: "#document", attributes: {}, children: [] };
  const stack: XmlElement[] = [root];
  let index = 0;
  while (index < text.length) {
    const open = text.indexOf("<", index);
    if (open === -1) break;
    if (text.startsWith("<!--", open)) {
      const end = text.indexOf("-->", open + 4);
      index = end === -1 ? text.length : end + 3;
      continue;
    }
    if (text.startsWith("<![CDATA[", open)) {
      const end = text.indexOf("]]>", open + 9);
      index = end === -1 ? text.length : end + 3;
      continue;
    }
    if (text.startsWith("<?", open) || text.startsWith("<!", open)) {
      const end = text.indexOf(">", open + 2);
      index = end === -1 ? text.length : end + 1;
      continue;
    }
    // Find the end of the tag, skipping ">" inside quoted attribute values
    let end = open + 1;
    let quote: string | null = null;
    while (end < text.length) {
      const char = text[end];
      if (quote !== null) {
        if (char === quote) quote = null;
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === ">") {
        break;
      }
      end++;
    }
    const tag = text.slice(open + 1, end);
    index = end + 1;
    if (tag.startsWith("/")) {
      const name = tag.slice(1).trim();
      const current = stack.pop();
      if (current === undefined || current.name !== name || stack.length === 0) {
        throw new Error("Unexpected closing tag </" + name + ">");
      }
      continue;
    }
    const selfClosing = tag.endsWith("/");
    const body = selfClosing ? tag.slice(0, -1) : tag;
    const nameMatch = /^\s*([^\s/>]+)/.exec(body);
    if (nameMatch === null) continue;
    const element: XmlElement = { name: nameMatch[1], attributes: {}, children: [] };
    const attributePattern = /([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    const attributeText = body.slice(nameMatch[0].length);
    let match: RegExpExecArray | null;
    while ((match = attributePattern.exec(attributeText)) !== null) {
      element.attributes[match[1]] = decodeEntities(match[3] ?? match[4] ?? "");
    }
    stack[stack.length - 1].children.push(element);
    if (!selfClosing) stack.push(element);
  }
  if (stack.length !== 1) throw new Error("Unclosed tag <" + stack[stack.length - 1].name + ">");
  const first = root.children[0];
  if (first === undefined) throw new Error("Empty XML document");
  return first;
}

export function childElements(element: XmlElement, name: string): XmlElement[] {
  return element.children.filter((child) => child.name === name);
}

export function childElement(element: XmlElement, name: string): XmlElement | null {
  return element.children.find((child) => child.name === name) ?? null;
}
