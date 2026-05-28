/**
 * Converts a Mermaid diagram string into a Graphviz DOT string.
 *
 * Supports `stateDiagram-v2` (primary) and `graph`/`flowchart` diagrams.
 * Fully resolves `classDef` / `class` styling into DOT attributes.
 *
 * @param widthPx The width of the graph in pixels.
 * @param heightPx The height of the graph in pixels.
 * @param mermaid - Raw Mermaid source text.
 * @param darkMode - Whether to use dark mode styling.
 * @returns A string containing the resulting Graphviz DOT graph.
 */
export function mermaidToDotGraph(widthPx: number, heightPx: number, mermaid: string, darkMode: boolean): string {
  const graph = parseMermaid(mermaid, darkMode);
  resolveNodeStyles(graph);

  const lines: string[] = [];
  const edgeOp = graph.directed ? "->" : "--";

  const widthInches = Math.max(1, widthPx) / 96.0;
  const heightInches = Math.max(1, heightPx) / 72.0;

  lines.push(`digraph G {`);
  lines.push(`  size="${widthInches},${heightInches}";`);
  lines.push(`  ratio="fill"; `)
  lines.push(`  rankdir="${graph.rankdir}";`);
  lines.push(`  bgcolor="transparent";`);
  const textColor = darkMode ? "white" : "black";
  lines.push(`  node [fontname="Helvetica", fontsize="100", fontcolor="${textColor}", color="${textColor}", penwidth=5.0];`);
  lines.push(`  edge [fontname="Helvetica", fontsize="60", fontcolor="${textColor}", color="${textColor}", penwidth=5.0];`);
  if (graph.isStateDiagram) {
    lines.push(`  nodesep="0.5";`);
    lines.push(`  ranksep="0.6";`);
  }
  lines.push("");

  const subgraphNodeIds = new Set(graph.subgraphs.flatMap((sg) => sg.nodeIds));

  for (const node of graph.nodes.values()) {
    if (subgraphNodeIds.has(node.id)) continue;
    const attrs: Record<string, string> = {
      label: node.label,
      ...shapeToGraphvizAttrs(node.shape, darkMode, node.stereotype),
      ...node.styleAttrs,
    };
    lines.push(`  ${node.id}${attrsToString(attrs)};`);
  }

  if (graph.nodes.size > 0) lines.push("");

  for (const sg of graph.subgraphs) {
    lines.push(`  subgraph ${sg.id} {`);
    lines.push(`    label=${dotQuote(sg.label)};`);
    lines.push(`    style="rounded";`);
    const subgraphColor = darkMode ? "gray70" : "gray50";
    lines.push(`    color="${subgraphColor}";`);
    lines.push(`    fontcolor="${subgraphColor}";`);
    if (sg.concurrent) {
      // Rank concurrent regions side-by-side
      lines.push(`    rankdir="LR";`);
    }
    for (const nodeId of sg.nodeIds) {
      const node = graph.nodes.get(nodeId);
      if (!node) continue;
      const attrs: Record<string, string> = {
        label: node.label,
        ...shapeToGraphvizAttrs(node.shape, darkMode, node.stereotype),
        ...node.styleAttrs,
      };
      lines.push(`    ${node.id}${attrsToString(attrs)};`);
    }
    lines.push("  }");
    lines.push("");
  }

  for (const edge of graph.edges) {
    const attrs: Record<string, string> = { ...edgeStyleToAttrs(edge.style) };
    if (edge.label) attrs.label = edge.label;
    lines.push(`  ${edge.from} ${edgeOp} ${edge.to}${attrsToString(attrs)};`);
  }

  lines.push("}");
  return lines.join("\n");
}

type GraphvizShape =
  | "box"
  | "ellipse"
  | "diamond"
  | "stadium"
  | "hexagon"
  | "circle"
  | "point"
  | "doublecircle"
  | "rectangle";

type EdgeStyle = "solid" | "dashed" | "bold";

/** Parsed representation of a Mermaid classDef rule. */
interface ClassDef {
  name: string;
  /** Raw CSS-like properties, e.g. { fill: "#ff0", stroke: "red", color: "#fff" } */
  properties: Record<string, string>;
}

