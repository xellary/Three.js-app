export function createLegend() {
  const legend = document.createElement('div');
  legend.className = 'legend';

  const title = document.createElement('div');
  title.className = 'legend-title';
  title.textContent = 'Обозначения';

  const planItem = document.createElement('div');
  planItem.className = 'legend-item';
  
  const planColor = document.createElement('div');
  planColor.className = 'legend-color legend-plan';
  
  const planText = document.createElement('div');
  planText.textContent = 'Плановая скважина';
  
  planItem.append(planColor);
  planItem.append(planText);

  const actualItem = document.createElement('div');
  actualItem.className = 'legend-item';
  
  const actualColor = document.createElement('div');
  actualColor.className = 'legend-color legend-actual';
  
  const actualText = document.createElement('div');
  actualText.textContent = 'Фактическая скважина';
  
  actualItem.append(actualColor);
  actualItem.append(actualText);

  legend.append(title);
  legend.append(planItem);
  legend.append(actualItem);

  return legend;
}
