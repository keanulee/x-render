import { XRenderElement } from './x-render.js'

customElements.define('x-list-view', class extends XRenderElement {
  xInit() {
    return fetch('https://node-hnapi.herokuapp.com/news')
      .then((response) => response.json())
      .then((data) => {
        this.data = data;
      });
  }

  xRender() {
    const ul = document.createElement('ul');
    this.data.forEach((story) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${story.url}">${story.title}</a>`;
      ul.appendChild(li);
    })
    this.appendChild(ul);
  }
});
