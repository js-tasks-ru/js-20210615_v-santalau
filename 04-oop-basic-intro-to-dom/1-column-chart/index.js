/* eslint-disable curly */
export default class ColumnChart {
  chartHeight = 50;

  constructor(props = {}) {
    let {
      data = [],
      label = '',
      value = 0,
      link = '',
    } = props;

    this.data = [...data];
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = props.formatHeading;
    this.isLoading = this.data.length === 0;

    this.render();
  }

  getColumns(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;
  
    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  renderColums(data) {
    return this.getColumns(data)
    .map(obj => {
      return `
        <div style="--value: ${obj.value}" data-tooltip=${obj.percent}></div>
      `;
    })
    .join('');
  }

  render() {
    const element = document.createElement('div'); 

    element.innerHTML = `
    <div class="dashboard__chart_${this.label} column-chart_loading">
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link 
            &&
            `<a href=${this.link} class="column-chart__link">View all</a>`}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.formatHeading && this.formatHeading(this.value)
              || 
              this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.renderColums(this.data)}
          </div>
        </div>
      </div>
    </div>
    `;

    this.element = element.firstElementChild; // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`  
    if (!this.isLoading) this.element.classList.remove('column-chart_loading');
  }

  update(newData = this.data) {
    this.data = [...newData];
    this.chart = this.element.querySelector('.column-chart__chart');
    this.chart.innerHTML = this.renderColums(this.data);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.remove();
  }
}