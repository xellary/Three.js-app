import * as THREE from 'three';

export function getDirectionFromAngles(azimuthDeg, angleDeg) {
  const azimuth = THREE.MathUtils.degToRad(azimuthDeg);
  const angle = THREE.MathUtils.degToRad(angleDeg);

  const x = -Math.cos(azimuth) * Math.sin(angle);
  const y = -Math.sin(azimuth) * Math.sin(angle);
  const z = Math.cos(angle);
  return new THREE.Vector3(x, y, z).normalize();
}

function normalizeCoordinates(x, y, z, minCoords) {
  return {
    X: parseFloat(x) - minCoords.x,
    Y: parseFloat(y) - minCoords.y,
    Z: parseFloat(z) - minCoords.z,
  };
}

export function getMinCoords(boreholes) {
  return {
    x: Math.min(...boreholes.map(h => parseFloat(h.X))),
    y: Math.min(...boreholes.map(h => parseFloat(h.Y))),
    z: Math.min(...boreholes.map(h => parseFloat(h.Z))),
  };
}

export function getMaxCoords(boreholes, minCoords) {
  return {
    x: Math.max(...boreholes.map(h => parseFloat(h.X) - minCoords.x)),
    y: Math.max(...boreholes.map(h => parseFloat(h.Y) - minCoords.y)),
    z: Math.max(...boreholes.map(h => parseFloat(h.Z) - minCoords.z)),
  };
}

export function normalizeBoreholes(boreholes, minCoords) {
  return boreholes.map(h => ({
    ...h,
    ...normalizeCoordinates(h.X, h.Y, h.Z, minCoords),
  }));
}

export function normalizeReliefItems(reliefItems, minCoords) {
  return reliefItems.map(ri => ({
    ...ri,
    Points: {
      P: ri.Points.P.map(p => 
        normalizeCoordinates(p.X, p.Y, p.Z, minCoords)
      )
    }
  }));
}
