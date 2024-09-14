import * as THREE from "three";

export default function makeAxesTemplate(materialSpecular: THREE.Color, materialShininess: number): THREE.Object3D {
  let axes = new THREE.Object3D();
  const radius = 0.02;

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 8, 4),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: materialSpecular,
      shininess: materialShininess
    })
  );
  center.castShadow = true;
  center.receiveShadow = true;
  axes.add(center);

  const xAxis = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 1, 8),
    new THREE.MeshPhongMaterial({
      color: 0xff0000,
      specular: materialSpecular,
      shininess: materialShininess
    })
  );
  xAxis.castShadow = true;
  xAxis.receiveShadow = true;
  xAxis.position.set(0.5, 0.0, 0.0);
  xAxis.rotateZ(Math.PI / 2);
  axes.add(xAxis);

  const yAxis = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 1, 8),
    new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      specular: materialSpecular,
      shininess: materialShininess
    })
  );
  yAxis.castShadow = true;
  yAxis.receiveShadow = true;
  yAxis.position.set(0.0, 0.5, 0.0);
  axes.add(yAxis);

  const zAxis = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 1, 8),
    new THREE.MeshPhongMaterial({
      color: 0x2020ff,
      specular: materialSpecular,
      shininess: materialShininess
    })
  );
  zAxis.castShadow = true;
  zAxis.receiveShadow = true;
  zAxis.position.set(0.0, 0.0, 0.5);
  zAxis.rotateX(Math.PI / 2);
  axes.add(zAxis);

  return axes;
}
