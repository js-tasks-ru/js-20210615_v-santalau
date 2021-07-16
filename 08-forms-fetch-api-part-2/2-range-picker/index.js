/* eslint-disable curly */
export default class RangePicker {
  element;
  startSelecting = true;
  
  toggle = () => {
    this.element.classList.toggle("rangepicker_open");
    this.renderRangePicker();
  }

  outsideClick = event => {
    const isRangePicker = this.element.contains(event.target);
    if (isRangePicker) return;
    
    const isOpen = this.element.classList.contains("rangepicker_open");
    if (isOpen) this.close();
  }

  onSelectorClick({target}) {
    if (target.classList.contains("rangepicker__cell")) {
      this.onCellClick(target);
    }
  }
    
  constructor({
    from = new Date(),
    to = new Date(),
  } = {}) {
    this.from = from;
    this.to = to;
    this.start = new Date(from);
    this.range = {from, to};
    
    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
    
    this.initEventsListeners();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  }

  initEventsListeners() {
    const { input, selector } = this.subElements;
    input.addEventListener('click', this.toggle);   
    selector.addEventListener('click', event => this.onSelectorClick(event));

    document.addEventListener('click', this.outsideClick, {capture: true});
  }

  close() {
    this.element.classList.remove('rangepicker_open');
  }

  get template() {
    return `
    <div class="rangepicker">
      ${this.templateInput}
      <div class="rangepicker__selector" data-element="selector"></div>
    </div>`;
  }
  get templateInput() {
    const from = this.formatDate(this.range.from);
    const to = this.formatDate(this.range.to);
    return `
      <div class="rangepicker__input" data-element="input">
        <span data-element="from">${from}</span> -
        <span data-element="to">${to}</span>
      </div>`;
  }

  renderRangePicker() {
    const startMonth = new Date(this.start);
    const nextMonth = new Date(this.start);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const { selector } = this.subElements;
    selector.innerHTML = this.getTemplateRangePicker(startMonth, nextMonth);
    
    const controlLeft = selector.querySelector('.rangepicker__selector-control-left');
    const controlRight = selector.querySelector('.rangepicker__selector-control-right');
    
    controlLeft.addEventListener('click', () => this.left());
    controlRight.addEventListener('click', () => this.right());
    
    this.highlightCells();
  }

  left() {
    this.start.setMonth(this.start.getMonth() - 1);
    this.renderRangePicker();
  }
    
  right() {
    this.start.setMonth(this.start.getMonth() + 1);
    this.renderRangePicker();
  }

  getTemplateRangePicker(startMonth, nextMonth) {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.getTemplateMonth(startMonth)}
      ${this.getTemplateMonth(nextMonth)}
    `;
  }

  getTemplateMonth(renderMonth) {
    const date = new Date(renderMonth);
    const monthStr = date.toLocaleString('ru', {month: 'long'});
    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${monthStr}">${monthStr}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        ${this.getTemplateDaysGrid(date)}
      </div>
    `;    
  }


  getTemplateDaysGrid(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = () => {
      return new Date(year, month + 1, 0).getDate();
    };
      
    const days = [];
    for (let i = 1; i <= daysInMonth(); i++) {
      const dateCell = new Date(year, month, i);
      days.push({
        day: i,
        value: dateCell.toISOString(),
        weekday: i === 1 ? dateCell.getDay() : '',
      });
    }
    
    return `
      <div class="rangepicker__date-grid">
        ${days.map(date => this.getDay(date)).join('')}
      </div>
    `;
    
  }

  getDay(date) {
    return `
      <button 
        type="button" 
        class="rangepicker__cell" 
        data-value="${date.value}"
        style="--start-from: ${date.weekday}"
      >
        ${date.day}
      </button>
    `;
  }

  highlightCells() {
    const { from, to } = this.range;
    for (const cell of this.element.querySelectorAll('.rangepicker__cell')) {
      const { value } = cell.dataset;
      const cellDate = new Date(value);

      cell.classList.remove('rangepicker__selected-from');
      cell.classList.remove('rangepicker__selected-between');
      cell.classList.remove('rangepicker__selected-to');
      
      if (from && value === from.toISOString()) {
        cell.classList.add('rangepicker__selected-from');
      } else if (to && value === to.toISOString()) {
        cell.classList.add('rangepicker__selected-to');
      } else if (from && to && cellDate >= from && cellDate <= to) {
        cell.classList.add('rangepicker__selected-between');
      }
    }
    if (from) {
      const selectedFromElem = this.element.querySelector(`[data-value="${from.toISOString()}"]`);
      if (selectedFromElem) {
        selectedFromElem.closest('.rangepicker__cell').classList.add('rangepicker__selected-from');
      }
    }
    if (to) {
      const selectedToElem = this.element.querySelector(`[data-value="${to.toISOString()}"]`);
      if (selectedToElem) {
        selectedToElem.closest('.rangepicker__cell').classList.add('rangepicker__selected-to');
      }
    }
  }

  onCellClick(target) {
    const { value } = target.dataset;
    if (value) {
      const dateValue = new Date(value);
      if (this.startSelecting) {
        this.range = {
          from: dateValue,
          to: null
        };
        this.startSelecting = false;
        this.highlightCells();
      } else {
        if (dateValue > this.range.from) {
          this.range.to = dateValue;
        } else {
          this.range.to = this.range.from;
          this.range.from = dateValue;
        }
        this.startSelecting = true;
        this.highlightCells();
      }
      if (this.range.from && this.range.to) {
        this.dispatchEvent();
        this.close();
        this.subElements.from.innerHTML = this.formatDate(this.range.from);
        this.subElements.to.innerHTML = this.formatDate(this.range.to);
      }
    }
  }

  formatDate(date) {
    return date.toLocaleString("ru", {dateStyle: "short"});
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.selected
    }));
  }

  remove() {
    if (this.element) this.element.remove();
    document.removeEventListener('click', this.outsideClick, {capture: true});
  }

  destroy() {
    this.element = null;
    this.subElements = {};
    this.remove();
  }
}