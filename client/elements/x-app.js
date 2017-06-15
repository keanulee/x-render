import { XRenderElement } from './x-render.js'
import './x-header.js'
import './x-list-view.js'

customElements.define('x-app', class extends XRenderElement {
  xRenderChildren() {
    this.innerHTML = `<x-header></x-header><x-list-view></x-list-view>`;
  }
});
