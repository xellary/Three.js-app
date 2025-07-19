import * as THREE from 'three';
import { showTooltip } from './tooltip';

export function createMouseHandler(canvas, controls) {
  const raycaster = new THREE.Raycaster();
  const pickPosition = {x: 0, y: 0};
  let pickedObjects = [];
  let pickedObjectsSavedMaterials = []; 
  let currentTooltip = null;
  let isTooltipFixed = false;
  let mouseMoved = false;
  let isInteractingWithControls = false;
  let lastPickedObjectName = null;

  function pick(scene, camera, isUserClick = false) {
    if ((!isUserClick && isTooltipFixed) || (!isUserClick && isInteractingWithControls)) return;
    
    if (!isTooltipFixed) {
      removeTooltip();
      restoreMaterials();
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
          restoreMaterials();
        }
      }

      const relatedObjects = [];
      
      scene.traverse(obj => {
        if (obj.userData?.name === holeName) {
          pickedObjectsSavedMaterials.push({
            color: obj.material.color.getHex(),
            transparent: obj.material.transparent,
            opacity: obj.material.opacity,
          });
          pickedObjects.push(obj);

          obj.material.transparent = false;
          obj.material.opacity = 1.0;
          
          if (obj.userData.type === "2") {
            obj.material.color.setHex(0x1E90FF); 
          } else {
            obj.material.color.setHex(0xFF7514);
          }

          relatedObjects.push(obj); 
        }
      });
      
      if (relatedObjects.length > 0) {
        currentTooltip = showTooltip(relatedObjects, camera, () => {
          isTooltipFixed = false;
          removeTooltip();
          restoreMaterials();
        });
        currentTooltip.targetObject = relatedObjects[0];
        lastPickedObjectName = holeName;
      }
    } else if (!isTooltipFixed) {
      restoreMaterials();
      removeTooltip();
    }
  }

  function restoreMaterials() {
    pickedObjects.forEach((obj, i) => {
      const saved = pickedObjectsSavedMaterials[i];
      obj.material.color.setHex(saved.color);
      obj.material.transparent = saved.transparent;
      obj.material.opacity = saved.opacity;
    });
    pickedObjects = [];
    pickedObjectsSavedMaterials = [];
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
      restoreMaterials();
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
        restoreMaterials();
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