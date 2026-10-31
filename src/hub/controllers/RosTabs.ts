// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// ROS inspection tabs built from the shared Log, so they work for Foxglove live data and MCAP recordings:
// - Raw Messages: latest message per topic as an expandable tree.
// - Log: /rosout with a severity filter.
// - Image: sensor_msgs/Image and CompressedImage.

import { parse } from "@foxglove/rosmsg";
import { MessageReader } from "@foxglove/rosmsg2-serialization";
import LoggableType from "../../shared/log/LoggableType";
import { getOrDefault } from "../../shared/log/LogUtil";
import { metadata } from "../../shared/spatial/SpatialLog";
import { createUUID } from "../../shared/util";
import TabController from "./TabController";

const HIDDEN_CHILDREN = ["/spatial", "/pose3d", "/poses3d", "/xml", "/error", "/length"];
const THROTTLE_MS = 400;

/** Topics are Log fields holding raw bytes with a ROS type name (`pkg/Type`). */
export function rosTopics(): string[] {
  return window.log
    .getFieldKeys()
    .filter(
      (key) => window.log.getType(key) === LoggableType.Raw && (window.log.getStructuredType(key) ?? "").includes("/")
    )
    .sort();
}

function cursor(): number {
  return window.selection.getRenderTime() ?? window.log.getTimestampRange()[1];
}

abstract class BaseRosTab implements TabController {
  UUID = createUUID();
  protected last = 0;
  constructor(protected root: HTMLElement) {
    root.style.cssText = "overflow:auto;font-size:13px;padding:6px 10px;box-sizing:border-box;height:100%";
  }
  abstract getActiveFields(): string[];
  protected abstract update(): void;
  saveState(): unknown {
    return null;
  }
  restoreState(_state: unknown): void {}
  refresh(): void {
    this.last = 0;
  }
  newAssets(): void {}
  showTimeline(): boolean {
    return true;
  }
  getCommand(): unknown {
    const now = Date.now();
    if (now - this.last >= THROTTLE_MS) {
      this.last = now;
      this.update();
    }
    return null;
  }
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    const shown = value.slice(0, 8).map((v) => (typeof v === "number" ? +v.toFixed(4) : String(v)));
    return "[" + shown.join(", ") + (value.length > 8 ? ", … (" + value.length + ")" : "") + "]";
  }
  if (typeof value === "number") return String(+value.toFixed(6));
  return String(value);
}

type TreeNode = { children: Map<string, TreeNode>; key?: string };

export class RawMessagesController extends BaseRosTab {
  private open = new Set<string>();

  getActiveFields(): string[] {
    return rosTopics();
  }

  protected update() {
    const time = cursor();
    const topics = rosTopics();
    if (topics.length === 0) {
      this.root.textContent = "No ROS topics. Connect to a Foxglove bridge or open an MCAP recording.";
      return;
    }
    const keys = window.log.getFieldKeys();
    this.root.replaceChildren(
      ...topics.map((topic) => {
        const details = document.createElement("details");
        details.open = this.open.has(topic);
        details.ontoggle = () => {
          if (details.open) this.open.add(topic);
          else this.open.delete(topic);
          this.last = 0;
        };
        const summary = document.createElement("summary");
        summary.textContent = topic;
        const type = document.createElement("span");
        type.style.opacity = "0.6";
        type.textContent = "  " + window.log.getStructuredType(topic);
        summary.append(type);
        details.append(summary);
        if (details.open) details.append(this.buildTree(topic, keys, time));
        return details;
      })
    );
  }

