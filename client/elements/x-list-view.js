import { XRenderElement } from './x-render.js'
import './x-list-item.js'

customElements.define('x-list-view', class extends XRenderElement {
  static get props() {
    return {
      path: String
    }
  }

  xInit() {
    if (this.path) {
      return fetch('https://node-hnapi.herokuapp.com/' + this.path)
        .then((response) => response.json())
        .then((data) => {
          this.data = data;
        });
    } else {
      this.data = [];
      return Promise.resolve();
    }
  }

  xRenderChildren() {
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
    const frag = document.createDocumentFragment();
    for (let i = 0; i < this.data.length; ++i) {
      frag.appendChild(document.createElement('x-list-item'));
    }
    this.appendChild(frag);
  }

  xAssignChildrenData() {
    this.data.forEach((story, i) => {
      this.children[i].data = story;
    });
  }
});
