import { XRenderElement } from './x-render.js'

customElements.define('x-comment', class extends XRenderElement {
  static get props() {
    return {
      data: null
    }
  }

  xRenderChildren() {
    this.innerHTML = this.data.content;
    this.appendChild(document.createElement('x-comments'));
  }

  xAssignChildrenData() {
    this.querySelector('x-comments').data = this.data.comments;
  }
});
