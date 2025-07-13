import * as THREE from 'three';

import { showTooltip } from './tooltip';

export function createMouseHandler(canvas, controls) {
  const raycaster = new THREE.Raycaster();
  const pickPosition = {x: 0, y: 0};
  let pickedObjects = [];
  let pickedObjectsSavedColors = [];
  let currentTooltip = null; 
  let isInteractingWithControls = false;
  let lastMouseEvent = null; 

  function pick(scene, camera, event) {
    if (isInteractingWithControls) return;
    removeTooltip();
    restoreColors();

    if (!event && lastMouseEvent) {
      event = lastMouseEvent;
      pickPosition.x = ((event.clientX - canvas.getBoundingClientRect().left) / canvas.width) * 2 - 1;
      pickPosition.y = -((event.clientY - canvas.getBoundingClientRect().top) / canvas.height) * 2 + 1;
    }

    raycaster.setFromCamera(pickPosition, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const firstIntersected = intersects[0].object;
      const holeName = firstIntersected.userData.name; 
      const relatedObjects = [];
      
      scene.traverse(obj => {
        if (obj.userData?.name === holeName) {
          pickedObjectsSavedColors.push(obj.material.color.getHex());
          pickedObjects.push(obj);
          
          if (obj.userData.type === "2") {
            obj.material.color.setHex(0xFF0000); 
          } else {
            obj.material.color.setHex(0xFFFF00); 
          }

          relatedObjects.push(obj); 
        }
      });
      if (relatedObjects.length > 0) {
        const mainObj = relatedObjects[0];
        mainObj.userData.relatedObjects = relatedObjects;
        currentTooltip = showTooltip(mainObj, camera); 
      }
    }
  }

  function restoreColors() {
    pickedObjects.forEach((obj, i) => {
      obj.material.color.setHex(pickedObjectsSavedColors[i]);
    });
    pickedObjects = [];
    pickedObjectsSavedColors = [];
  }

  function removeTooltip() {
    if (currentTooltip) {
      currentTooltip.remove();
      currentTooltip = null;
    }
  }

  function getCanvasRelativePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height,
    };
  }

  function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvas.width) * 2 - 1;
    pickPosition.y = (pos.y / canvas.height) * -2 + 1;
    lastMouseEvent = event; 
    return pickPosition;
  }

  function clearPickPosition() {
    pickPosition.x = -100000;
    pickPosition.y = -100000;
    restoreColors();
    removeTooltip();
  }

  function initEventListeners(scene, camera) {
    canvas.addEventListener('mousemove', (event) => {
      setPickPosition(event);
      pick(scene, camera, event);

    });

    canvas.addEventListener('mouseout', clearPickPosition);
    canvas.addEventListener('mouseleave', clearPickPosition);

    controls.addEventListener('start', () => {
      isInteractingWithControls = true;
      restoreColors();
      removeTooltip();
    });

    controls.addEventListener('end', () => {
      isInteractingWithControls = false;
      pick(scene, camera);
    });
  }

  return {
    pick,
    setPickPosition,
    clearPickPosition,
    init: (scene, camera) => initEventListeners(scene, camera)
  };
}