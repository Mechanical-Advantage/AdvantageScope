// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// URDF model and forward kinematics. Joints and origins come from the URDF itself (no hand-tuned component
// JSON). Joint positions come from JointState, else the default (0, clamped to the limits); any link whose
// frame is available from TF takes the TF pose instead, so wheel frames published on /tf just work.

import { Transform, compose, identity, invert, quatFromAxisAngle, quatFromRPY } from "./Transform";
import { XmlElement, childElement, childElements, parseXml } from "./xml";

export type URDFGeometry =
  | { type: "box"; size: [number, number, number] }
  | { type: "cylinder"; radius: number; length: number }
  | { type: "sphere"; radius: number }
  | { type: "mesh"; filename: string; scale: [number, number, number] };

export interface URDFMaterial {
  name: string;
  /** RGBA, 0–1 */
  color: [number, number, number, number] | null;
  texture: string | null;
}

export interface URDFVisual {
  origin: Transform;
  geometry: URDFGeometry;
  material: URDFMaterial | null;
}

export interface URDFLink {
  name: string;
  visuals: URDFVisual[];
}

export type URDFJointType = "fixed" | "revolute" | "continuous" | "prismatic" | "floating" | "planar";

export interface URDFJoint {
  name: string;
  type: URDFJointType;
  parent: string;
  child: string;
  origin: Transform;
  axis: [number, number, number];
  limit: { lower: number; upper: number } | null;
  mimic: { joint: string; multiplier: number; offset: number } | null;
}

export interface URDFRobot {
  name: string;
  links: URDFLink[];
  joints: URDFJoint[];
  rootLink: string;
}

function parseNumbers(value: string | undefined, count: number, fallback: number): number[] {
  const parts = (value ?? "")
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .map(Number);
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    result.push(i < parts.length && isFinite(parts[i]) ? parts[i] : fallback);
  }
  return result;
}

function parseOrigin(element: XmlElement | null): Transform {
  if (element === null) return identity();
  const xyz = parseNumbers(element.attributes.xyz, 3, 0);
  const rpy = parseNumbers(element.attributes.rpy, 3, 0);
  return { translation: [xyz[0], xyz[1], xyz[2]], rotation: quatFromRPY(rpy[0], rpy[1], rpy[2]) };
}

function parseMaterial(element: XmlElement | null, named: Map<string, URDFMaterial>): URDFMaterial | null {
  if (element === null) return null;
  const name = element.attributes.name ?? "";
  const colorElement = childElement(element, "color");
  const textureElement = childElement(element, "texture");
  if (colorElement === null && textureElement === null) {
    return named.get(name) ?? (name.length > 0 ? { name: name, color: null, texture: null } : null);
  }
  const rgba = colorElement === null ? null : parseNumbers(colorElement.attributes.rgba, 4, 1);
  return {
    name: name,
    color: rgba === null ? null : [rgba[0], rgba[1], rgba[2], rgba[3]],
    texture: textureElement?.attributes.filename ?? null
  };
}

function parseGeometry(element: XmlElement | null): URDFGeometry | null {
  if (element === null) return null;
  for (const shape of element.children) {
    switch (shape.name) {
      case "box": {
        const size = parseNumbers(shape.attributes.size, 3, 0);
        return { type: "box", size: [size[0], size[1], size[2]] };
      }
      case "cylinder":
        return {
          type: "cylinder",
          radius: Number(shape.attributes.radius ?? 0),
          length: Number(shape.attributes.length ?? 0)
        };
      case "sphere":
        return { type: "sphere", radius: Number(shape.attributes.radius ?? 0) };
      case "mesh": {
        const filename = shape.attributes.filename;
        if (filename === undefined) return null;
        const scale = parseNumbers(shape.attributes.scale, 3, 1);
        return { type: "mesh", filename: filename, scale: [scale[0], scale[1], scale[2]] };
      }
    }
  }
  return null;
}

const JOINT_TYPES: URDFJointType[] = ["fixed", "revolute", "continuous", "prismatic", "floating", "planar"];

