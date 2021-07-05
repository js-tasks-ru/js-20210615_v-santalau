/* eslint-disable curly */
class Tooltip {
  static instance;  

  handlerEvent = {
    pointerover: event => {
      const tooltip = event.target.dataset.tooltip;
      if (tooltip) {
        this.render(tooltip);
        document.addEventListener('pointermove', this.handlerEvent.pointermove);
        document.addEventListener('pointerout', this.handlerEvent.pointerout);  
      }
    },
    pointermove: event => {
      const offset = 5;
      this.element.style.left = `${event.clientX + offset}px`;
      this.element.style.top = `${event.clientY + offset}px`;
    },
    pointerout: () => {
      this.remove();
      document.removeEventListener('pointermove', this.handlerEvent.pointermove);
      document.removeEventListener('pointerout', this.handlerEvent.pointerout);
    },   
  }
  
  constructor() {
    if (Tooltip.instance) return Tooltip.instance;
    Tooltip.instance = this;
  }

  getTemplate(tooltip) {
    return `
      <div class="tooltip">${tooltip}</div>
    `;
  }

  render(tooltip) {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate(tooltip);
    this.element = element.firstElementChild;

    document.body.append(this.element);
  }

  initialize() {
    document.addEventListener('pointerover', this.handlerEvent.pointerover);
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    document.removeEventListener('pointerover', this.handlerEvent.pointerover);
  }
}

export default Tooltip;