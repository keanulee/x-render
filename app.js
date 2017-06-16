const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const rollup = require('rollup');


const app = express();

let rollupCache;

app.get('/elements/x-app.bundle.js', (req, res) => {
  rollup.rollup({
    entry: 'client/elements/x-app.js',
    cache: rollupCache
  }).then((bundle) => {
    rollupCache = bundle;
    const result = bundle.generate({ format: 'es' });
    res.set('Content-Type', 'text/javascript');
    res.send(result.code);
  });
});

app.use(express.static('client'));

app.get('/*', (req, res) => {
  const jsdomOptions = {
    url: req.protocol + '://' + req.get('host') + req.originalUrl,
    runScripts: 'outside-only'
  };
  JSDOM.fromFile('client/index.html', jsdomOptions).then((dom) => {
    // Use rollup since jsdom doesn't do imports
    rollup.rollup({
      entry: 'client/' + dom.window.document.querySelector('script[type=module]').getAttribute('src'),
      cache: rollupCache
    }).then(async (bundle) => {
      rollupCache = bundle;
      const result = bundle.generate({ format: 'es' });

      // jsdom doesn't have fetch :(
      dom.window.fetch = fetch;

      dom.window.elementRegistry = {};
      dom.window.renderSubtree = async function renderSubtree(rootNode) {
        for (let tagName in dom.window.elementRegistry) {
          const elements = rootNode.querySelectorAll(tagName);
          const klass = dom.window.elementRegistry[tagName].prototype;
          for (let i = 0; i < elements.length; ++i) {
            const el = elements[i];
            if (!el.hasAttribute('x-rendered')) {
              el.setAttribute('x-rendered', '');

              // Copy methods up the prototype until XRenderElement.
              let prototype = klass;
              while (typeof prototype.xInit === 'function') {
                Object.getOwnPropertyNames(prototype).forEach((method) => {
                  el[method] = klass[method];
                });
                prototype = Object.getPrototypeOf(prototype);
              }

              // TODO: render elements in parallel
              await el.xInit();
              el.xRenderChildren();
              el.xAssignChildrenData();
              await renderSubtree(el);
            }
          }
        };
      };
      dom.window.customElements = {
        define: (tagName, c) => {
          if (typeof c.prototype.xInit === 'function') {
            dom.window.elementRegistry[tagName] = c;
          }
        }
      };

      dom.window.eval(result.code);

      await dom.window.renderSubtree(dom.window.document);
      res.send(dom.serialize());
    });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
