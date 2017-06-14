class XRenderElement extends HTMLElement {
  xInit() {
    // virtual - must return promise that resolves when xRender() can be run.
    return Promise.resolve();
  }

  xRender() {
    // abstract
  }

  constructor() {
    super();
    this._xInitPromise = this.xInit();
  }

  connectedCallback() {
    if (!this.hasAttribute('x-rendered')) {
      this._xInitPromise.then(() => this.xRender());
    } else {
      this.removeAttribute('x-rendered');
    }
  }
}
