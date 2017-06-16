import { XRenderElement } from './x-render.js'

customElements.define('x-comment', class extends XRenderElement {
  static get props() {
    return {
      data: null
    }
  }

  xRender() {
    this.innerHTML = this.data.content;
    this.appendChild(document.createElement('x-comments'));
  }

  xSetChildrenData() {
    this.querySelector('x-comments').data = this.data.comments;
  }
});
