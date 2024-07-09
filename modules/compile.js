import compileNode from './compile/compile-node.js';

/**
compile(node, message, options)
Compiles a DOM node to an array of objects containing data about render targets,
of the form:

```js
{ Renderer, fn, path, name }
```
**/

export default function compile(node, message, options) {
    return compileNode([], node, '', message, options);
}