/** Parses URDF XML. Throws if the document is not a <robot> or has no links. */
export function parseURDF(text: string): URDFRobot {
  const root = parseXml(text);
  if (root.name !== "robot") throw new Error("Not a URDF: root element is <" + root.name + ">");

  const namedMaterials = new Map<string, URDFMaterial>();
  childElements(root, "material").forEach((element) => {
    const material = parseMaterial(element, namedMaterials);
    if (material !== null && material.name.length > 0) namedMaterials.set(material.name, material);
  });

  const links: URDFLink[] = childElements(root, "link").map((element) => ({
    name: element.attributes.name ?? "",
    visuals: childElements(element, "visual").flatMap((visual) => {
      const geometry = parseGeometry(childElement(visual, "geometry"));
      if (geometry === null) return [];
      return [
        {
          origin: parseOrigin(childElement(visual, "origin")),
          geometry: geometry,
          material: parseMaterial(childElement(visual, "material"), namedMaterials)
        }
      ];
    })
  }));
  if (links.length === 0) throw new Error("URDF has no links");

  const joints: URDFJoint[] = childElements(root, "joint").flatMap((element) => {
    const parent = childElement(element, "parent")?.attributes.link;
    const child = childElement(element, "child")?.attributes.link;
    if (parent === undefined || child === undefined) return [];
    const type = (JOINT_TYPES as string[]).includes(element.attributes.type)
      ? (element.attributes.type as URDFJointType)
      : "fixed";
    const axisValues = parseNumbers(childElement(element, "axis")?.attributes.xyz ?? "1 0 0", 3, 0);
    const limitElement = childElement(element, "limit");
    const mimicElement = childElement(element, "mimic");
    return [
      {
        name: element.attributes.name ?? parent + "_to_" + child,
        type: type,
        parent: parent,
        child: child,
        origin: parseOrigin(childElement(element, "origin")),
        axis: [axisValues[0], axisValues[1], axisValues[2]],
        limit:
          limitElement === null || type === "continuous"
            ? null
            : {
                lower: Number(limitElement.attributes.lower ?? 0),
                upper: Number(limitElement.attributes.upper ?? 0)
              },
        mimic:
          mimicElement === null || mimicElement.attributes.joint === undefined
            ? null
            : {
                joint: mimicElement.attributes.joint,
                multiplier: Number(mimicElement.attributes.multiplier ?? 1),
                offset: Number(mimicElement.attributes.offset ?? 0)
              }
      }
    ];
  });

  const names = new Set(links.map((link) => link.name));
  if (names.size !== links.length || names.has("")) throw new Error("URDF link names must be unique and nonempty");
  const children = new Set<string>();
  const jointNames = new Set<string>();
  for (const joint of joints) {
    if (!names.has(joint.parent) || !names.has(joint.child)) throw new Error("Unknown joint link: " + joint.name);
    if (children.has(joint.child)) throw new Error("Multiple parents for link: " + joint.child);
    if (jointNames.has(joint.name)) throw new Error("Duplicate joint: " + joint.name);
    children.add(joint.child);
    jointNames.add(joint.name);
  }
  const roots = links.filter((link) => !children.has(link.name));
  if (roots.length !== 1) throw new Error("URDF must have one root link");
  const rootLink = roots[0].name;
  const reachable = new Set([rootLink]);
  for (let i = 0; i < links.length; i++) {
    joints.forEach((joint) => {
      if (reachable.has(joint.parent)) reachable.add(joint.child);
    });
  }
  if (reachable.size !== links.length) throw new Error("URDF contains a disconnected cycle");
  return { name: root.attributes.name ?? "robot", links: links, joints: joints, rootLink: rootLink };
}

/** Transform of a joint's child link in its parent link for a joint position (rad or m). */
export function jointTransform(joint: URDFJoint, position: number): Transform {
  switch (joint.type) {
    case "revolute":
    case "continuous":
      return compose(joint.origin, { translation: [0, 0, 0], rotation: quatFromAxisAngle(joint.axis, position) });
    case "prismatic": {
      const norm = Math.hypot(...joint.axis) || 1;
      return compose(joint.origin, {
        translation: [
          (joint.axis[0] / norm) * position,
          (joint.axis[1] / norm) * position,
          (joint.axis[2] / norm) * position
        ],
        rotation: [1, 0, 0, 0]
      });
    }
    default:
      return joint.origin;
  }
}

/** Default position: 0, clamped into the limits. */
export function defaultJointPosition(joint: URDFJoint): number {
  if (joint.limit === null) return 0;
  const lower = Math.min(joint.limit.lower, joint.limit.upper);
  const upper = Math.max(joint.limit.lower, joint.limit.upper);
  return Math.min(Math.max(0, lower), upper);
}

export type JointSource = "joint_state" | "mimic" | "default" | "tf";

export interface URDFPoseResult {
  /** Pose of every link in the output frame. */
  links: { [link: string]: Transform };
  /** Where each movable joint's position came from. */
  jointSources: { [joint: string]: JointSource };
  /** The link whose pose anchored the robot (rootPose or a TF-resolved link), or null if none did. */
  anchor: string | null;
}

