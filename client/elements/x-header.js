import { XRenderElement } from './x-render.js'

customElements.define('x-header', class extends XRenderElement {
  xInit() {
    this.heading = 'My app';
    return Promise.resolve();
  }

  xRenderChildren() {
    this.innerHTML = `<h1>${this.heading}</h1>`;
  }
});
