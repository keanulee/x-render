import { XRenderElement } from './x-render.js'
import './x-header.js'
import './x-list-view.js'

customElements.define('x-app', class extends XRenderElement {
  xRenderChildren() {
    const itemMatch = /^\/item\/(\d*)/.exec(window.location.pathname);
    if (itemMatch) {
      this.classList.remove('list-view');
      this.classList.add('item-view');
    } else {
      switch (window.location.pathname) {
        case '/':
        case '/news':
        case '/show':
        case '/ask':
        case '/jobs':
          this.classList.add('list-view');
          this.classList.remove('item-view');
      }
    }
    this.innerHTML = `<x-header></x-header><x-list-view></x-list-view><x-item></x-item>`;
  }

  xAssignChildrenData() {
    this._listElement = this.querySelector('x-list-view');
    this._itemElement = this.querySelector('x-item');

    this.updateVisiblePage();
  }

  xAddEventListeners() {
    this.addEventListener('click', this.clickHandler);
    window.addEventListener('popstate', this.updateVisiblePage.bind(this));
  }

  /**
   * Display the appropriate view based on the URL.
   */
  updateVisiblePage() {
    const itemMatch = /^\/item\/(\d*)/.exec(window.location.pathname);
    if (itemMatch) {
      this._itemElement.itemId = itemMatch[1];
      return;
    }
    switch (window.location.pathname) {
      case '/':
      case '/news':
      case '/newest':
      case '/show':
      case '/ask':
      case '/jobs':
        this._listElement.path = window.location.pathname.slice(1) || 'news';
        return;
    }
    this._listElement.path = null;
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
