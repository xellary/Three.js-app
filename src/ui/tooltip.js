import * as THREE from 'three';

const HEADER_ROW_CLASS = 'header-row';
const NAME_HEADER_CLASS = 'name-header';
const ACTUAL_HEADER_CLASS = 'actual-header';
const PLAN_HEADER_CLASS = 'plan-header';
const CLOSE_CLASS = 'close-tooltip';

export function showTooltip(objects, camera, onCloseCallback) {
  if (objects.length === 0) return null;

  const { plannedObj, actualObj } = classifyObjects(objects);
  const plannedData = plannedObj ? parseUserData(plannedObj) : null;
  const actualData = actualObj ? parseUserData(actualObj) : null;

  const tooltip = document.createElement('div');
  tooltip.classList.add("tooltip");

  const closeButton = document.createElement('div');
  closeButton.classList.add(CLOSE_CLASS);
  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (onCloseCallback) onCloseCallback();
  });

  const table = createTable(plannedData, actualData);
  tooltip.append(table, closeButton);
  document.body.append(tooltip);
  
  updatePosition(tooltip, plannedObj || actualObj, camera);
  
  return {
    element: tooltip,
    targetObject: plannedObj || actualObj,
    updatePosition: (obj, cam) => updatePosition(tooltip, obj, cam),
    remove: () => tooltip.remove()
  };
}

function classifyObjects(objects) {
  const result = { plannedObj: null, actualObj: null };

  for (const obj of objects) {
    if (obj.userData?.type === "2") {
      result.plannedObj = obj;
    } else {
      result.actualObj = obj;
    }
  }

  return result;
}

function updatePosition(tooltip, obj, camera) {
  const { x, y } = getScreenPosition(obj, camera);
  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;
  
  const padding = 5;
  const offset = 10;

  let adjustedX = x;
  if (x + tooltipWidth + padding > window.innerWidth) {
    adjustedX = window.innerWidth - tooltipWidth - padding; 
  } else if (x - padding < 0) {
    adjustedX = padding;
  }
  
  const resultY = y - tooltipHeight - offset;
  let adjustedY = resultY;
  if (resultY + tooltipHeight + padding > window.innerHeight) {
    adjustedY = window.innerHeight - tooltipHeight - padding;
  } else if (resultY - padding < 0) {
    adjustedY = padding;
  }

  tooltip.style.left = `${adjustedX}px`;
  tooltip.style.top = `${adjustedY}px`;
}

function parseUserData(obj) {
  if (!obj?.userData) return null;
  
  return {
    name: obj.userData.name,
    length: obj.userData.length,
    diameter: obj.userData.diameter,
    azimuth: obj.userData.azimuth,
    angle: obj.userData.angle,
    position: obj.userData.position
  };
}

function getScreenPosition(obj, camera) {
  const worldPosition = new THREE.Vector3();
  obj.getWorldPosition(worldPosition);
  
  const screenPosition = worldPosition.clone().project(camera);
  return {
    x: (screenPosition.x * 0.5 + 0.5) * window.innerWidth,
    y: (screenPosition.y * -0.5 + 0.5) * window.innerHeight
  };
}

function createTable(planned, actual) {
  const table = document.createElement('table');
  const tableBody = document.createElement('tbody');
  
  const showPlanned = planned !== null;
  const showActual = actual !== null;
  const name = (planned || actual).name;

  const tableHeader = createTableHeader(name, showPlanned, showActual);
  table.append(tableHeader);
  
  if (showActual) {
    actual.diameter = formatNumber(actual.diameter, 4);
  } 
  if (showPlanned) {
    planned.diameter = formatNumber(planned.diameter, 4);
  }

  const planPosition = formatPosition(planned?.position);
  const actualPosition = formatPosition(actual?.position);

  const rowsData = [
    createRowData('Глубина', 'length', planned, actual),
    createRowData('Диаметр', 'diameter', planned, actual),
    createRowData('Азимут', 'azimuth', planned, actual),
    createRowData('Угол', 'angle', planned, actual),
    createRowData('X', 'x', planPosition, actualPosition),
    createRowData('Y', 'y', planPosition, actualPosition),
    createRowData('Z', 'z', planPosition, actualPosition)
  ];

  rowsData.forEach(data => {
    const row = createTableRow(data, showPlanned, showActual);
    tableBody.append(row);
  });
  
  table.append(tableBody);
  return table;
}

function createTableHeader(name, showPlanned, showActual) {
  const headerRow = document.createElement('tr');
  headerRow.classList.add(HEADER_ROW_CLASS);
  
  const nameHeader = document.createElement('th');
  nameHeader.textContent = `#${name}`;
  nameHeader.classList.add(NAME_HEADER_CLASS); 
  headerRow.append(nameHeader);

  if (showPlanned) {
    const planHeader = document.createElement('th');
    planHeader.textContent = "План";
    planHeader.classList.add(PLAN_HEADER_CLASS);
    headerRow.append(planHeader);
  }
  
  if (showActual) {
    const actualHeader = document.createElement('th');
    actualHeader.textContent = "Факт";
    actualHeader.classList.add(ACTUAL_HEADER_CLASS);
    headerRow.append(actualHeader);
  }
  
  return headerRow;
}

function createTableRow(rowData, showPlanned, showActual) {
  const row = document.createElement('tr');
  
  const property = document.createElement('td');
  property.textContent = rowData.label;
  row.append(property);
  
  if (showPlanned) {
    const planned = document.createElement('td');
    planned.textContent = rowData.plan;
    row.append(planned);
  }
  
  if (showActual) {
    const actual = document.createElement('td');
    actual.textContent = rowData.actual;
    row.append(actual);
  }
  
  return row;
}

function formatNumber(value, digits = 2) {
  return Number(value).toFixed(digits);
}

function formatPosition(position) {
  if (!position) return null;
  return {
    x: formatNumber(position.x),
    y: formatNumber(position.y),
    z: formatNumber(position.z)
  }
}

function createRowData(label, field, planned, actual) {
  const planValue = planned?.[field];
  const actualValue = actual?.[field];
  
  return {
    label,
    plan: planValue,
    actual: actualValue
  };
}