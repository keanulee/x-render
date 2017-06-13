class XRenderElement extends HTMLElement {
  xRender() {
    // abstract
  }

  connectedCallback() {
    if (!this.hasAttribute('x-rendered')) {
      this.xRender();
    } else {
      this.removeAttribute('x-rendered');
    }
  }
}
