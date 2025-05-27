
/**
OnRenderer(fn, parameters, element, name, compiled)
Constructs an object responsible for rendering an `onevent` attribute.
**/

export default class OnRenderer {
    constructor(fn, parameters, element, name, compiled) {
        this.compiled   = compiled;
        this.count      = 0;
        this.element    = element;
        this.fn         = fn;
        this.name       = name;
        this.parameters = parameters;

        const type = name.slice(2);
        element.addEventListener(type, this);
        element.removeAttribute(name);
    }

    handleEvent(e) {
        ++this.count;

        const { fn, parameters } = this;
        parameters.e = e;
        // We do nothing with rendered output
        fn(parameters);
    }

    stop() {
        //if (this.stopables) this.stopables.forEach(stop);
        const type = this.name.slice(2);
        this.element.removeEventListener(type, this);
        return super.stop();
    }

    static consts = ['DATA', 'data', 'element', 'shadow', 'host', 'e'];
}
