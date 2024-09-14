import * as THREE from "three";
import { ALLIANCE_STATION_WIDTH, STANDARD_FIELD_LENGTH, STANDARD_FIELD_WIDTH } from "../../AdvantageScopeAssets";
import { convert } from "../../units";

export default function makeEvergreenField(materialSpecular: THREE.Color, materialShininess: number): THREE.Object3D {
  let field = new THREE.Group();

  // Floor
  let carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(STANDARD_FIELD_LENGTH + 4, STANDARD_FIELD_WIDTH + 1),
    new THREE.MeshPhongMaterial({ color: 0x888888, side: THREE.DoubleSide })
  );
  carpet.name = "carpet";
  field.add(carpet);

  // Guardrails
  const guardrailHeight = convert(20, "inches", "meters");
  [-STANDARD_FIELD_WIDTH / 2, STANDARD_FIELD_WIDTH / 2].forEach((y) => {
    [0, guardrailHeight].forEach((z) => {
      let guardrail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, STANDARD_FIELD_LENGTH, 12),
        new THREE.MeshPhongMaterial({ color: 0xdddddd })
      );
      field.add(guardrail);
      guardrail.rotateZ(Math.PI / 2);
      guardrail.position.set(0, y, z);
    });
    {
      let panel = new THREE.Mesh(
        new THREE.PlaneGeometry(STANDARD_FIELD_LENGTH, guardrailHeight),
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          opacity: 0.25,
          transparent: true
        })
      );
      field.add(panel);
      panel.rotateX(Math.PI / 2);
      panel.position.set(0, y, guardrailHeight / 2);
    }
    for (let x = -STANDARD_FIELD_LENGTH / 2; x < STANDARD_FIELD_LENGTH / 2; x += STANDARD_FIELD_LENGTH / 16) {
      if (x === -STANDARD_FIELD_LENGTH / 2) continue;
      let guardrail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, guardrailHeight, 12),
        new THREE.MeshPhongMaterial({ color: 0xdddddd })
      );
      field.add(guardrail);
      guardrail.rotateX(Math.PI / 2);
      guardrail.position.set(x, y, guardrailHeight / 2);
    }
  });

  // Alliance stations
  const allianceStationWidth = ALLIANCE_STATION_WIDTH;
  const allianceStationHeight = convert(78, "inches", "meters");
  const allianceStationSolidHeight = convert(36.75, "inches", "meters");
  const allianceStationShelfDepth = convert(12.25, "inches", "meters");
  const fillerWidth = (STANDARD_FIELD_WIDTH - allianceStationWidth * 3) / 2;
  const blueColor = 0x6379a6;
  const redColor = 0xa66363;
  [-STANDARD_FIELD_LENGTH / 2, STANDARD_FIELD_LENGTH / 2].forEach((x) => {
    [0, allianceStationSolidHeight, allianceStationHeight].forEach((z) => {
      let guardrail = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.02,
          0.02,
          z === allianceStationSolidHeight ? allianceStationWidth * 3 : STANDARD_FIELD_WIDTH,
          12
        ),
        new THREE.MeshPhongMaterial({ color: 0xdddddd })
      );
      field.add(guardrail);
      guardrail.position.set(x, 0, z);
    });
    [
      -STANDARD_FIELD_WIDTH / 2,
      allianceStationWidth * -1.5,
      allianceStationWidth * -0.5,
      allianceStationWidth * 0.5,
      allianceStationWidth * 1.5,
      STANDARD_FIELD_WIDTH / 2
    ].forEach((y) => {
      let guardrail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, allianceStationHeight, 12),
        new THREE.MeshPhongMaterial({ color: 0xdddddd })
      );
      field.add(guardrail);
      guardrail.rotateX(Math.PI / 2);
      guardrail.position.set(x, y, allianceStationHeight / 2);
    });
    [-STANDARD_FIELD_WIDTH / 2 + fillerWidth / 2, STANDARD_FIELD_WIDTH / 2 - fillerWidth / 2].forEach((y) => {
      let filler = new THREE.Mesh(
        new THREE.PlaneGeometry(allianceStationHeight, fillerWidth),
        new THREE.MeshPhongMaterial({ color: x < 0 ? blueColor : redColor, side: THREE.DoubleSide })
      );
      field.add(filler);
      filler.rotateY(Math.PI / 2);
      filler.position.set(x, y, allianceStationHeight / 2);
    });
    {
      let allianceWall = new THREE.Mesh(
        new THREE.PlaneGeometry(allianceStationSolidHeight, allianceStationWidth * 3),
        new THREE.MeshPhongMaterial({ color: x < 0 ? blueColor : redColor, side: THREE.DoubleSide })
      );
      field.add(allianceWall);
      allianceWall.rotateY(Math.PI / 2);
      allianceWall.position.set(x, 0, allianceStationSolidHeight / 2);
    }
    {
      let allianceGlass = new THREE.Mesh(
        new THREE.PlaneGeometry(allianceStationHeight - allianceStationSolidHeight, allianceStationWidth * 3),
        new THREE.MeshPhongMaterial({
          color: x < 0 ? blueColor : redColor,
          side: THREE.DoubleSide,
          opacity: 0.25,
          transparent: true
        })
      );
      field.add(allianceGlass);
      allianceGlass.rotateY(Math.PI / 2);
      allianceGlass.position.set(
        x,
        0,
        allianceStationSolidHeight + (allianceStationHeight - allianceStationSolidHeight) / 2
      );
    }
    {
      let allianceShelves = new THREE.Mesh(
        new THREE.PlaneGeometry(allianceStationShelfDepth, allianceStationWidth * 3),
        new THREE.MeshPhongMaterial({ color: x < 0 ? blueColor : redColor, side: THREE.DoubleSide })
      );
      field.add(allianceShelves);
      allianceShelves.position.set(
        x + (allianceStationShelfDepth / 2) * (x > 0 ? 1 : -1),
        0,
        allianceStationSolidHeight
      );
    }
  });

  // Add lighting effects
  field.traverse((node: any) => {
    let mesh = node as THREE.Mesh; // Traverse function returns Object3d or Mesh
    let isCarpet = mesh.name === "carpet";
    if (mesh.isMesh && mesh.material instanceof THREE.MeshPhongMaterial) {
      if (!isCarpet && materialSpecular !== undefined && materialShininess !== undefined) {
        mesh.material.specular = materialSpecular;
        mesh.material.shininess = materialShininess;
      }
      mesh.castShadow = !isCarpet;
      mesh.receiveShadow = true;
    }
  });

  return field;
}