/**
 * Computes link poses.
 * @param jointPositions positions by joint name (JointState)
 * @param rootPose pose of the root link, if known from a pose source
 * @param linkPose returns a link's pose from TF, or null; TF poses override kinematics link by link
 */
export function computeLinkPoses(
  robot: URDFRobot,
  jointPositions: { [joint: string]: number },
  rootPose: Transform | null,
  linkPose: (link: string) => Transform | null = () => null
): URDFPoseResult {
  const jointByChild = new Map(robot.joints.map((joint) => [joint.child, joint]));
  const jointByName = new Map(robot.joints.map((joint) => [joint.name, joint]));
  const childJoints = new Map<string, URDFJoint[]>();
  robot.joints.forEach((joint) => {
    if (!childJoints.has(joint.parent)) childJoints.set(joint.parent, []);
    childJoints.get(joint.parent)!.push(joint);
  });

  const jointSources: { [joint: string]: JointSource } = {};
  const position = (joint: URDFJoint): number => {
    const value = jointPositions[joint.name];
    if (value !== undefined && isFinite(value)) {
      jointSources[joint.name] = "joint_state";
      return value;
    }
    if (joint.mimic !== null) {
      const leader = jointByName.get(joint.mimic.joint);
      const leaderValue = leader === undefined ? undefined : jointPositions[leader.name];
      if (leaderValue !== undefined && isFinite(leaderValue)) {
        jointSources[joint.name] = "mimic";
        return leaderValue * joint.mimic.multiplier + joint.mimic.offset;
      }
    }
    jointSources[joint.name] = "default";
    return defaultJointPosition(joint);
  };
  const localTransform = (joint: URDFJoint) => jointTransform(joint, position(joint));

  // Breadth-first order from the root
  const order: string[] = [robot.rootLink];
  for (let i = 0; i < order.length; i++) {
    (childJoints.get(order[i]) ?? []).forEach((joint) => {
      if (!order.includes(joint.child)) order.push(joint.child);
    });
  }

  // Anchor: the root pose, else the first link (closest to the root) available from TF
  let anchor: string | null = null;
  let root: Transform | null = rootPose;
  if (root !== null) {
    anchor = robot.rootLink;
  } else {
    for (const link of order) {
      const fromTF = linkPose(link);
      if (fromTF === null) continue;
      // root = linkPose · (root ← link)⁻¹
      let rootFromLink = identity();
      let current = link;
      while (current !== robot.rootLink && jointByChild.has(current)) {
        const joint = jointByChild.get(current)!;
        rootFromLink = compose(localTransform(joint), rootFromLink);
        current = joint.parent;
      }
      root = compose(fromTF, invert(rootFromLink));
      anchor = link;
      break;
    }
  }

  const links: { [link: string]: Transform } = {};
  links[robot.rootLink] = root ?? identity();
  for (let i = 1; i < order.length; i++) {
    const link = order[i];
    const joint = jointByChild.get(link)!;
    const fromTF = root === rootPose && rootPose !== null ? linkPose(link) : anchor === null ? null : linkPose(link);
    if (fromTF !== null) {
      links[link] = fromTF;
      if (joint.type !== "fixed") jointSources[joint.name] = "tf";
    } else {
      links[link] = compose(links[joint.parent] ?? identity(), localTransform(joint));
    }
  }
  // Links not connected to the root (malformed URDF) stay at the root
  robot.links.forEach((link) => {
    if (!(link.name in links)) links[link.name] = links[robot.rootLink];
  });
  robot.joints.forEach((joint) => {
    if (joint.type === "fixed") delete jointSources[joint.name];
  });
  return { links: links, jointSources: jointSources, anchor: anchor };
}

/** Resolves a mesh filename (package://pkg/path, file://, relative) against an asset folder URL. */
export function resolveMeshPath(filename: string, assetFolder: string): string[] {
  const folder = assetFolder.endsWith("/") ? assetFolder : assetFolder + "/";
  if (/^https?:\/\//.test(filename)) return [filename];
  if (filename.startsWith("file://")) {
    const path = filename.slice("file://".length);
    const basename = path.split("/").pop() ?? path;
    return [path, folder + basename];
  }
  if (filename.startsWith("package://")) {
    const rest = filename.slice("package://".length);
    const slash = rest.indexOf("/");
    const pkg = slash === -1 ? rest : rest.slice(0, slash);
    const inside = slash === -1 ? "" : rest.slice(slash + 1);
    // Try the path inside the package (folder = the package), then with the package folder, then the basename
    const candidates = [folder + inside, folder + pkg + "/" + inside, folder + (inside.split("/").pop() ?? inside)];
    return [...new Set(candidates)];
  }
  return [folder + filename.replace(/^\.\//, "")];
}
