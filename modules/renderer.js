
const assign = Object.assign;

/** 
Renderer()
Base class for providing renderers with the properties `{ node, path, fn, name }`
and a generic `.render(observer, data)` method.
**/

export default function Renderer(fn, path, node, name) {
    this.node = node;
    this.path = path;
    this.fn   = fn;
    this.name = name;
}

assign(Renderer.prototype, {
    render: function(observer, data) {
        return this
        .fn(observer, data)
        .then(this.update);
    }
});
