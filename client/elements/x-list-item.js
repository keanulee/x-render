import { XRenderElement } from './x-render.js'

customElements.define('x-list-item', class extends XRenderElement {
  static get props() {
    return {
      data: null
    }
  }

  xRender() {
    this.innerHTML = `
<a href="${this.data.url}">${this.data.title}</a>
<a href="/item/${this.data.id}" class="meta">${this.data.comments_count} comments</a>`;
  }
});
