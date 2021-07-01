/* eslint-disable curly */
export default class SortableTable {

  constructor(headerConfig = [], { data = [] } = {}) {
    this.header = headerConfig;

    this.data = data.map(obj => {
      const cutObj = { id: obj.id };
      for (const elem of this.header) {
        if (obj.hasOwnProperty(elem.id)) {
          if (elem.template) {
            cutObj[elem.id] = elem.template(obj[elem.id]);
          } else {
            cutObj[elem.id] = obj[elem.id];
          }
        }        
      }
      return cutObj;
    });

    this.cellWithArrow = null;
    
    this.render();
  }

  getHeader() {
    return this.header.map(obj => `
        <div class="sortable-table__cell" data-id=${obj.id} data-sortable=${obj.sortable}>
          <span>${obj.title}</span>
            ${obj.sortable 
              ? `<span data-element="arrow" class="sortable-table__sort-arrow">
                    <span class="sort-arrow"></span>
                  </span>`
              : ""
            }
        </div>
      `).join('');
  }

  getBody() {
    return this.data.map(obj => `
      <a href="/products/${obj.id}" class="sortable-table__row">
        ${this.header.map(elem => {
          return `<div class="sortable-table__cell">${obj[elem.id]}</div>`;
        }).join('')}
      </a>        
    `).join('');
  }

  get template() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeader()} 
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getBody()}
        </div>
      </div>
    </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.headerCells = this.getHeaderCells(this.subElements.header);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  getHeaderCells(element) {
    const cells = element.querySelectorAll('[data-id]');
    return [...cells].reduce((accum, headerCell) => {
      accum[headerCell.dataset.id] = headerCell;
      return accum;
    }, {});
  }

  sort(field, order) {
    const directions = {
      'asc': 1,
      'desc': -1,
    };
    const direction = directions[order];

    const {
      sortType,
      sortable,
    } = this.header.find(cell => cell.id === field); 

    const sortTypes = {
      'string': this.sortStrings,
      'number': this.sortNumbers,
    };

    sortTypes[sortType](this.data, direction, field);
  
    this.update(order, field);
  }

  sortNumbers(arr, direction, field) {
    return arr.sort((obj1, obj2) => {
      return direction * (obj1[field] - obj2[field]);
    });
  }

  sortStrings(arr, direction, field) {
    return arr.sort((obj1, obj2) => {
      return direction * obj1[field].localeCompare(obj2[field], ['ru', 'en'], {caseFirst: "upper"});
    });
  }

  update(order, field) {
    this.subElements.body.innerHTML = this.getBody();
    
    if (this.cellWithArrow) {
      this.cellWithArrow.removeAttribute('data-order');
    }
    this.cellWithArrow = this.headerCells[field];
    this.headerCells[field].setAttribute('data-order', order);
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}