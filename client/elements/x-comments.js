import { XRenderElement } from './x-render.js'
import './x-comment.js'

customElements.define('x-comments', class extends XRenderElement {
  static get props() {
    return {
      data: null
    }
  }

  xRenderChildren() {
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
    if (this.data) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < this.data.length; ++i) {
        frag.appendChild(document.createElement('x-comment'));
      }
      this.appendChild(frag);
    }
  }

  xAssignChildrenData() {
    if (this.data) {
      this.data.forEach((data, i) => {
        this.children[i].data = data;
      });
    }
  }
});