/** A single node in the internal graph. */
interface Node {
  id: string;
  label: string;
  shape: GraphvizShape;
  /** Resolved DOT styling attributes from classDef, e.g. { fillcolor, style, fontcolor, … } */
  styleAttrs: Record<string, string>;
  /** For state diagrams: <<choice>>, <<fork>>, <<join>>, or undefined */
  stereotype?: string;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
  style: EdgeStyle;
}

interface Subgraph {
  id: string;
  label: string;
  nodeIds: string[];
  /** If true, the subgraph represents concurrent regions separated by -- */
  concurrent: boolean;
}

interface ParsedGraph {
  directed: boolean;
  rankdir: string;
  nodes: Map<string, Node>;
  edges: Edge[];
  subgraphs: Subgraph[];
  /** Map from class name → classDef */
  classDefs: Map<string, ClassDef>;
  /** Map from node id → list of class names applied */
  nodeClasses: Map<string, string[]>;
  /** Whether this came from stateDiagram-v2 */
  isStateDiagram: boolean;
}

interface ShapeMatch {
  label: string;
  shape: GraphvizShape;
}

/** Produce a safe DOT identifier. */
function sanitizeId(raw: string): string {
  // [*] is the Mermaid start/end pseudo-state — give it a stable name
  if (raw.trim() === "[*]") return "__start_end__";
  return raw.trim().replace(/[^a-zA-Z0-9_]/g, "_");
}

/** Wrap a string in DOT double-quotes, escaping internal quotes. */
function dotQuote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Render a record of DOT attributes as `[k="v", ...]`. */
function attrsToString(attrs: Record<string, string>): string {
  const parts = Object.entries(attrs).map(([k, v]) => `${k}=${dotQuote(v)}`);
  return parts.length > 0 ? ` [${parts.join(", ")}]` : "";
}

/**
 * Translates Mermaid classDef CSS-like properties into Graphviz node attributes.
 *
 * Mermaid CSS property  →  Graphviz attribute
 * ─────────────────────────────────────────────
 * fill                  →  fillcolor  (also forces style=filled)
 * stroke                →  color
 * stroke-width          →  penwidth
 * color                 →  fontcolor
 * font-size             →  fontsize
 * font-family           →  fontname
 * font-weight: bold     →  sets bold in fontname (best-effort)
 * stroke-dasharray      →  style=dashed
 * rx / border-radius    →  style=rounded (for box shapes)
 */
function cssPropertiesToDotAttrs(css: Record<string, string>): Record<string, string> {
  const dot: Record<string, string> = {};
  const styleFlags: string[] = [];

  for (const [prop, value] of Object.entries(css)) {
    switch (prop.toLowerCase().trim()) {
      case "fill":
        if (value !== "none") {
          dot["fillcolor"] = value;
          styleFlags.push("filled");
        }
        break;
      case "stroke":
        dot["color"] = value;
        break;
      case "stroke-width":
        // strip units (px, pt, etc.)
        dot["penwidth"] = value.replace(/[^0-9.]/g, "") || "1";
        break;
      case "color":
        dot["fontcolor"] = value;
        break;
      case "font-size":
        dot["fontsize"] = value.replace(/[^0-9.]/g, "") || "12";
        break;
      case "font-family":
        dot["fontname"] = value.replace(/['"]/g, "");
        break;
      case "font-weight":
        if (value === "bold") {
          // Graphviz doesn't have a weight attribute; we note it but can't
          // reliably change just the weight without changing the family.
          dot["fontname"] = dot["fontname"]
            ? dot["fontname"] + "-Bold"
            : "Helvetica-Bold";
        }
        break;
      case "stroke-dasharray":
        styleFlags.push("dashed");
        break;
      case "rx":
      case "border-radius":
        styleFlags.push("rounded");
        break;
      // Silently ignore unknown properties
    }
  }

  if (styleFlags.length > 0) {
    dot["style"] = [...new Set(styleFlags)].join(",");
  }

  return dot;
}

/**
 * Parses a Mermaid classDef property string into a CSS property map.
 *
 * Input examples:
 *   "fill:#f9f,stroke:#333,stroke-width:4px"
 *   "fill: #bbf, color: white"
 */
function parseClassDefProperties(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of raw.split(",")) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) continue;
    const key = part.slice(0, colonIdx).trim();
    const val = part.slice(colonIdx + 1).trim();
    if (key) result[key] = val;
  }
  return result;
}

