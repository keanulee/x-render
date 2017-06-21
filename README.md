# x-render

x-render is an experiment with server-side rendered Custom Elements (x = cross between server and client). Each `XRenderElement` implements one or more of the life cycle methods defined in [x-render.js](/client/elements/x-render.js).

## Demo

https://x-render.appspot.com/?norender statically serves the contents of client/index.html, which means the content is rendered exclusively by the client-side library (x-render.js).

https://x-render.appspot.com/ serves a server-rendered version where each rendered element is marked by a `x-rendered` attribute. This attribute is removed by the client-side library (x-render.js), but the DOM is not re-rendered.

https://x-render.appspot.com/?push=style,script,data will H2 server push the specified assets.

https://x-render.appspot.com/?push=all will H2 server push the specified assets.

## Setup

```
npm i
npm run
```
