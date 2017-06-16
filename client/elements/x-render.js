export { XRenderElement }

class XRenderElement extends HTMLElement {
  /**
   * Props can be thought of as inputs to this element. The element will not render
   * until all declared props are `!== undefined`. A setter is created for each prop
   * which, when used, will re-render the element.
   */
  static get props() {
    return {};
  }

  /**
   * Initialization code that is run on both client and server once during the lifetime
   * of the page. Used to set the initial state of props (e.g. `this.path =
   * window.location.pathname`). On the client, this is run inside `constuctor()`.
   */
  xInit() {
    // virtual
  }

  /**
   * Once all props are defined, this code starts the render process on both client and
   * server. Used this to assign properties on `this` that are used by `xRender()`
   * (e.g. fetch data from an API and assign to `this.data`). If async work is required
   * before render, return a Promise that resolves when the async work is complete
   * (e.g. `return fetch(...)`).
   */
  xPreRender() {
    // virtual
  }

  /**
   * Code used to stamp child nodes on this element (e.g. with `this.innerHTML =` or
   * `this.appendChild()`) or modify attributes on self. During SSR page load, this
   * method runs only on the server.
   */
  xRender() {
    // virtual
  }

  /**
   * Code that is used to set properties on child nodes after they are stamped. Since
   * properties on elements are not serialized in HTML, this method runs on both client
   * and server.
   *
   * Note: Setting attributes on children should be done in xRender() instead
   * since attributes are serialized to HTML.
   *
   * After this method runs, the render process starts for child elements.
   */
  xSetChildrenData() {
    // virtual
  }

  /**
   * Code that runs only on the client after everything else (e.g. adding event listeners).
   */
  xAddEventListeners() {
    // virtual
  }

  constructor() {
    super();
    this._props = {};
    Object.keys(this.constructor.props).forEach((propName) => {
      const oldPropValue = this[propName];
      Object.defineProperty(this, propName, {
        get() {
          return this._props[propName];
        },

        set(v) {
          this._props[propName] = v;
          this._render();
        }
      });

      if (oldPropValue) {
        this[propName] = oldPropValue;
      }
    });
    this.xInit();
  }

  _render() {
    // Can't rely on isConnected, since prop setter may run before first connectedCallback.
    if (!this._firstConnectedCallback) {
      return;
    }

    const allPropsDefined = Object.keys(this.constructor.props).every((propName) => {
      return typeof this[propName] !== 'undefined';
    });

    if (allPropsDefined) {
      Promise.resolve(this.xPreRender()).then(() => {
        if (!this.hasAttribute('x-rendered')) {
          this.xRender();
        } else {
          this.removeAttribute('x-rendered');
        }
        this.xSetChildrenData();
        this.xAddEventListeners();
      });
    }
  }

  connectedCallback() {
    this._firstConnectedCallback = true;
    this._render();
  }
}
