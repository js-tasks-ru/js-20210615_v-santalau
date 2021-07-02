/* eslint-disable curly */
export default class NotificationMessage {
  static showedElement = ``;

  constructor(
    message, 
    {
      duration = 0, 
      type = "",
    } = {}) {

    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get template() {
    return `
      <div 
        class="notification ${this.type}" 
        style="--value:${this.duration / 1000}s"
      >
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  beforeInsert() {
    if (NotificationMessage.showedElement) {
      NotificationMessage.showedElement.remove();
    }
    NotificationMessage.showedElement = this.element;
  }

  insert(target) {
    if (target) {
      target.append(this.element);
    } else {
      document.body.append(this.element);
    }
  }

  afterInsert() {
    setTimeout(() => this.remove(), this.duration);
  }

  show(target) {
    this.beforeInsert();
    this.insert(target);
    this.afterInsert();
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}