  private buildTree(topic: string, keys: string[], time: number): HTMLElement {
    const rootNode: TreeNode = { children: new Map() };
    const prefix = topic + "/";
    for (const key of keys) {
      if (!key.startsWith(prefix) || HIDDEN_CHILDREN.some((h) => key.endsWith(h))) continue;
      let node = rootNode;
      for (const part of key.slice(prefix.length).split("/")) {
        if (!node.children.has(part)) node.children.set(part, { children: new Map() });
        node = node.children.get(part)!;
      }
      node.key = key;
    }
    const container = document.createElement("div");
    container.style.cssText = "margin-left:14px;font-family:monospace;font-size:12px";
    if (rootNode.children.size === 0) {
      container.textContent = "(binary payload, no decoded fields)";
      return container;
    }
    const render = (node: TreeNode, path: string, parent: HTMLElement) => {
      const names = [...node.children.keys()];
      if (names.every((n) => /^\d+$/.test(n))) names.sort((a, b) => Number(a) - Number(b));
      else names.sort();
      for (const name of names) {
        const child = node.children.get(name)!;
        const childPath = path + "/" + name;
        if (child.children.size > 0) {
          const details = document.createElement("details");
          details.open = this.open.has(childPath);
          details.ontoggle = () => {
            if (details.open) this.open.add(childPath);
            else this.open.delete(childPath);
            this.last = 0;
          };
          const summary = document.createElement("summary");
          summary.textContent = name;
          details.append(summary);
          if (details.open) {
            const inner = document.createElement("div");
            inner.style.marginLeft = "14px";
            render(child, childPath, inner);
            details.append(inner);
          }
          parent.append(details);
        } else if (child.key) {
          const row = document.createElement("div");
          const type = window.log.getType(child.key);
          const value = type === null ? "" : getOrDefault(window.log, child.key, type, time, "—");
          row.textContent = name + ": " + formatValue(value);
          parent.append(row);
        }
      }
    };
    render(rootNode, topic, container);
    return container;
  }
}

const LEVELS: [string, number][] = [
  ["DEBUG", 10],
  ["INFO", 20],
  ["WARN", 30],
  ["ERROR", 40],
  ["FATAL", 50]
];
const LEVEL_COLORS: { [key: number]: string } = {
  10: "#888",
  20: "inherit",
  30: "#c98a00",
  40: "#d75b53",
  50: "#d75b53"
};

export class RosLogController extends BaseRosTab {
  private minLevel = 20;
  private bar = document.createElement("div");
  private list = document.createElement("div");

  constructor(root: HTMLElement) {
    super(root);
    const label = document.createElement("label");
    label.textContent = "Severity ≥ ";
    const select = document.createElement("select");
    LEVELS.forEach(([name, value]) => select.append(new Option(name, String(value))));
    select.value = String(this.minLevel);
    select.onchange = () => {
      this.minLevel = Number(select.value);
      this.last = 0;
    };
    label.append(select);
    this.bar.style.cssText = "margin-bottom:6px";
    this.bar.append(label);
    this.list.style.cssText = "font-family:monospace;font-size:12px;white-space:pre-wrap";
    root.append(this.bar, this.list);
  }

  getActiveFields(): string[] {
    return ["/rosout"];
  }

  saveState(): unknown {
    return { minLevel: this.minLevel };
  }
  restoreState(state: unknown): void {
    const level = (state as { minLevel?: number } | null)?.minLevel;
    if (level) this.minLevel = level;
  }

  protected update() {
    const time = cursor();
    const msgs = window.log.getString("/rosout/msg", -Infinity, time);
    if (!msgs || msgs.timestamps.length === 0) {
      this.list.textContent = "No /rosout messages.";
      return;
    }
    const names = window.log.getString("/rosout/name", -Infinity, time);
    const levelNum = window.log.getNumber("/rosout/level", -Infinity, time);
    const levelStr = window.log.getString("/rosout/level", -Infinity, time);
    const origin = window.log.getTimestampRange()[0];
    const rows: HTMLElement[] = [];
    for (let i = msgs.timestamps.length - 1; i >= 0 && rows.length < 500; i--) {
      const stamp = msgs.timestamps[i];
      if (stamp > time) continue;
      let level = levelNum?.values[levelNum.timestamps.indexOf(stamp)];
      if (level === undefined && levelStr) {
        const name = levelStr.values[levelStr.timestamps.indexOf(stamp)];
        level = LEVELS.find(([n]) => n === String(name).toUpperCase())?.[1];
      }
      level ??= 20;
      if (level < this.minLevel) continue;
      const row = document.createElement("div");
      row.style.color = LEVEL_COLORS[level] ?? "inherit";
      const levelName = LEVELS.find(([, v]) => v === level)?.[0] ?? String(level);
      const node = names?.values[names.timestamps.indexOf(stamp)] ?? "";
      row.textContent = `t+${(stamp - origin).toFixed(2)} ${levelName.padEnd(5)} [${node}] ${msgs.values[i]}`;
      row.title = "Stamp " + stamp.toFixed(6) + " s (epoch)";
      row.onclick = () => window.selection.setSelectedTime(stamp);
      row.style.cursor = "pointer";
      rows.push(row);
    }
    this.list.replaceChildren(...rows);
  }
}

