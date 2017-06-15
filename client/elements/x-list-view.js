import { XRenderElement } from './x-render.js'
import './x-list-item.js'

customElements.define('x-list-view', class extends XRenderElement {
  xInit() {
    return fetch('https://node-hnapi.herokuapp.com/news')
      .then((response) => response.json())
      .then((data) => {
        this.data = data;
      });
  }

  xRenderChildren() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < this.data.length; ++i) {
      frag.appendChild(document.createElement('x-list-item'));
    }
    this.appendChild(frag);
  }

  xAssignChildrenData() {
    // Needed to add properties to server-rendered CEs
    this.data.forEach((story, i) => {
      this.children[i].data = story;
    });
  }
});