function parseNodeShape(raw: string): ShapeMatch | null {
  const t = raw.trim();

  const circleMatch = t.match(/^\(\((.+)\)\)$/);
  if (circleMatch) return { label: circleMatch[1].trim(), shape: "circle" };

  const stadiumMatch = t.match(/^\(\[(.+)\]\)$/);
  if (stadiumMatch) return { label: stadiumMatch[1].trim(), shape: "stadium" };

  const roundedMatch = t.match(/^\((.+)\)$/);
  if (roundedMatch) return { label: roundedMatch[1].trim(), shape: "ellipse" };

  const hexMatch = t.match(/^\{\{(.+)\}\}$/);
  if (hexMatch) return { label: hexMatch[1].trim(), shape: "hexagon" };

  const diamondMatch = t.match(/^\{(.+)\}$/);
  if (diamondMatch) return { label: diamondMatch[1].trim(), shape: "diamond" };

  const boxMatch = t.match(/^\[(.+)\]$/);
  if (boxMatch) return { label: boxMatch[1].trim(), shape: "box" };

  const asymMatch = t.match(/^>(.+)\]$/);
  if (asymMatch) return { label: asymMatch[1].trim(), shape: "box" };

  return null;
}

interface EdgeMatch {
  style: EdgeStyle;
  label?: string;
}

function parseEdgeConnector(connector: string): EdgeMatch {
  let style: EdgeStyle = "solid";

  const inlineLabelMatch = connector.match(/\|([^|]+)\|/);
  const label = inlineLabelMatch?.[1]?.trim();
  if (inlineLabelMatch) connector = connector.replace(/\|[^|]+\|/, "");

  if (/={2,}/.test(connector)) style = "bold";
  else if (/\./.test(connector)) style = "dashed";

  return { style, label };
}

