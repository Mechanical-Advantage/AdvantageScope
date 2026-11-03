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
  private points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null;
  private positions: Float32Array | null = null;
  private values: Float32Array | null = null;
  private colors: Float32Array | null = null;
  dispose() {
    this.points?.removeFromParent();
    this.points?.geometry.dispose();
    this.points?.material.dispose();
    this.points = null;
    this.positions = this.values = this.colors = null;
  }
  setObjectData(object: Field3dRendererCommand_CloudObj) {
    const geo = this.points?.geometry ?? new THREE.BufferGeometry();
    const resized = this.points !== null && geo.getAttribute("position").count !== object.positions.length / 3;
    if (resized) geo.dispose();
    const update = (name: string, values: Float32Array, size: number) => {
      const attribute = geo.getAttribute(name);
      if (!attribute || resized || attribute.array.length !== values.length) {
        geo.setAttribute(name, new THREE.Float32BufferAttribute(values, size));
      } else {
        attribute.array.set(values);
        attribute.needsUpdate = true;
      }
    };
    if (!this.points || resized || this.positions !== object.positions) {
      update("position", object.positions, 3);
      geo.boundingSphere = null;
      this.positions = object.positions;
    }
    if (!this.points || resized || this.values !== object.values) {
      update("value", object.values, 1);
      this.values = object.values;
    }
    if (!this.points || resized || this.colors !== object.colors) {
      update("pointColor", object.colors ?? new Float32Array(object.positions.length), 3);
      this.colors = object.colors;
    }
    const material =
      this.points?.material ??
      new THREE.ShaderMaterial({
        uniforms: {
          pointSize: { value: object.size * window.devicePixelRatio },
          low: { value: object.min },
          high: { value: object.max },
          rgb: { value: object.colors !== null },
          turbo: { value: object.map === "turbo" }
        },
        vertexShader: `attribute float value; attribute vec3 pointColor; varying float v; varying vec3 c; uniform float pointSize; uniform float low; uniform float high;
      void main(){v=clamp((value-low)/max(high-low,0.00001),0.,1.);c=pointColor;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=pointSize;}`,
        fragmentShader: `varying float v; varying vec3 c; uniform bool rgb; uniform bool turbo;
      void main(){if(length(gl_PointCoord-vec2(.5))>.5) discard;vec3 col=mix(mix(vec3(.267,.005,.329),vec3(.128,.567,.551),clamp(v*2.,0.,1.)),vec3(.993,.906,.144),clamp(v*2.-1.,0.,1.));
      if(turbo) col=clamp(vec3(1.5)-abs(4.*v-vec3(3.,2.,1.)),0.,1.);gl_FragColor=vec4(rgb?c:col,1.);}`
      });
    material.uniforms.pointSize.value = object.size * window.devicePixelRatio;
    material.uniforms.low.value = object.min;
    material.uniforms.high.value = object.max;
    material.uniforms.rgb.value = object.colors !== null;
    material.uniforms.turbo.value = object.map === "turbo";
    if (!this.points) {
      this.points = new THREE.Points(geo, material);
      this.root.add(this.points);
    }
    this.points.position.set(...object.transform.translation);
    this.points.quaternion.copy(rotation3dToQuaternion(object.transform.rotation));
  }
}
