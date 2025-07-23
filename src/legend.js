const LEGEND_CLASS = 'legend';
const LEGEND_TITLE_CLASS = 'legend-title';
const LEGEND_ITEM_CLASS = 'legend-item';
const LEGEND_COLOR_CLASS = 'legend-color';
const LEGEND_PLAN_CLASS = 'legend-plan';
const LEGEND_ACTUAL_CLASS = 'legend-actual';

export function createLegend() {
  const legend = document.createElement('div');
  legend.className = LEGEND_CLASS;

  const title = document.createElement('div');
  title.className = LEGEND_TITLE_CLASS;
  title.textContent = 'Обозначения';

  const planItem = document.createElement('div');
  planItem.className = LEGEND_ITEM_CLASS;
  
  const planColor = document.createElement('div');
  planColor.classList.add(LEGEND_COLOR_CLASS, LEGEND_PLAN_CLASS);
  
  const planText = document.createElement('div');
  planText.textContent = 'Плановая скважина';
  
  planItem.append(planColor);
  planItem.append(planText);

  const actualItem = document.createElement('div');
  actualItem.className = LEGEND_ITEM_CLASS;
  
  const actualColor = document.createElement('div');
  actualColor.classList.add(LEGEND_COLOR_CLASS, LEGEND_ACTUAL_CLASS);
  
  const actualText = document.createElement('div');
  actualText.textContent = 'Фактическая скважина';
  
  actualItem.append(actualColor);
  actualItem.append(actualText);

  legend.append(title);
  legend.append(planItem);
  legend.append(actualItem);

  return legend;
}
