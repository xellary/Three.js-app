import * as THREE from 'three';
import { getDirectionFromAngles } from './helpers.js';
import { normalizeCoordinates } from './helpers.js';
import { getMinCoords } from './helpers.js';

export function createBoreholes(boreholes) {
  const group = new THREE.Group();
  const boreholeColor = new THREE.Color(0x00b4d8);
  const minCoords = getMinCoords(boreholes);

  boreholes.forEach(hole => {
    const coords = new THREE.Vector3(hole.X, hole.Y, hole.Z);
    const length = parseFloat(hole.Length);
    const diameter = parseFloat(hole.Diameter);
    const angle = parseFloat(hole.Angle);
    const azimuth = parseFloat(hole.Azimuth);
    const type = hole.T;
    const name = hole.Name;

    if (!length || !diameter) {
        return;
    }
    
    const geometry = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 16);
    geometry.translate(0, -length / 2, 0);

    const material = new THREE.MeshStandardMaterial({ color: boreholeColor });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.userData = {
      type: type,
      name: name, 
      position: coords,
      length: length,
      diameter: diameter,
      angle: angle,
      azimuth: azimuth,
    };
    
    const normalizedCoords = normalizeCoordinates(coords, minCoords);
    mesh.position.set(normalizedCoords.x, normalizedCoords.y, normalizedCoords.z);

    const direction = getDirectionFromAngles(azimuth, angle);
    const defaultAxis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultAxis, direction);
    mesh.setRotationFromQuaternion(quaternion);

    group.add(mesh);
  });
  
  return group;
}
