customElements.define('x-header', class extends XRenderElement {
  xInit() {
    this.heading = 'My app';
    return Promise.resolve();
  }

  xRender() {
    this.innerHTML = `<h1>${this.heading}</h1>`;
  }
});
