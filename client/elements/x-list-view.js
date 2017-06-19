import { XRenderElement } from './x-render.js'
import './x-list-item.js'

customElements.define('x-list-view', class extends XRenderElement {
  static get props() {
    return {
      path: null
    }
  }

  xPreRender() {
    if (this.path) {
      return fetch('/api/' + this.path)
        .then((response) => response.json())
        .then((data) => {
          this.data = data;
        });
    } else {
      this.data = null;
      return Promise.resolve();
    }
  }

  xRender() {
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
    if (this.data) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < this.data.length; ++i) {
        frag.appendChild(document.createElement('x-list-item'));
      }
      this.appendChild(frag);
    }
  }

  xSetChildrenData() {
    if (this.data) {
      this.data.forEach((story, i) => {
        this.children[i].data = story;
      });
    }
  }
});
