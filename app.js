const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const rollup = require('rollup');
const rollupPluginUglify = require('rollup-plugin-uglify');
const uglify = require('uglify-es');
const compression = require('compression');
const LRU = require('lru-cache');
const cache = LRU({
  max: 100,
  maxAge: 5 * 60 * 1000
});


let bundledCode;

rollup.rollup({
  entry: 'client/elements/x-app.js',
  plugins: [
    rollupPluginUglify({}, uglify.minify)
  ]
}).then((bundle) => {
  const result = bundle.generate({ format: 'es' });
  bundledCode = result.code;
});


async function getCachedResponse(req, res, createResponse) {
  let content = cache.get(req.originalUrl);
  if (!content) {
    content = await createResponse();
    cache.set(req.originalUrl, content);
  }
  return content;
}


const app = express();
app.use(compression());

app.get('/elements/x-app.bundle.js', (req, res) => {
  res.set('Content-Type', 'text/javascript');
  res.send(bundledCode);
});

app.use(express.static('client', { index: false }));

app.get('/api/', async (req, res) => {
  const response = await getCachedResponse(req, res, () => {
    return fetch('https://node-hnapi.herokuapp.com/news')
      .then((response) => response.json());
  });
  res.json(response);
});

app.get('/api/:list', async (req, res) => {
  const response = await getCachedResponse(req, res, () => {
    return fetch('https://node-hnapi.herokuapp.com/' + req.params.list)
      .then((response) => response.json());
  });
  res.json(response);
});

app.get('/api/item/:itemId', async (req, res) => {
  const response = await getCachedResponse(req, res, () => {
    return fetch('https://node-hnapi.herokuapp.com/item/' +  + req.params.itemId)
      .then((response) => response.json());
  });
  res.json(response);
});

app.get('/*', async (req, res) => {
  const pushQuery = req.query.push;
  if (pushQuery) {
    const pushHeaders = [];
    const pushAll = pushQuery.indexOf('all') !== -1;
    if (pushAll || pushQuery.indexOf('style') !== -1) {
      pushHeaders.push('</style.css>;rel=preload;as=style');
    }
    if (pushAll || pushQuery.indexOf('script') !== -1) {
      pushHeaders.push('</elements/x-app.bundle.js>;rel=preload;as=script');
    }
    if (pushAll || pushQuery.indexOf('data') !== -1) {
      pushHeaders.push(`</api${req.path}>;rel=preload`);
    }
    if (pushHeaders.length > 0) {
      res.set('Link', pushHeaders.join(','));
    }
  }

  if ('norender' in req.query) {
    res.sendFile(__dirname + '/client/index.html');
    return;
  }

  const response = await getCachedResponse(req, res, async () => {
    const origin = req.protocol + '://' + req.get('host');
    const jsdomOptions = {
      url: origin + req.originalUrl,
      runScripts: 'outside-only'
    };
    const dom = await JSDOM.fromFile('client/index.html', jsdomOptions);
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
            while (typeof prototype.xPreRender === 'function') {
              Object.getOwnPropertyNames(prototype).forEach((method) => {
                el[method] = klass[method];
              });
              prototype = Object.getPrototypeOf(prototype);
            }

            // TODO: render elements in parallel
            await el.xInit();
            await el.xPreRender();
            await el.xRender();
            await el.xSetChildrenData();
            await renderSubtree(el);
          }
        }
      };
    };
    dom.window.customElements = {
      define: (tagName, c) => {
        if (typeof c.prototype.xPreRender === 'function') {
          dom.window.elementRegistry[tagName] = c;
        }
      }
    };

    dom.window.eval(bundledCode);
    await dom.window.renderSubtree(dom.window.document);
    return dom.serialize();
  });

  res.send(response);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
