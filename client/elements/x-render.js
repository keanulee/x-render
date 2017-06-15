export { XRenderElement }

class XRenderElement extends HTMLElement {
  /**
   * Initialization code that is run by client and server before xRenderChildren().
   * Used to assign properties on `this` that are needed by xRenderChildren().
   * (On client, this is run in constuctor()).
   * Example: Fetch data from API and assign to `this.data`.
   *
   * @return {Promise} A promise that resolves when xRenderChildren() can be run.
   */
  xInit() {
    // virtual
    return Promise.resolve();
  }

  /**
   * Code used to stamp child nodes on this element (through `this.innerHTML` or
   * `this.appendChild), for example. If this method runs on the server, it will not be
   * run again on the client.
   */
  xRenderChildren() {
    // virtual
  }

  /**
   * Code that is used to set properties on child nodes after they are stamped. Since
   * properties on elements are not serialized in HTML, this method run on the client
   * even when the element is server-rendered.
   *
   * Note: If you're setting attributes on children, this can be done in
   * xRenderChildren() instead since attributes can be serialized in HTML.
   *
   * After this method runs, the x-render process starts for child elements.
   */
  xAssignChildrenData() {
    // virtual
  }

  /**
   * Code that is only needed on the client (not run on server).
   * Example: Adding 'click' event listeners.
   */
  xAddEventListeners() {
    // virtual
  }

  constructor() {
    super();
    this._xInitPromise = this.xInit();
  }

  connectedCallback() {
    if (this._xInitPromise) {
      this._xInitPromise.then(() => {
        if (!this.hasAttribute('x-rendered')) {
          this.xRenderChildren();
        } else {
          this.removeAttribute('x-rendered');
        }
        this.xAssignChildrenData();
        this.xAddEventListeners();
      });

      this._xInitPromise = null;
    }
  }
}
