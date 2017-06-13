const express = require('express');
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;


const app = express();


app.get('/', function (req, res) {
  JSDOM.fromFile('client/index.html', { runScripts: 'outside-only' }).then((dom) => {
    dom.window.XRenderElement = class {};
    dom.window.elementRegistry = {};
    dom.window.renderSubtree = function renderSubtree(rootNode) {
      for (let tagName in dom.window.elementRegistry) {
        let elements = rootNode.querySelectorAll(tagName);
        for (let i = 0; i < elements.length; ++i) {
          const el = elements[i];
          el.setAttribute('x-rendered', '');
          dom.window.elementRegistry[tagName].prototype.xRender.call(el);
          renderSubtree(el);
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

    dom.window.renderSubtree(dom.window.document);
    res.send(dom.serialize());
  });
});

app.use('/elements', express.static('elements'));

app.use(express.static('client'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
