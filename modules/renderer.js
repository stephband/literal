
const assign = Object.assign;

/** 
Renderer()
**/

export default function Renderer(fn, path, node, name, update) {
    this.name = name;
    this.node = node;
    this.path = path;
    this.fn   = fn;
    this.update = update;
}

assign(Renderer.prototype, {
    render: function(observer, data) {
        return this.fn(observer, data)
        .then((value) => this.update(this.node, this.name, value));
    }
});
