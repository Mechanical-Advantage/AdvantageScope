// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import {
  FRC_STANDARD_FIELD_LENGTH,
  FRC_STANDARD_FIELD_WIDTH,
  FTC_STANDARD_FIELD_LENGTH,
  FTC_STANDARD_FIELD_WIDTH
} from "../../AdvantageScopeAssets";
import makeAxesTemplate from "./AxesTemplate";

export default function makeAxesField(
  materialSpecular: THREE.Color,
  materialShininess: number,
  isFTC: boolean
): THREE.Object3D {
  let field = new THREE.Group();
  let fieldLength = isFTC ? FTC_STANDARD_FIELD_LENGTH : FRC_STANDARD_FIELD_LENGTH;
  let fieldWidth = isFTC ? FTC_STANDARD_FIELD_WIDTH : FRC_STANDARD_FIELD_WIDTH;

  let axes = makeAxesTemplate(materialSpecular, materialShininess);
  field.add(axes);
  if (isFTC) {
    axes.scale.set(0.5, 0.5, 0.5);
  }
  axes.position.set(0, 0, 0);

  let outline = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-fieldLength / 2, -fieldWidth / 2, 0),
      new THREE.Vector3(fieldLength / 2, -fieldWidth / 2, 0),
      new THREE.Vector3(fieldLength / 2, fieldWidth / 2, 0),
      new THREE.Vector3(-fieldLength / 2, fieldWidth / 2, 0),
      new THREE.Vector3(-fieldLength / 2, -fieldWidth / 2, 0)
    ]),
    new THREE.LineBasicMaterial({ color: 0x444444 })
  );
  field.add(outline);

  return field;
}
