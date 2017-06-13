customElements.define('x-app', class extends XRenderElement {
  xRender() {
    this.innerHTML = `<x-header></x-header><x-list-view></x-list-view>`;
  }
});
