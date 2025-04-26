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

  let axes = makeAxesTemplate(materialSpecular, materialShininess);
  if (isFTC) {
    axes.scale.set(0.5, 0.5, 0.5);
  } else {
    axes.position.set(-FRC_STANDARD_FIELD_LENGTH / 2, -FRC_STANDARD_FIELD_WIDTH / 2, 0);
  }
  field.add(axes);
  let fieldLength = isFTC ? FTC_STANDARD_FIELD_LENGTH : FRC_STANDARD_FIELD_LENGTH;
  let fieldWidth = isFTC ? FTC_STANDARD_FIELD_WIDTH : FRC_STANDARD_FIELD_WIDTH;
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
