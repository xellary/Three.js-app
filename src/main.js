import './style.css'
import * as THREE from 'three';
import { XMLParser } from 'fast-xml-parser';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Delaunay } from 'd3-delaunay'; 

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x25292e);

const fov = 60;
const far = 10000;
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, far);
camera.up.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* const gridHelper = new THREE.GridHelper(200, 20, 0x555555, 0x333333);
scene.add(gridHelper); */

const axesHelper = new THREE.AxesHelper(120);
scene.add(axesHelper);

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;          
controls.maxDistance = 250;
controls.minPolarAngle = 0;         
controls.maxPolarAngle = Math.PI / 2

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

async function loadAndParse() {
  try {
    const response = await fetch('data.xml');
    const xmlText = await response.text();
    
    const parser = new XMLParser({
      ignoreAttributes: false, 
      attributeNamePrefix: '', 
      isArray: (name) => {
        return ['H', 'RI', 'P', 'ReliefType'].includes(name);
      }
    });
    
    const parsedData = parser.parse(xmlText);
    const boreholes = parsedData.BlastMaker_Project.BoreHoles.H;

    const minX = Math.min(...boreholes.map(hole => parseFloat(hole.X)));
    const minY = Math.min(...boreholes.map(hole => parseFloat(hole.Y)));
    const minZ = Math.min(...boreholes.map(hole => parseFloat(hole.Z)));

    const reliefItems = parsedData.BlastMaker_Project.ReliefItems.RI;
    const reliefTypes = parsedData.BlastMaker_Project.ReliefTypes.ReliefType;
    const filteredReliefItems = reliefItems.filter(ri => 
      ri.TID === reliefTypes[0].UID 
      || ri.TID === reliefTypes[1].UID 
      || ri.TID === reliefTypes[3].UID 
      || ri.TID === reliefTypes[4].UID
    ); 

    if (filteredReliefItems.length === 0) {
      console.log("No relief items found");
      return;
    }
  
    const allPoints = [];

    filteredReliefItems.forEach((ri) => {
      const points = ri.Points.P.map(p => {
        const x = parseFloat(p.X) - minX;
        const y = parseFloat(p.Y) - minY;
        const z = parseFloat(p.Z) - minZ;
        allPoints.push({ x, y, z }); 
        return new THREE.Vector3(x, y, z);
      });

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0xA9D14B });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    });

    const uniquePoints = [];
    const keySet = new Set();

    allPoints.forEach(point => {
      const key = `${point.x}_${point.y}_${point.z}`;
      if (!keySet.has(key)) {
        uniquePoints.push(point);
        keySet.add(key);
      }
    });

    const delaunay = Delaunay.from(uniquePoints, point => point.x, point => point.y);
    const triangles = delaunay.triangles;

    const positions = [];
    uniquePoints.forEach(point => positions.push(point.x, point.y, point.z));

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(Array.from(triangles));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0xA9D14B,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      flatShading: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    boreholes.forEach((hole, index) => {
      const x = parseFloat(hole.X) - minX;
      const y = parseFloat(hole.Y) - minY;
      const z = parseFloat(hole.Z) - minZ;
      const length = parseFloat(hole.Length);
      const diameter = parseFloat(hole.Diameter);
      const angle = parseFloat(hole.Angle);
      const azimuth = parseFloat(hole.Azimuth);
      const t = hole.T;
      
      if (length === 0 || diameter === 0) {    //!!!
        return;
      }
      
      const geometry = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 16);
      geometry.translate(0, -length / 2, 0);


      let material;
      let boreholeMesh;
      if (t === "2") {
        material = new THREE.MeshBasicMaterial({ color: 0x00b4d8 });
        boreholeMesh = new THREE.Mesh(geometry, material);
      } else {
        material = new THREE.MeshBasicMaterial({ color: 0xe63946 });
        boreholeMesh = new THREE.Mesh(geometry, material);
      }
      
      boreholeMesh.position.set(x, y, z);
      const direction = getDirectionFromAngles(azimuth, angle);
      const defaultAxis = new THREE.Vector3(0, 1, 0); 
      const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultAxis, direction);
      boreholeMesh.setRotationFromQuaternion(quaternion);

      scene.add(boreholeMesh);
      /* console.log(`${index + 1} ${hole.ID} ${hole.X}, ${hole.Y}, ${hole.Z} ${hole.Length} ${hole.Diameter}`); */
    });
  
    const maxX = Math.max(...boreholes.map(hole => parseFloat(hole.X) - minX));
    const maxY = Math.max(...boreholes.map(hole => parseFloat(hole.Y) - minY));
    const maxZ = Math.max(...boreholes.map(hole => parseFloat(hole.Z) - minZ));
    
    const centerX = maxX / 2;
    const centerY = maxY / 2;
    const centerZ = maxZ / 2;

    const distance = Math.max(maxX, maxY, maxZ);
    camera.position.set(centerX + distance, centerY, centerZ);
    controls.target.set(centerX, centerY, centerZ);
    
    return boreholes;

  } catch (error) {
    console.error(error);
    return null;
  }
}

loadAndParse();
animate();

function getDirectionFromAngles(azimuthDeg, angleDeg) {
  const azimuth = THREE.MathUtils.degToRad(azimuthDeg);
  const angle = THREE.MathUtils.degToRad(angleDeg);

  const x = -Math.cos(azimuth) * Math.sin(angle);
  const y = -Math.sin(azimuth) * Math.sin(angle);
  const z = Math.cos(angle);

  return new THREE.Vector3(x, y, z).normalize();
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log(getDirectionFromAngles(0, 0));
console.log(getDirectionFromAngles(90, 90));
console.log(getDirectionFromAngles(180, 45));

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(100, 100, 100);
scene.add(dirLight);


