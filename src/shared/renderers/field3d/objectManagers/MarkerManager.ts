// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { transformPoint } from "../../../spatial/Transform";
import { Field3dRendererCommand_MarkerObj } from "../../Field3dRenderer";
import { disposeObject, rotation3dToQuaternion } from "../../Field3dRendererImpl";
import ObjectManager from "../ObjectManager";
export default class MarkerManager extends ObjectManager<Field3dRendererCommand_MarkerObj> {
  private group = new THREE.Group();
  dispose() {
    this.group.removeFromParent();
    disposeObject(this.group);
    this.group.traverse((n) => {
      if (n instanceof THREE.Sprite) {
        n.material.map?.dispose();
        n.material.dispose();
      }
    });
  }
  setObjectData(object: Field3dRendererCommand_MarkerObj) {
    this.dispose();
    this.group = new THREE.Group();
    this.root.add(this.group);
    const m = object.marker;
    const color = new THREE.Color(m.color.r, m.color.g, m.color.b);
    const material = new THREE.MeshPhongMaterial({ color, opacity: m.color.a, transparent: m.color.a < 1 });
    let geometry: THREE.BufferGeometry | null = null;
    if (m.type === 1) geometry = new THREE.BoxGeometry(1, 1, 1);
    if (m.type === 2) geometry = new THREE.SphereGeometry(0.5, 16, 12);
    if (m.type === 3) {
      geometry = new THREE.CylinderGeometry(m.shape === "cone" ? 0 : 0.5, 0.5, 1, 24);
      geometry.rotateX(Math.PI / 2);
    }
    if (geometry) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(m.scale.x, m.scale.y, m.scale.z);
      this.group.add(mesh);
      mesh.position.set(m.pose.translation[0], m.pose.translation[1], m.pose.translation[2]);
      mesh.quaternion.copy(rotation3dToQuaternion(m.pose.rotation));
    } else if ([0, 4, 5, 8].includes(m.type)) {
      const tf = m.pose;
      const points = (m.points ?? []).map((p: any) => new THREE.Vector3(...transformPoint(tf, [p.x, p.y, p.z])));
      if (m.type === 0 && points.length < 2) {
        points.push(
          new THREE.Vector3(...m.pose.translation),
          new THREE.Vector3(...transformPoint(m.pose, [m.scale.x, 0, 0]))
        );
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      if (m.type === 8) this.group.add(new THREE.Points(geo, new THREE.PointsMaterial({ color, size: m.scale.x })));
      else if (m.type === 5) this.group.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color })));
      else if (m.type === 0 && points.length >= 2) {
        const direction = points[1].clone().sub(points[0]);
        this.group.add(
          new THREE.ArrowHelper(
            direction.clone().normalize(),
            points[0],
            direction.length(),
            color,
            m.scale.z || 0.2,
            m.scale.y || 0.1
          )
        );
      } else this.group.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color })));
    } else if (m.type === 9) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 64;
      const context = canvas.getContext("2d")!;
      context.font = "36px sans-serif";
      context.fillStyle = color.getStyle();
      context.fillText(m.text, 4, 46);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true })
      );
      sprite.position.set(m.pose.translation[0], m.pose.translation[1], m.pose.translation[2]);
      sprite.scale.set((m.scale.z || 0.3) * 8, m.scale.z || 0.3, 1);
      this.group.add(sprite);
    }
  }
}
