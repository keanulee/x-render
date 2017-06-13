customElements.define('x-list-view', class extends XRenderElement {
  xRender() {
    this.innerHTML = `<ul><li>Article One</li><li>Article Two</li><li>Article Three</li></ul>`
  }
});
