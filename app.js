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


const app = express();
app.use(compression());

app.get('/elements/x-app.bundle.js', (req, res) => {
  res.set('Content-Type', 'text/javascript');
  res.send(bundledCode);
});

app.use(express.static('client', { index: false }));

app.get('/api/:list', (req, res) => {
  let cached = cache.get(req.originalUrl);
  if (cached) {
    res.json(cached);
    return;
  }

  fetch('https://node-hnapi.herokuapp.com/' + req.params.list)
    .then((response) => response.json())
    .then((json) => {
      cache.set(req.originalUrl, json);
      res.json(json);
    });
});

app.get('/api/item/:itemId', (req, res) => {
  let cached = cache.get(req.originalUrl);
  if (cached) {
    res.json(cached);
    return;
  }

  fetch('https://node-hnapi.herokuapp.com/item/' +  + req.params.itemId)
    .then((response) => response.json())
    .then((json) => {
      cache.set(req.originalUrl, json);
      res.json(json);
    });
});

app.get('/*', (req, res) => {
  if ('norender' in req.query) {
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
        // TODO: push data for specific URL.
        pushHeaders.push('</api/news>;rel=preload');
      }
      if (pushHeaders.length > 0) {
        res.set('Link', pushHeaders.join(','));
      }
    }
    res.sendFile(__dirname + '/client/index.html');
    return;
  }

  let cached = cache.get(req.originalUrl);
  if (cached) {
    if (cached.linkHeaderValue) {
      res.set('Link', cached.linkHeaderValue);
    }
    res.send(cached.html);
    return;
  }

  const origin = req.protocol + '://' + req.get('host');
  const jsdomOptions = {
    url: origin + req.originalUrl,
    runScripts: 'outside-only'
  };
  JSDOM.fromFile('client/index.html', jsdomOptions).then(async (dom) => {
    // jsdom doesn't have fetch, and the fetch library only handles absolute URLs,
    // so we polyfill only what we need here.
    dom.window.fetch = (url) => fetch(origin + url);

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

    const result = {
      linkHeaderValue: null,
      html: dom.serialize()
    };

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
        // TODO: push data for specific URL.
        pushHeaders.push('</api/news>;rel=preload');
      }
      if (pushHeaders.length > 0) {
        result.linkHeaderValue = pushHeaders.join(',');
        res.set('Link', result.linkHeaderValue);
      }
    }

    cache.set(req.originalUrl, result);
    res.send(result.html);
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
