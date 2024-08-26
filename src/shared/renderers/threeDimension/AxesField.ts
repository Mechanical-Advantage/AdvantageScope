import * as THREE from "three";
import { STANDARD_FIELD_LENGTH, STANDARD_FIELD_WIDTH } from "../../AdvantageScopeAssets";
import makeAxesTemplate from "./AxesTemplate";

export default function makeAxesField(materialSpecular: THREE.Color, materialShininess: number): THREE.Object3D {
  let field = new THREE.Group();

  let axes = makeAxesTemplate(materialSpecular, materialShininess);
  axes.position.set(-STANDARD_FIELD_LENGTH / 2, -STANDARD_FIELD_WIDTH / 2, 0);
  field.add(axes);
  let outline = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-STANDARD_FIELD_LENGTH / 2, -STANDARD_FIELD_WIDTH / 2, 0),
      new THREE.Vector3(STANDARD_FIELD_LENGTH / 2, -STANDARD_FIELD_WIDTH / 2, 0),
      new THREE.Vector3(STANDARD_FIELD_LENGTH / 2, STANDARD_FIELD_WIDTH / 2, 0),
      new THREE.Vector3(-STANDARD_FIELD_LENGTH / 2, STANDARD_FIELD_WIDTH / 2, 0),
      new THREE.Vector3(-STANDARD_FIELD_LENGTH / 2, -STANDARD_FIELD_WIDTH / 2, 0)
    ]),
    new THREE.LineBasicMaterial({ color: 0x444444 })
  );
  field.add(outline);

  return field;
}
