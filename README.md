# x-render

x-render is an experiment with server-side rendered Custom Elements (x = cross between server and client). Each `XRenderElement` is defined in the top level elements/ directory and has a `xRender()` method.

```
npm i
npm run
```

http://localhost:3000/index.html statically serves the contents of client/index.html, which means the content is rendered exclusively by the client-side library (x-render.js).

http://localhost:3000/ serves a server-rendered version where each rendered element is marked by a `x-rendered` attribute. This attribute is removed by the client-side library (x-render.js), but the DOM is not re-rendered.
