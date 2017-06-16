# x-render

x-render is an experiment with server-side rendered Custom Elements (x = cross between server and client). Each `XRenderElement` implements one or more of the life cycle methods defined in [x-render.js](/client/elements/x-render.js).

## Demo

https://x-render.appspot.com/ statically serves the contents of client/index.html, which means the content is rendered exclusively by the client-side library (x-render.js).

https://x-render.appspot.com/news serves a server-rendered version where each rendered element is marked by a `x-rendered` attribute. This attribute is removed by the client-side library (x-render.js), but the DOM is not re-rendered.

## Setup

```
npm i
npm run
```
