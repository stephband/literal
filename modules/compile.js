import compileNode from './compile/compile-node.js';

/**
compile(fragment, options)
compile(fragment, options, debug)
Compiles a DOM node to an array of objects containing data about render targets,
of the form:

```js
{ fn, path, name }
```
**/

export default function compile(node, options, debug) {
    // objects, node, path, options, debug
    return compileNode([], node, '', options, debug);
}
