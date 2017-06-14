const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;


const app = express();


app.get('/', async function (req, res) {
  JSDOM.fromFile('client/index.html', { runScripts: 'outside-only' }).then(async (dom) => {
    dom.window.fetch = fetch;
    dom.window.XRenderElement = class {
      xInit() {
        // virtual - must return promise that resolves when xRender() can be run.
        return Promise.resolve();
      }

      xRender() {
        // abstract
      }
    };

    dom.window.elementRegistry = {};
    dom.window.renderSubtree = async function renderSubtree(rootNode) {
      for (let tagName in dom.window.elementRegistry) {
        let elements = rootNode.querySelectorAll(tagName);
        let klass = dom.window.elementRegistry[tagName].prototype;
        for (let i = 0; i < elements.length; ++i) {
          const el = elements[i];
          if (!el.hasAttribute('x-rendered')) {
            el.setAttribute('x-rendered', '');
            // TODO: render elements in parallel
            await klass.xInit.call(el).then(() => {
              klass.xRender.call(el);
              renderSubtree(el);
            });
          }
        }
      };
    };
    dom.window.customElements = {
      define: (tagName, c) => {
        if (typeof c.prototype.xRender === 'function') {
          dom.window.elementRegistry[tagName] = c;
        }
      }
    };

    fs.readdirSync('elements').forEach((filename) => {
      dom.window.eval(fs.readFileSync('elements/' + filename, { encoding: 'UTF-8' }));
    });

    await dom.window.renderSubtree(dom.window.document);
    res.send(dom.serialize());
  });
});

app.use('/elements', express.static('elements'));

app.use(express.static('client'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
