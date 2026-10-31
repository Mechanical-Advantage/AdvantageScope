// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { Field3dRendererCommand_CloudObj } from "../../Field3dRenderer";
import { rotation3dToQuaternion } from "../../Field3dRendererImpl";
import ObjectManager from "../ObjectManager";
export default class CloudManager extends ObjectManager<Field3dRendererCommand_CloudObj> {
  private points: THREE.Points | null = null;
  dispose() {
    this.points?.removeFromParent();
    this.points?.geometry.dispose();
    (this.points?.material as THREE.Material | undefined)?.dispose();
  }
  setObjectData(object: Field3dRendererCommand_CloudObj) {
    this.dispose();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(object.positions, 3));
    geo.setAttribute("value", new THREE.Float32BufferAttribute(object.values, 1));
    geo.setAttribute(
      "pointColor",
      new THREE.Float32BufferAttribute(object.colors ?? new Float32Array(object.positions.length), 3)
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        pointSize: { value: object.size },
        low: { value: object.min },
        high: { value: object.max },
        rgb: { value: object.colors !== null },
        turbo: { value: object.map === "turbo" }
      },
      vertexShader: `attribute float value; attribute vec3 pointColor; varying float v; varying vec3 c; uniform float pointSize; uniform float low; uniform float high;
      void main(){v=clamp((value-low)/max(high-low,0.00001),0.,1.);c=pointColor;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=pointSize;}`,
      fragmentShader: `varying float v; varying vec3 c; uniform bool rgb; uniform bool turbo;
      void main(){vec3 col=mix(mix(vec3(.267,.005,.329),vec3(.128,.567,.551),clamp(v*2.,0.,1.)),vec3(.993,.906,.144),clamp(v*2.-1.,0.,1.));
      if(turbo) col=clamp(vec3(1.5)-abs(4.*v-vec3(3.,2.,1.)),0.,1.);gl_FragColor=vec4(rgb?c:col,1.);}`
    });
    this.points = new THREE.Points(geo, material);
    this.points.position.set(...object.transform.translation);
    this.points.quaternion.copy(rotation3dToQuaternion(object.transform.rotation));
    this.root.add(this.points);
  }
}
