import { XRenderElement } from './x-render.js'
import './x-list-item.js'
import './x-comments.js'

customElements.define('x-item', class extends XRenderElement {
  static get props() {
    return {
      itemId: null
    }
  }

  xPreRender() {
    if (this.itemId) {
      return fetch('https://node-hnapi.herokuapp.com/item/' + this.itemId)
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
      frag.appendChild(document.createElement('x-list-item'));
      frag.appendChild(document.createElement('x-comments'));
      this.appendChild(frag);
    }
  }

  xSetChildrenData() {
    if (this.data) {
      this.querySelector('x-list-item').data = this.data;
      this.querySelector('x-comments').data = this.data.comments;
    }
  }
});
