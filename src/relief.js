import * as THREE from 'three';
import { Delaunay } from 'd3-delaunay';

export function createRelief(reliefItems, reliefTypes) {
  const group = new THREE.Group();

  const filteredReliefItems = reliefItems.filter(ri =>
    ri.TID === reliefTypes[0].UID || ri.TID === reliefTypes[1].UID
  );

  if (filteredReliefItems.length === 0) {
    return group;
  }

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x688522 });
  filteredReliefItems.forEach(ri => {
    const points = ri.Points.P.map(p => new THREE.Vector3(p.X, p.Y, p.Z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    group.add(line);
  });
  
  const allPoints = filteredReliefItems.flatMap(ri =>
    ri.Points.P.map(p => ({
      x: p.X,
      y: p.Y,
      z: p.Z
    }))
  );

  const uniquePoints = [];
  const keySet = new Set();

  allPoints.forEach(({ x, y, z }) => {
    const key = `${x}_${y}_${z}`;
    if (!keySet.has(key)) {
      keySet.add(key);
      uniquePoints.push({ x, y, z });
    }
  });

  const delaunay = Delaunay.from(uniquePoints, p => p.x, p => p.y);
  const triangles = delaunay.triangles;

  const positions = uniquePoints.flatMap(p => [p.x, p.y, p.z]);

  const meshGeometry = new THREE.BufferGeometry();
  meshGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  meshGeometry.setIndex(Array.from(triangles));
  meshGeometry.computeVertexNormals();

  const meshMaterial = new THREE.MeshStandardMaterial({
    color: 0xA9D14B,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
  group.add(mesh);

  return group;
}
