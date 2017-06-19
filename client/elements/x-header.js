import { XRenderElement } from './x-render.js'

customElements.define('x-header', class extends XRenderElement {
  xPreRender() {
    this.heading = 'x-news';
    return Promise.resolve();
  }

  xRender() {
    this.innerHTML = `
<a href="/">${this.heading}</a> |
<a href="/news">news</a> |
<a href="/newest">new</a> |
<a href="/show">show</a> |
<a href="/ask">ask</a> |
<a href="/jobs">jobs</a>`;
  }
});
