import * as THREE from 'three';

export function createMousePick(canvas) {
  const raycaster = new THREE.Raycaster();
  let pickedObject = null;
  let pickedObjectSavedColor = 0;
  const pickPosition = {x: 0, y: 0};

  function pick(normalizedPosition, scene, camera) {
    if (pickedObject) {
      pickedObject.material.color.setHex(pickedObjectSavedColor);
      pickedObject = null;
    }

    raycaster.setFromCamera(normalizedPosition, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      pickedObject = intersects[0].object;
      pickedObjectSavedColor = pickedObject.material.color.getHex();
      pickedObject.material.color.setHex(0xFFFFFF);
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
    return pickPosition;
  }

  function clearPickPosition() {
    pickPosition.x = -100000;
    pickPosition.y = -100000;
    if (pickedObject) {
      pickedObject.material.color.setHex(pickedObjectSavedColor);
      pickedObject = null;
    }
  }

  function initEventListeners(scene, camera) {
    canvas.addEventListener('mousemove', (event) => {
      const normalizedPos = setPickPosition(event);
      pick(normalizedPos, scene, camera);
    });

    canvas.addEventListener('mouseout', clearPickPosition);
    canvas.addEventListener('mouseleave', clearPickPosition);
  }

  return {
    pick,
    setPickPosition,
    clearPickPosition,
    init: (scene, camera) => initEventListeners(scene, camera)
  };
}