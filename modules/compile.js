import compileNode from './compile/compile-node.js';

export default function compile(element, path, message, options) {
    return compileNode([], element, path, message, options);
}