function parseStateDiagram(lines: string[], darkMode: boolean): ParsedGraph {
  const result: ParsedGraph = {
    directed: true,
    rankdir: "TB",
    nodes: new Map(),
    edges: [],
    subgraphs: [],
    classDefs: new Map(),
    nodeClasses: new Map(),
    isStateDiagram: true,
  };

  // Pseudo-node for [*] — may act as both initial AND final depending on context.
  // We use separate __initial__ and __final__ nodes and resolve during edge parsing.
  let startNodeUsed = false;
  let endNodeUsed = false;

  const ensureInitial = () => {
    if (!result.nodes.has("__initial__")) {
      result.nodes.set("__initial__", {
        id: "__initial__",
        label: "",
        shape: "point",
        styleAttrs: {},
      });
    }
  };

  const ensureFinal = () => {
    if (!result.nodes.has("__final__")) {
      result.nodes.set("__final__", {
        id: "__final__",
        label: "",
        shape: "doublecircle",
        styleAttrs: {},
      });
    }
  };

  const getOrCreateState = (rawId: string, label?: string): Node => {
    if (rawId === "[*]") {
      // Will be resolved at edge-parse time; return a placeholder
      return { id: "[*]", label: "", shape: "point", styleAttrs: {} };
    }
    const id = sanitizeId(rawId);
    if (!result.nodes.has(id)) {
      result.nodes.set(id, {
        id,
        label: label ?? rawId.trim(),
        shape: "box",
        styleAttrs: {},
      });
    } else if (label !== undefined) {
      result.nodes.get(id)!.label = label;
    }
    return result.nodes.get(id)!;
  };

  // Subgraph / composite state stack
  const subgraphStack: Subgraph[] = [];
  let subgraphCounter = 0;

  // We need two passes:
  //   Pass 1 — collect classDefs and state declarations (so classes are known before edges)
  //   Pass 2 — parse transitions and structure

  // ── Pass 1: classDef ──────────────────────────────────────────────────────
  for (const line of lines) {
    const classDefMatch = line.match(/^classDef\s+(\S+)\s+(.+)$/);
    if (classDefMatch) {
      const name = classDefMatch[1];
      const properties = parseClassDefProperties(classDefMatch[2]);
      result.classDefs.set(name, { name, properties });
      continue;
    }

    // class NodeA,NodeB classname
    const classApplyMatch = line.match(/^class\s+(.+?)\s+(\S+)$/);
    if (classApplyMatch) {
      const nodeList = classApplyMatch[1].split(",").map((s) => s.trim());
      const className = classApplyMatch[2];
      for (const rawId of nodeList) {
        const id = sanitizeId(rawId);
        if (!result.nodeClasses.has(id)) result.nodeClasses.set(id, []);
        result.nodeClasses.get(id)!.push(className);
      }
    }
  }

  // ── Pass 2: structure ─────────────────────────────────────────────────────
  let i = 0;
  // track how many [*] targets we've seen per source to decide initial vs final
  const starOutCount = new Map<string, number>(); // edges FROM a node TO [*]
  const starInCount = new Map<string, number>();  // edges FROM [*] TO a node

  // Collect all [*] transitions first for resolution
  interface RawStarEdge {
    fromRaw: string;
    toRaw: string;
    label?: string;
  }
  const rawEdges: RawStarEdge[] = [];

  while (i < lines.length) {
    const line = lines[i];
    i++;

    // Skip header, classDef, class (already handled)
    if (
      /^stateDiagram(-v2)?/i.test(line) ||
      /^classDef\b/.test(line) ||
      /^class\b/.test(line)
    ) continue;

    // ── note block ──────────────────────────────────────────────────────────
    const noteFillColor = darkMode ? "#444400" : "lightyellow";
    const noteFontColor = darkMode ? "white" : "black";
    if (/^note\s+(left|right)\s+of\s+/i.test(line)) {
      const noteMatch = line.match(/^note\s+(?:left|right)\s+of\s+(\S+)/i);
      const targetId = noteMatch ? sanitizeId(noteMatch[1]) : null;
      const noteLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== "end note") {
        noteLines.push(lines[i].trim());
        i++;
      }
      i++; // consume "end note"
      if (targetId) {
        const noteId = `__note_${subgraphCounter++}__`;
        const noteText = noteLines.join("\\n");
        result.nodes.set(noteId, {
          id: noteId,
          label: noteText,
          shape: "rectangle",
          styleAttrs: { shape: "note", fillcolor: noteFillColor, fontcolor: noteFontColor, style: "filled" },
        });
        result.edges.push({ from: targetId, to: noteId, style: "dashed" });
      }
      continue;
    }

    // ── composite state: state "Label" as Id { ──────────────────────────────
    // or:  state Id {
    const compositeMatch =
      line.match(/^state\s+"([^"]+)"\s+as\s+(\S+)\s*\{?\s*$/) ||
      line.match(/^state\s+(\S+)\s*\{\s*$/);

    if (compositeMatch) {
      const isLabeledForm = line.includes('" as ');
      const label = isLabeledForm ? compositeMatch[1] : compositeMatch[1];
      const id = isLabeledForm ? sanitizeId(compositeMatch[2]) : sanitizeId(compositeMatch[1]);

      getOrCreateState(id, label);
      const sg: Subgraph = {
        id: `cluster_${id}_${subgraphCounter++}`,
        label,
        nodeIds: [],
        concurrent: false,
      };
      subgraphStack.push(sg);
      result.subgraphs.push(sg);
      continue;
    }

    // ── stereotype: state Id <<choice>> / <<fork>> / <<join>> ───────────────
    const stereoMatch = line.match(/^state\s+(\S+)\s+<<(\w+)>>/);
    if (stereoMatch) {
      const id = sanitizeId(stereoMatch[1]);
      const stereotype = stereoMatch[2].toLowerCase();
      const node = getOrCreateState(stereoMatch[1]);
      node.stereotype = stereotype;
      // choice → diamond, fork/join → rectangle (bar-like)
      if (stereotype === "choice") node.shape = "diamond";
      else if (stereotype === "fork" || stereotype === "join") node.shape = "rectangle";
      continue;
    }

    // State label declaration: state "Label" as Id
    const stateLabelMatch = line.match(/^state\s+"([^"]+)"\s+as\s+(\S+)\s*$/);
    if (stateLabelMatch) {
      getOrCreateState(stateLabelMatch[2], stateLabelMatch[1]);
      continue;
    }

    if (line === "}") {
      subgraphStack.pop();
      continue;
    }

    if (line === "--") {
      if (subgraphStack.length > 0) subgraphStack[subgraphStack.length - 1].concurrent = true;
      continue;
    }

    // Inline state label; must not match a transition line (which contains -->)
    if (!line.includes("-->")) {
      const labelDeclMatch = line.match(/^(\S+)\s*:\s*(.+)$/);
      if (labelDeclMatch) {
        getOrCreateState(labelDeclMatch[1], labelDeclMatch[2].trim());
        if (subgraphStack.length > 0) {
          const sg = subgraphStack[subgraphStack.length - 1];
          const id = sanitizeId(labelDeclMatch[1]);
          if (!sg.nodeIds.includes(id)) sg.nodeIds.push(id);
        }
        continue;
      }
    }

    // ── transition: A --> B  /  A --> B : label
    const transMatch = line.match(/^(\S+)\s*-->\s*(\S+)(?:\s*:\s*(.+))?$/);
    if (transMatch) {
      const [, fromRaw, toRaw, edgeLabel] = transMatch;
      rawEdges.push({ fromRaw, toRaw, label: edgeLabel?.trim() });

      // Register non-[*] nodes
      if (fromRaw !== "[*]") {
        getOrCreateState(fromRaw);
        if (subgraphStack.length > 0) {
          const sg = subgraphStack[subgraphStack.length - 1];
          const id = sanitizeId(fromRaw);
          if (!sg.nodeIds.includes(id)) sg.nodeIds.push(id);
        }
      } else {
        const id = sanitizeId(toRaw);
        starInCount.set(id, (starInCount.get(id) ?? 0) + 1);
      }
      if (toRaw !== "[*]") {
        getOrCreateState(toRaw);
        if (subgraphStack.length > 0) {
          const sg = subgraphStack[subgraphStack.length - 1];
          const id = sanitizeId(toRaw);
          if (!sg.nodeIds.includes(id)) sg.nodeIds.push(id);
        }
      } else {
        const id = sanitizeId(fromRaw);
        starOutCount.set(id, (starOutCount.get(id) ?? 0) + 1);
      }
      continue;
    }

    // ── bare state declaration (no label, no transition) ──────────────────────
    const bareStateMatch = line.match(/^(\S+)\s*$/);
    if (bareStateMatch && bareStateMatch[1] !== "[*]" && bareStateMatch[1] !== "}" ) {
      getOrCreateState(bareStateMatch[1]);
      if (subgraphStack.length > 0) {
        const sg = subgraphStack[subgraphStack.length - 1];
        const id = sanitizeId(bareStateMatch[1]);
        if (!sg.nodeIds.includes(id)) sg.nodeIds.push(id);
      }
    }
  }

  // ── Resolve [*] edges ─────────────────────────────────────────────────────
  // Heuristic: [*] --> X  means initial transition (first occurrence per target)
  //            X --> [*]  means final transition
  const initialSeen = new Set<string>();

  for (const { fromRaw, toRaw, label } of rawEdges) {
    let fromId: string;
    let toId: string;

    if (fromRaw === "[*]") {
      const targetId = sanitizeId(toRaw);
      if (!initialSeen.has(targetId)) {
        ensureInitial();
        fromId = "__initial__";
        initialSeen.add(targetId);
        startNodeUsed = true;
      } else {
        // Second [*]→X transition in same diagram is unusual; treat as initial too
        fromId = "__initial__";
      }
      toId = targetId;
    } else if (toRaw === "[*]") {
      ensureFinal();
      fromId = sanitizeId(fromRaw);
      toId = "__final__";
      endNodeUsed = true;
    } else {
      fromId = sanitizeId(fromRaw);
      toId = sanitizeId(toRaw);
    }

    result.edges.push({ from: fromId, to: toId, label, style: "solid" });
  }

  return result;
}

