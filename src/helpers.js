import * as THREE from 'three';

export function getDirectionFromAngles(azimuthDeg, angleDeg) {
  const azimuth = THREE.MathUtils.degToRad(azimuthDeg);
  const angle = THREE.MathUtils.degToRad(angleDeg);

  const x = -Math.cos(azimuth) * Math.sin(angle);
  const y = -Math.sin(azimuth) * Math.sin(angle);
  const z = Math.cos(angle);
  return new THREE.Vector3(x, y, z).normalize();
}

export function normalizeCoordinates(coords, minCoords) {
  return {
    x: parseFloat(coords.x) - minCoords.x,
    y: parseFloat(coords.y) - minCoords.y,
    z: parseFloat(coords.z) - minCoords.z,
  };
}

export function getMinCoords(boreholes) {
  const arrayX = boreholes.map(h => parseFloat(h.X));
  const arrayY = boreholes.map(h => parseFloat(h.Y));
  const arrayZ = boreholes.map(h => parseFloat(h.Z));

  const minX = Math.min(...arrayX);
  const minY = Math.min(...arrayY);
  const minZ = Math.min(...arrayZ)

  return {
    x: minX,
    y: minY,
    z: minZ,
  };
}

export function getMaxCoords(boreholes) {
  const arrayX = boreholes.map(h => parseFloat(h.X));
  const arrayY = boreholes.map(h => parseFloat(h.Y));
  const arrayZ = boreholes.map(h => parseFloat(h.Z));

  const maxX = Math.max(...arrayX);
  const maxY = Math.max(...arrayY);
  const maxZ = Math.max(...arrayZ);

  return {
    x: maxX,
    y: maxY,
    z: maxZ,
  };
}

export function normalizeReliefItems(reliefItems, minCoords) {
  return reliefItems.map(item => ({
    ...item,
    Points: {
      P: item.Points.P.map(point => {
        const coords = new THREE.Vector3(point.X, point.Y, point.Z);
        return normalizeCoordinates(coords, minCoords);
      })
    }
  }));
}

