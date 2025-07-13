import * as THREE from 'three';

export function showTooltip(obj, camera) {
    const tooltip = document.createElement('div');
    tooltip.classList.add("tooltip");

    const worldPosition = new THREE.Vector3();
    obj.getWorldPosition(worldPosition);

    const screenPosition = worldPosition.clone().project(camera);
    const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
    const y = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;

    const { name, type, length, diameter, azimuth, angle, relatedObjects } = obj.userData;
    const { x: posX, y: posY, z: posZ } = obj.position;

    const propertiesList = document.createElement("ul");
    
    function addProperty(label, value) {
      const li = document.createElement("li");
      li.textContent = `${label}: ${value}`;
      propertiesList.append(li);
    }

    addProperty("Номер", name);
    addProperty("Тип", type);
    addProperty("Длина фактической", relatedObjects.length > 1 ? relatedObjects[1].userData.length : "нет");
    addProperty("Длина", length);
    addProperty("Диаметр", diameter.toFixed(4));
    addProperty("Азимут", azimuth);
    addProperty("Угол", angle);
    addProperty("Позиция", `X: ${posX.toFixed(2)}, Y: ${posY.toFixed(2)}, Z: ${posZ.toFixed(2)}`);

    tooltip.append(propertiesList);
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    document.body.append(tooltip);

    return tooltip;
}

