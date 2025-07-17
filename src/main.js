import './style.css';

import * as THREE from 'three';

import { parseXML } from './parser.js';
import { createRelief } from './relief.js';
import { createBoreholes } from './boreholes.js';
import { getMinCoords, getMaxCoords, normalizeReliefItems, normalizeCoordinates } from './helpers.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createMouseHandler } from './mouseHandler.js';

async function main() {
  const data = await parseXML('data.xml');
  if (!data) {
    return;
  }

  const { boreholes, reliefItems, reliefTypes } = data;

  const minCoords = getMinCoords(boreholes);
  const normalizedRelief = normalizeReliefItems(reliefItems, minCoords);

  const reliefGroup = createRelief(normalizedRelief, reliefTypes);
  const boreholesGroup = createBoreholes(boreholes);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x25292e);

  const fov = 60;
  const far = 10000;
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, far);
  camera.up.set(0, 0, 1);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.append(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(100, 100, 100);
  scene.add(dirLight);

  const axesHelper = new THREE.AxesHelper(120);
  scene.add(axesHelper);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 10;
  controls.maxDistance = 250;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  scene.add(reliefGroup);
  scene.add(boreholesGroup);

  const maxCoords = getMaxCoords(boreholes);
  const normalizedCoords = normalizeCoordinates(maxCoords.x, maxCoords.y, maxCoords.z, minCoords);
  const centerX = normalizedCoords.X / 2;
  const centerY = normalizedCoords.Y / 2;
  const centerZ = normalizedCoords.Z / 2;
  const distance = Math.max(normalizedCoords.X, normalizedCoords.Y, normalizedCoords.Z);

  camera.position.set(centerX + distance, centerY, centerZ);
  controls.target.set(centerX, centerY, centerZ);

  reliefGroup.traverse(child => {
    child.raycast = () => []; 
  });
  axesHelper.traverse(child => {
    child.raycast = () => []; 
  });

  const mouseHandler = createMouseHandler(renderer.domElement, controls);
  mouseHandler.init(scene, camera); 

  animate();
}

main();

