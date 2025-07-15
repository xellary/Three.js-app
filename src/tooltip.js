import * as THREE from 'three';

const HEADER_ROW_CLASS = 'header-row';
const NAME_HEADER_CLASS = 'name-header';
const ACTUAL_HEADER_CLASS = 'actual-header';
const PLAN_HEADER_CLASS = 'plan-header';
const ACTUAL_CELL_CLASS = 'actual-cell';
const PLANNED_CELL_CLASS = 'planned-cell';
const TABLE_CELL_CLASS = 'table-cell';

export function showTooltip(objects, camera) {
    if (objects.length < 1) return null;

    const [plannedObj, actualObj] = objects;
    const plannedData = parseUserData(plannedObj);
    const actualData = actualObj ? parseUserData(actualObj) : null;

    const tooltip = document.createElement('div');
    tooltip.classList.add("tooltip");
    const { x, y } = getScreenPosition(plannedObj, camera);
    
    const table = createTable(plannedData, actualData);
    
    tooltip.append(table);
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    document.body.append(tooltip);

    return tooltip;
}

function parseUserData(obj) {
    if (!obj?.userData) return {};
    
    return {
        name: obj.userData.name,
        length: obj.userData.length,
        diameter: obj.userData.diameter,
        azimuth: obj.userData.azimuth,
        angle: obj.userData.angle,
        position: obj.position
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
    const hasActualData = actual !== null;

    const tableHeader = createTableHeader(planned.name, hasActualData);
    table.append(tableHeader);
    
    const planDiameter = formatNumber(planned.diameter, 4);
    const actualDiameter = formatNumber(actual?.diameter, 4);
    const planPosition = formatPosition(planned.position);
    const actualPosition = formatPosition(actual?.position);

    addTableRow(tableBody, "Длина", planned.length, actual?.length, hasActualData);
    addTableRow(tableBody, "Диаметр", planDiameter, actualDiameter, hasActualData);
    addTableRow(tableBody, "Азимут", planned.azimuth, actual?.azimuth, hasActualData);
    addTableRow(tableBody, "Угол", planned.angle, actual?.angle, hasActualData);
    addTableRow(tableBody, "XYZ", planPosition, actualPosition, hasActualData);
    
    table.append(tableBody);
    return table;
}

function createTableHeader(name, hasActualData) {
    const headerRow = document.createElement('tr');
    headerRow.classList.add(HEADER_ROW_CLASS);
    
    const nameHeader = document.createElement('th');
    nameHeader.textContent = `#${name}`;
    nameHeader.classList.add(NAME_HEADER_CLASS);

    const planHeader = document.createElement('th');
    planHeader.textContent = "План";
    planHeader.classList.add(PLAN_HEADER_CLASS);
    
    if (hasActualData) {
        const actualHeader = document.createElement('th');
        actualHeader.textContent = "Факт";
        actualHeader.classList.add(ACTUAL_HEADER_CLASS);
        headerRow.append(nameHeader, planHeader, actualHeader);
    } else {
        headerRow.append(nameHeader, planHeader);
    }
    
    return headerRow;
}

function addTableRow(table, property, planned, actual, hasActualData) {
    const row = document.createElement('tr');
    
    const propCell = document.createElement('td');
    propCell.textContent = property;
    const plannedCell = document.createElement('td');
    plannedCell.textContent = planned;
    plannedCell.classList.add(PLANNED_CELL_CLASS);
    
    if (hasActualData) {
        const actualCell = document.createElement('td');
        actualCell.textContent = actual;
        actualCell.classList.add(ACTUAL_CELL_CLASS);
        row.append(propCell, plannedCell, actualCell);
    } else {
        row.append(propCell, plannedCell);
    }
    
    table.append(row);
}

function formatNumber(value, digits = 2) {
    return Number(value).toFixed(digits);
}

function formatPosition(position) {
  if (!position) return null;
  return `${formatNumber(position.x)}; ${formatNumber(position.y)}; ${formatNumber(position.z)}`;
}