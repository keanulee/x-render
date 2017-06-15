import { XRenderElement } from './x-render.js'

customElements.define('x-list-item', class extends XRenderElement {
  xRenderChildren() {
    this.innerHTML = `<a href="${this.data.url}">${this.data.title}</a>`;
  }
});
