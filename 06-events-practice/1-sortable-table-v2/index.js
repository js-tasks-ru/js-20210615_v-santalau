/* eslint-disable curly */
export default class SortableTable {
  constructor(
    headersConfig, 
    {
      data = [],
      sorted = {}
    } = {},
    isSortLocally = true,
  ) {

    this.config = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
    this.initListener();
  }

  getHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderRow()}
      </div>
    `;
  }
  getHeaderRow() {
    return this.config.map(item => {
      return this.getHeaderCell(item);
    })
    .join('');
  }
  getHeaderCell(obj) {
    const isSortable = obj.sortable ? "data-sortable = true" : "";
    return `
      <div class="sortable-table__cell" data-id=${obj.id} ${isSortable}>
        <span>${obj.id}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  getBody(data = this.data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getBodyRows(data)}
      </div>
    `;
  }
  getBodyRows(data) {
    return data.map(item => {
      return this.getBodyRow(item);
    }).join('');
  }
  getBodyRow(obj) {
    return `
      <a href="/products/${obj.id}" class="sortable-table__row">
        ${this.config.map(item => {
          if(item.template) {
            return item.template(obj[item.id]);
          }
          return this.getBodyCell(obj[item.id]);
        }).join('')}
      </a>
    `;
  }
  getBodyCell(data) {
    return `
      <div class="sortable-table__cell">${data}</div>
    `;
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          ${this.getHeader()}
          ${this.getBody()}
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element); 
    
    this.sort(this.sorted.id, this.sorted.order);
    
    this.subElements.header.querySelector(`[data-id=${this.sorted.id}]`)
    .dataset.order = this.sorted.order;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  }

  initListener() {
    this.subElements.header.addEventListener(
      'pointerdown', 
      this.getHandlerEvent('pointerdown')
    ); 
  }
  getHandlerEvent(typeEvent) {
    const handlers = {
      'pointerdown': event => {
        const target = event.target.closest('div[data-sortable]');
        if (!target) return; 
  
        const field = target.dataset.id;  
        
        if (this.sorted.id !== field) {
          const cell = this.subElements.header.querySelector(`[data-id=${this.sorted.id}]`);
          cell.removeAttribute('data-order');
          this.sorted.id = field;
        }
        if (target.dataset.order === "asc") {
          target.dataset.order = "desc";
        } else {
          target.dataset.order = "asc";
        }

        const order = target.dataset.order;
        this.sort(field, order);
      }
    };
    return handlers[typeEvent];
  }

  sort(field, order) {
    const arr = [...this.data];
    const { sortType } = this.config.find(item => item.id === field);
    const directions = {
      'asc': 1,
      'desc': -1,
    };
    const direction = directions[order];
    
    const sortedData = arr.sort(this.getCompareFunction(field, sortType, direction));
    this.update(sortedData);
  }

  getCompareFunction(field, sortType, direction) {
    const compareFunctions = {
      'string': (obj1, obj2) => {
        return direction * obj1[field].localeCompare(obj2[field], ['ru', 'en']);
      },
      'number': (obj1, obj2) => {
        return direction * (obj1[field] - obj2[field]);
      },
    };

    return compareFunctions[sortType];
  }

  update(data) {
    this.subElements.body.innerHTML = this.getBody(data);
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements.header.removeEventListener(
      'pointerdown', 
      this.getHandlerEvent('pointerdown')
    ); 
  }
}