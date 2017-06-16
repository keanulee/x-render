import { XRenderElement } from './x-render.js'

customElements.define('x-list-item', class extends XRenderElement {
  static get props() {
    return {
      data: String
    }
  }

  xRenderChildren() {
    this.innerHTML = `
<a href="${this.data.url}">${this.data.title}</a>
<a href="/item/${this.data.id}">${this.data.comments_count} comments</a>`;
  }
});
