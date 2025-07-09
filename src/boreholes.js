import * as THREE from 'three';
import { getDirectionFromAngles } from './helpers.js';

export function createBoreholes(boreholes) {
  const group = new THREE.Group();

  boreholes.forEach(hole => {
    const x = parseFloat(hole.X);
    const y = parseFloat(hole.Y);
    const z = parseFloat(hole.Z);
    const length = parseFloat(hole.Length);
    const diameter = parseFloat(hole.Diameter);
    const angle = parseFloat(hole.Angle);
    const azimuth = parseFloat(hole.Azimuth);
    const type = hole.T;

    if (!length || !diameter) {
        return;
    }
    
    const geometry = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 16);
    geometry.translate(0, -length / 2, 0);

    let material;
    if (type === "2") {
        material = new THREE.MeshBasicMaterial({ color: 0x00b4d8 });
    } else {
        material = new THREE.MeshBasicMaterial({ color: 0xe63946 });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);

    const direction = getDirectionFromAngles(azimuth, angle);
    const defaultAxis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultAxis, direction);
    mesh.setRotationFromQuaternion(quaternion);

    group.add(mesh);
  });

  return group;
}
