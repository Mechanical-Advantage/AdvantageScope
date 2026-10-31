// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { Field3dRendererCommand_URDFObj } from "../../Field3dRenderer";
import { disposeObject, rotation3dToQuaternion } from "../../Field3dRendererImpl";
import ObjectManager from "../ObjectManager";

export default class URDFManager extends ObjectManager<Field3dRendererCommand_URDFObj> {
  private group = new THREE.Group();
  private signature = "";
  private links = new Map<string, THREE.Group>();
  private generation = 0;
  private errors: HTMLElement | null = null;
  dispose(): void {
    this.generation++;
    this.group.removeFromParent();
    disposeObject(this.group);
    this.errors?.remove();
  }
  setObjectData(object: Field3dRendererCommand_URDFObj): void {
    const signature = JSON.stringify([object.robot, object.assets]);
    if (signature !== this.signature) {
      this.signature = signature;
      const generation = ++this.generation;
      disposeObject(this.group);
      this.group.clear();
      this.links.clear();
      this.root.add(this.group);
      this.errors?.remove();
      this.errors = null;
      const fail = (name: string) => {
        if (generation !== this.generation) return;
        if (!this.errors) {
          this.errors = document.createElement("div");
          this.errors.className = "spatial-mesh-error";
          this.errors.style.cssText = "position:absolute;top:40px;left:12px;color:var(--red, #e66);font-size:12px";
          document.querySelector(".field-3d-canvas-container")?.append(this.errors);
        }
        this.errors.textContent = "Mesh unavailable: " + name;
      };
      const manager = new THREE.LoadingManager();
      manager.setURLModifier((url) => object.assets[url] ?? object.assets[decodeURIComponent(url)] ?? url);
      object.robot.links.forEach((link) => {
        const group = new THREE.Group();
        this.links.set(link.name, group);
        this.group.add(group);
        link.visuals.forEach((visual) => {
          const holder = new THREE.Group();
          holder.position.set(...visual.origin.translation);
          holder.quaternion.copy(rotation3dToQuaternion(visual.origin.rotation));
          group.add(holder);
          const color = visual.material?.color ?? [0.6, 0.6, 0.6, 1];
          const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(...(color.slice(0, 3) as [number, number, number])),
            opacity: color[3],
            transparent: color[3] < 1
          });
          const shape = visual.geometry;
          let geometry: THREE.BufferGeometry | null = null;
          if (shape.type === "box") geometry = new THREE.BoxGeometry(...shape.size);
          if (shape.type === "sphere") geometry = new THREE.SphereGeometry(shape.radius, 20, 12);
          if (shape.type === "cylinder") {
            geometry = new THREE.CylinderGeometry(shape.radius, shape.radius, shape.length, 24);
            geometry.rotateX(Math.PI / 2);
          }
          if (geometry) holder.add(new THREE.Mesh(geometry, material));
          if (shape.type !== "mesh") return;
          holder.scale.set(...shape.scale);
          const filename = shape.filename;
          const url = object.assets[filename];
          if (!url) {
            fail(filename);
            return;
          }
          const loaded = (mesh: THREE.Object3D) => {
            if (generation !== this.generation) {
              disposeObject(mesh);
              return;
            }
            holder.add(mesh);
            this.requestRender();
          };
          const ext = filename.split(".").pop()?.toLowerCase();
          if (ext === "stl")
            new STLLoader(manager).load(
              url,
              (geo) => loaded(new THREE.Mesh(geo, material)),
              undefined,
              () => fail(filename)
            );
          else if (ext === "obj") new OBJLoader(manager).load(url, loaded, undefined, () => fail(filename));
          else if (ext === "dae")
            new ColladaLoader(manager).load(
              url,
              (model) => loaded(model.scene),
              undefined,
              () => fail(filename)
            );
          else if (ext === "gltf" || ext === "glb")
            new GLTFLoader(manager).load(
              url,
              (model) => loaded(model.scene),
              undefined,
              () => fail(filename)
            );
          else fail(filename);
        });
      });
    }
    this.links.forEach((group, name) => {
      const pose = object.links[name];
      group.visible = pose !== undefined;
      if (pose) {
        group.position.set(...pose.translation);
        group.quaternion.copy(rotation3dToQuaternion(pose.rotation));
      }
    });
  }
}
