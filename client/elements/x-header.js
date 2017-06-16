import { XRenderElement } from './x-render.js'

customElements.define('x-header', class extends XRenderElement {
  xInit() {
    this.heading = 'My app';
    return Promise.resolve();
  }

  xRenderChildren() {
    this.innerHTML = `
<h1><a href="/">${this.heading}</a></h1>
<a href="/news">news</a>
<a href="/newest">new</a>
<a href="/show">show</a>
<a href="/ask">ask</a>
<a href="/jobs">jobs</a>`;
  }
});