function parseFlowchart(lines: string[], darkMode: boolean): ParsedGraph {
  const result: ParsedGraph = {
    directed: true,
    rankdir: "TB",
    nodes: new Map(),
    edges: [],
    subgraphs: [],
    classDefs: new Map(),
    nodeClasses: new Map(),
    isStateDiagram: false,
  };

  const headerLine = lines[0] ?? "";
  const headerMatch = headerLine.match(/^(graph|flowchart)\s+(\w+)/i);
  if (headerMatch) {
    const dirMap: Record<string, string> = { LR: "LR", RL: "RL", TD: "TB", TB: "TB", BT: "BT" };
    result.rankdir = dirMap[headerMatch[2].toUpperCase()] ?? "TB";
  }

  const getOrCreateNode = (rawId: string, label?: string, shape?: GraphvizShape): Node => {
    const id = sanitizeId(rawId);
    if (!result.nodes.has(id)) {
      result.nodes.set(id, { id, label: label ?? rawId.trim(), shape: shape ?? "box", styleAttrs: {} });
    } else if (label !== undefined) {
      const n = result.nodes.get(id)!;
      n.label = label;
      n.shape = shape ?? n.shape;
    }
    return result.nodes.get(id)!;
  };

  const subgraphStack: Subgraph[] = [];
  let subgraphCounter = 0;

  // Pass 1: classDef + class
  for (const line of lines) {
    const classDefMatch = line.match(/^classDef\s+(\S+)\s+(.+)$/);
    if (classDefMatch) {
      result.classDefs.set(classDefMatch[1], {
        name: classDefMatch[1],
        properties: parseClassDefProperties(classDefMatch[2]),
      });
      continue;
    }
    const classApplyMatch = line.match(/^class\s+(.+?)\s+(\S+)$/);
    if (classApplyMatch) {
      const nodeList = classApplyMatch[1].split(",").map((s) => s.trim());
      const className = classApplyMatch[2];
      for (const rawId of nodeList) {
        const id = sanitizeId(rawId);
        if (!result.nodeClasses.has(id)) result.nodeClasses.set(id, []);
        result.nodeClasses.get(id)!.push(className);
      }
    }
  }

  // Pass 2: structure
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    if (/^subgraph\b/.test(line)) {
      const sgMatch = line.match(/^subgraph\s+(.*)/);
      const rawLabel = sgMatch?.[1]?.trim() ?? `subgraph_${subgraphCounter}`;
      const sg: Subgraph = {
        id: `cluster_${sanitizeId(rawLabel)}_${subgraphCounter++}`,
        label: rawLabel,
        nodeIds: [],
        concurrent: false,
      };
      subgraphStack.push(sg);
      result.subgraphs.push(sg);
      continue;
    }

    if (line === "end") { subgraphStack.pop(); continue; }
    if (/^(classDef|class|style|linkStyle)\b/.test(line)) continue;

    const edgeRegex = /^(.+?)\s*(--[->.\s=|]*(?:\|[^|]*\|)?[->.\s=]*|-\.-[->]?|={2,}>?)\s*(.+)$/;
    const edgeMatch = line.match(edgeRegex);
    if (edgeMatch) {
      let [, fromRaw, connector, toRaw] = edgeMatch;
      let edgeLabel: string | undefined;

      const midLabelMatch = connector.match(/^--\s+(.+?)\s+--[->]$/);
      if (midLabelMatch) { edgeLabel = midLabelMatch[1].trim(); connector = "-->"; }

      const connInfo = parseEdgeConnector(connector);
      if (!edgeLabel) edgeLabel = connInfo.label;

      const fromNodeMatch = fromRaw.trim().match(/^([^\s[\](){}>]+)\s*([\[({>].+[\])}])?$/);
      const fromId = fromNodeMatch?.[1] ?? fromRaw.trim();
      const fromShape = fromNodeMatch?.[2] ? parseNodeShape(fromNodeMatch[2]) : null;
      getOrCreateNode(fromId, fromShape?.label, fromShape?.shape);

      const toNodeMatch = toRaw.trim().match(/^([^\s[\](){}>]+)\s*([\[({>].+[\])}])?$/);
      const toId = toNodeMatch?.[1] ?? toRaw.trim();
      const toShape = toNodeMatch?.[2] ? parseNodeShape(toNodeMatch[2]) : null;
      getOrCreateNode(toId, toShape?.label, toShape?.shape);

      result.edges.push({ from: sanitizeId(fromId), to: sanitizeId(toId), label: edgeLabel, style: connInfo.style });

      if (subgraphStack.length > 0) {
        const sg = subgraphStack[subgraphStack.length - 1];
        [fromId, toId].forEach((id) => {
          const sid = sanitizeId(id);
          if (!sg.nodeIds.includes(sid)) sg.nodeIds.push(sid);
        });
      }
      continue;
    }

    const standaloneMatch = line.match(/^([^\s[\](){}>]+)\s*([\[({>].+[\])}])$/);
    if (standaloneMatch) {
      const shapeMatch = parseNodeShape(standaloneMatch[2]);
      getOrCreateNode(standaloneMatch[1], shapeMatch?.label, shapeMatch?.shape);
      if (subgraphStack.length > 0) {
        const sg = subgraphStack[subgraphStack.length - 1];
        const id = sanitizeId(standaloneMatch[1]);
        if (!sg.nodeIds.includes(id)) sg.nodeIds.push(id);
      }
    }
  }

  return result;
}

