import * as THREE from 'three';
import { showTooltip } from './tooltip';

export function createMouseHandler(canvas, controls) {
  const raycaster = new THREE.Raycaster();
  const pickPosition = {x: 0, y: 0};
  let pickedObjects = [];
  let pickedObjectsSavedColors = [];
  let currentTooltip = null;
  let isTooltipFixed = false;
  let mouseMoved = false;
  let isInteractingWithControls = false;
  let lastPickedObjectName = null;

  function pick(scene, camera, isUserClick = false) {
    if ((!isUserClick && isTooltipFixed) || (!isUserClick && isInteractingWithControls)) return;
    
    if (!isTooltipFixed) {
      removeTooltip();
      restoreColors();
    }

    raycaster.setFromCamera(pickPosition, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const firstIntersected = intersects[0].object;
      const holeName = firstIntersected.userData.name;
      
      if (isUserClick) {
        if (holeName === lastPickedObjectName) {
          isTooltipFixed = !isTooltipFixed;
          return; 
        } else {
          isTooltipFixed = true;
          removeTooltip();
          restoreColors();
        }
      }

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
        currentTooltip = showTooltip(relatedObjects, camera, () => {
          isTooltipFixed = false;
          removeTooltip();
          restoreColors();
        });
        currentTooltip.targetObject = relatedObjects[0];
        lastPickedObjectName = holeName;
      }
    } else if (!isTooltipFixed) {
      restoreColors();
      removeTooltip();
    }
  }

  function restoreColors() {
    pickedObjects.forEach((obj, i) => {
      obj.material.color.setHex(pickedObjectsSavedColors[i]);
    });
    pickedObjects = [];
    pickedObjectsSavedColors = [];
    lastPickedObjectName = null;
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
    const position = getCanvasRelativePosition(event);
    pickPosition.x = (position.x / canvas.width) * 2 - 1;
    pickPosition.y = (position.y / canvas.height) * -2 + 1;
  }

  function clearPickPosition() {
    pickPosition.x = -100000;
    pickPosition.y = -100000;
    if (!isTooltipFixed) {
      restoreColors();
      removeTooltip();
    }
  }

  function initEventListeners(scene, camera) {
    canvas.addEventListener('mousedown', () => {
      mouseMoved = false;
    });

    canvas.addEventListener('mouseup', (event) => {
      if (!mouseMoved) {
        setPickPosition(event);
        pick(scene, camera, true);
      }
    });

    canvas.addEventListener('mousemove', (event) => {
      mouseMoved = true; 
      setPickPosition(event);
      pick(scene, camera);
    });

    canvas.addEventListener('mouseout', clearPickPosition);
    canvas.addEventListener('mouseleave', clearPickPosition);

    controls.addEventListener('start', () => {
      isInteractingWithControls = true;
      if (!isTooltipFixed) {
        restoreColors();
        removeTooltip();
      }
    });

    controls.addEventListener('end', () => {
      isInteractingWithControls = false;
      pick(scene, camera);
    });

    function updateTooltipPosition() {
      if (isTooltipFixed && currentTooltip?.targetObject) {
        currentTooltip.updatePosition(currentTooltip.targetObject, camera);
      }
    }

    controls.addEventListener('change', updateTooltipPosition);
    window.addEventListener('resize', updateTooltipPosition);
  }

  return {
    init: (scene, camera) => initEventListeners(scene, camera)
  };
}