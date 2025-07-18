import * as THREE from 'three';
import { Delaunay } from 'd3-delaunay';

export function createRelief(reliefItems, reliefTypes) {
  const group = new THREE.Group();
  const reliefColor = new THREE.Color(0xA9D14B);
  const lineColor = reliefColor.clone().offsetHSL(0, 0, -0.2);

  const filteredReliefItems = reliefItems.filter(item =>
    item.TID === reliefTypes[0].UID || item.TID === reliefTypes[1].UID
  );

  if (filteredReliefItems.length === 0) {
    return group;
  }

  const lineMaterial = new THREE.LineBasicMaterial({ color: lineColor });
  filteredReliefItems.forEach(item => {
    const points = item.Points.P.map(point => new THREE.Vector3(point.x, point.y, point.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    group.add(line);
  });
  
  const allPoints = filteredReliefItems.flatMap(item =>
    item.Points.P.map(point => ({
      x: point.x,
      y: point.y,
      z: point.z
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

  const delaunay = Delaunay.from(uniquePoints, point => point.x, point => point.y);
  const triangles = delaunay.triangles;

  const positions = uniquePoints.flatMap(point => [point.x, point.y, point.z]);

  const meshGeometry = new THREE.BufferGeometry();
  meshGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  meshGeometry.setIndex(Array.from(triangles));
  meshGeometry.computeVertexNormals();

  const meshMaterial = new THREE.MeshStandardMaterial({
    color: reliefColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
  group.add(mesh);

  return group;
}