function parseMermaid(mermaid: string, darkMode: boolean): ParsedGraph {
  const lines = mermaid
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("%%"));

  const header = lines[0]?.toLowerCase() ?? "";
  if (header.startsWith("statediagram")) {
    return parseStateDiagram(lines, darkMode);
  }
  return parseFlowchart(lines, darkMode);
}

function resolveNodeStyles(graph: ParsedGraph): void {
  for (const [nodeId, classNames] of graph.nodeClasses) {
    const node = graph.nodes.get(nodeId);
    if (!node) continue;

    const merged: Record<string, string> = {};
    for (const className of classNames) {
      const classDef = graph.classDefs.get(className);
      if (!classDef) continue;
      const dotAttrs = cssPropertiesToDotAttrs(classDef.properties);
      Object.assign(merged, dotAttrs);
    }
    // Merge into existing styleAttrs (node's own attrs take higher precedence if already set)
    node.styleAttrs = { ...merged, ...node.styleAttrs };
  }
}

function shapeToGraphvizAttrs(shape: GraphvizShape, darkMode: boolean, stereotype?: string): Record<string, string> {
  const fillcolor = darkMode ? "white" : "black";
  if (stereotype === "choice")  return { shape: "diamond" };
  if (stereotype === "fork" || stereotype === "join") {
    return { shape: "rectangle", style: "filled", fillcolor: fillcolor, width: "1.5", height: "0.2", label: "" };
  }

  switch (shape) {
    case "point":        return { shape: "point", width: "0.25", height: "0.25", fillcolor: fillcolor, style: "filled", label: "" };
    case "doublecircle": return { shape: "doublecircle", width: "0.4", height: "0.4", fillcolor: fillcolor, style: "filled", label: "" };
    case "ellipse":      return { shape: "ellipse" };
    case "circle":       return { shape: "circle" };
    case "diamond":      return { shape: "diamond" };
    case "stadium":      return { shape: "box", style: "rounded" };
    case "hexagon":      return { shape: "hexagon" };
    case "rectangle":    return { shape: "rectangle" };
    case "box":
    default:             return { shape: "box", style: "rounded" }; // states look better rounded
  }
}

function edgeStyleToAttrs(style: EdgeStyle): Record<string, string> {
  switch (style) {
    case "dashed": return { style: "dashed" };
    case "bold":   return { style: "bold", penwidth: "2.5" };
    default:       return {};
  }
}
