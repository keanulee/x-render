import { XRenderElement } from './x-render.js'

const template = document.createElement('template');
template.innerHTML = `
<a class="title"></a>
<span></span>
<br>
<span></span> |
<a></a>`;

customElements.define('x-list-item', class extends XRenderElement {
  static get props() {
    return {
      data: null
    }
  }

  xRender() {
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
    this.appendChild(document.importNode(template.content, true));
    this.children[0].href = this.data.url;
    this.children[0].textContent = this.data.title;
    if (this.data.domain) {
      this.children[1].textContent = `(${this.data.domain})`;
    }
    this.children[3].textContent = `${this.data.points} points by ${this.data.user} ${this.data.time_ago}`;
    this.children[4].href = `/item/${this.data.id}`;
    this.children[4].textContent = `${this.data.comments_count} comments`;
  }
});