export class RosImageController extends BaseRosTab {
  private topic = "";
  private select = document.createElement("select");
  private canvas = document.createElement("canvas");
  private info = document.createElement("div");
  private drawnStamp = NaN;
  private drawnTopic = "";
  private topicsSig = "";

  constructor(root: HTMLElement) {
    super(root);
    const bar = document.createElement("div");
    bar.style.cssText = "margin-bottom:6px";
    this.select.onchange = () => {
      this.topic = this.select.value;
      this.drawnStamp = NaN;
      this.last = 0;
    };
    bar.append("Topic ", this.select, this.info);
    this.info.style.cssText = "display:inline-block;margin-left:10px;opacity:0.7";
    this.canvas.style.cssText = "max-width:100%;image-rendering:auto;background:#000";
    root.append(bar, this.canvas);
  }

  private imageTopics(): string[] {
    return rosTopics().filter((key) =>
      ["sensor_msgs/Image", "sensor_msgs/CompressedImage"].includes(window.log.getStructuredType(key) ?? "")
    );
  }

  getActiveFields(): string[] {
    return this.imageTopics();
  }
  saveState(): unknown {
    return { topic: this.topic };
  }
  restoreState(state: unknown): void {
    this.topic = (state as { topic?: string } | null)?.topic ?? "";
  }

  protected update() {
    const topics = this.imageTopics();
    const sig = topics.join("|");
    if (sig !== this.topicsSig) {
      this.topicsSig = sig;
      this.select.replaceChildren(...topics.map((t) => new Option(t, t)));
      if (!topics.includes(this.topic)) this.topic = topics[0] ?? "";
      this.select.value = this.topic;
    }
    if (!this.topic) {
      this.info.textContent = "No image topics (sensor_msgs/Image or CompressedImage).";
      return;
    }
    const time = cursor();
    const raw = window.log.getRaw(this.topic, -Infinity, time);
    if (!raw || raw.timestamps.length === 0) {
      this.info.textContent = "waiting for image…";
      return;
    }
    let index = raw.timestamps.length - 1;
    while (index > 0 && raw.timestamps[index] > time) index--;
    const stamp = raw.timestamps[index];
    if (stamp === this.drawnStamp && this.topic === this.drawnTopic) return;
    this.drawnStamp = stamp;
    this.drawnTopic = this.topic;
    const meta = metadata(window.log, this.topic);
    this.draw(raw.values[index], meta, window.log.getStructuredType(this.topic) ?? "").then(
      (desc) => {
        this.info.textContent = `${desc} · t+${(stamp - window.log.getTimestampRange()[0]).toFixed(2)} s`;
      },
      (error) => {
        this.info.textContent = String(error);
      }
    );
  }

  private async draw(bytes: Uint8Array, meta: any, type: string): Promise<string> {
    if (meta.encoding !== "cdr") throw new Error("Unsupported message encoding " + meta.encoding);
    const msg: any = new MessageReader(parse(meta.definition, { ros2: true })).readMessage(bytes);
    const ctx = this.canvas.getContext("2d")!;
    if (type === "sensor_msgs/CompressedImage") {
      const bitmap = await createImageBitmap(new Blob([msg.data as Uint8Array]));
      this.canvas.width = bitmap.width;
      this.canvas.height = bitmap.height;
      ctx.drawImage(bitmap, 0, 0);
      return `${msg.format} ${bitmap.width}×${bitmap.height}`;
    }
    const { width, height, encoding, data } = msg as {
      width: number;
      height: number;
      encoding: string;
      data: Uint8Array;
    };
    const channels = encoding.startsWith("mono") ? 1 : encoding.includes("a8") ? 4 : 3;
    const image = ctx.createImageData(width, height);
    if (!/^(rgb8|bgr8|rgba8|bgra8|mono8)$/.test(encoding)) throw new Error("Unsupported image encoding " + encoding);
    const swap = encoding.startsWith("bgr");
    for (let i = 0; i < width * height; i++) {
      const o = i * channels;
      image.data[i * 4] = channels === 1 ? data[o] : data[o + (swap ? 2 : 0)];
      image.data[i * 4 + 1] = channels === 1 ? data[o] : data[o + 1];
      image.data[i * 4 + 2] = channels === 1 ? data[o] : data[o + (swap ? 0 : 2)];
      image.data[i * 4 + 3] = channels === 4 ? data[o + 3] : 255;
    }
    this.canvas.width = width;
    this.canvas.height = height;
    ctx.putImageData(image, 0, 0);
    return `${encoding} ${width}×${height}`;
  }
}
