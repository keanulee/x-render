import { XRenderElement } from './x-render.js'
import './x-header.js'
import './x-list-view.js'
import './x-item.js'

customElements.define('x-app', class extends XRenderElement {
  static get props() {
    return {
      path: null
    }
  }

  xInit() {
    this.updateVisiblePage();
    this._boundPopstateHandler = this.updateVisiblePage.bind(this);
  }

  xPreRender() {
    const itemMatch = /^\/item\/(\d*)/.exec(this.path);
    if (itemMatch) {
      this._selectedView = 'item';
      this._itemId = itemMatch[1];
      return;
    }
    switch (this.path) {
      case '/':
      case '/news':
      case '/newest':
      case '/show':
      case '/ask':
      case '/jobs':
        this._selectedView = 'list';
        this._listPath = this.path.slice(1) || 'news';
        return;
    }
    this._selectedView = '';
  }

  xRender() {
    this.classList.toggle('list-view', this._selectedView === 'list');
    this.classList.toggle('item-view', this._selectedView === 'item');
    this.innerHTML = `<x-header></x-header><x-list-view></x-list-view><x-item></x-item>`;
  }

  xSetChildrenData() {
    this._listElement = this.querySelector('x-list-view');
    this._itemElement = this.querySelector('x-item');

    if (this._selectedView === 'item') {
      this._itemElement.itemId = this._itemId;
    } else if (this._selectedView === 'list') {
      this._listElement.path = this._listPath;
    }
  }

  xAddEventListeners() {
    this.addEventListener('click', this.clickHandler);
    window.addEventListener('popstate', this._boundPopstateHandler);
  }

  /**
   * Display the appropriate view based on the URL.
   */
  updateVisiblePage() {
    this.path = window.location.pathname;
  }

  /**
   * A simple click handler for unmodified left-clicks on anchor tags.
   */
  clickHandler(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey) {
      return;
    }

    let element = event.target;
    while (element !== this) {
      if (element.tagName === 'A' && element.href.indexOf(window.location.origin) === 0) {
        event.preventDefault();
        window.history.pushState(null, '', element.href);
        this.updateVisiblePage();
        return;
      }
      element = element.parentNode;
    }
  }
});
