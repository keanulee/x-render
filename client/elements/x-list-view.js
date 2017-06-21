import { XRenderElement } from './x-render.js'
import './x-list-item.js'

customElements.define('x-list-view', class extends XRenderElement {
  static get props() {
    return {
      path: null
    }
  }

  xPreRender() {
    if (typeof this.path !== 'undefined') {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
          this.data = JSON.parse(xhr.responseText);
          resolve();
        });
        xhr.open('GET', '/api/' + this.path);
        xhr.send();
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
