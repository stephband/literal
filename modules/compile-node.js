
import overload   from '../../fn/modules/overload.js';
import { toType } from '../../dom/modules/node.js';

import library from '../../bolt/literal/modules/lib.js';
import { compileStringRender, compileValueRender } from '../../bolt/literal/modules/compile.js';
import log     from '../../bolt/literal/modules/log-browser.js';
import decode  from '../../bolt/literal/modules/decode.js';

const DEBUG = window.DEBUG === true;

function compileBoolean(renderers, vars, node, name) {
    const string = node.getAttribute(name);
    node.removeAttribute(name);
    if (string && /\$\{/.test(string)) {
        const render = compileValueRender(library, vars, string, 'arguments[1]');
        renderers.push((...params) => 
            render(...params)
            .then((value) => {
                if ((!!value) === node[name]) { return 0; }
                // Mutate DOM
                node[name] = !!value;
                // Return number of mutations
                return 1;
            })
        );
    }
}

function compileToken(renderers, vars, node, name) {
    const string = node.getAttribute(name);

    if (string && /\$\{/.test(string)) {
        const render = compileValueRender(library, vars, string, 'arguments[1]');
        renderers.push((...params) => 
            render(...params)
            .then((value) => {
                if (value === node.getAttribtue(name)) { return 0; }
                // Mutate DOM
                node.setAttribute(name, value);
                // Return number of mutations
                return 1;
            })
        );
    }
}

function compileValue(renderers, vars, node) {
    const string = node.value;

    if (string && /\$\{/.test(string)) {
        const render = compileStringRender(library, vars, string, 'arguments[1]');
        renderers.push((...params) => 
            render(...params)
            .then((value) => {
                if (value === node.value) { return 0; }
                // Mutate DOM
                node.value = value;
                // Return number of mutations
                return 1;
            })
        );
    }
}

function compileTextContent(renderers, vars, node) {
    const string = node.textContent;

    if (string && /\$\{/.test(string)) {
        const render = compileStringRender(library, vars, decode(string), 'arguments[1]');
        renderers.push((...params) =>
            render(...params)
            .then((value) => {
                if (value === node.textContent) { return 0; }
                // Mutate DOM
                node.textContent = value;
                // Return number of mutations
                return 1;
            })
        );
    }
}

function compileChildren(renderers, vars, node, Literal) {
    const children = node.childNodes;

    if (children) {
        let n = -1;
        while(children[++n]) {
            compileNode(renderers, vars, children[n], Literal);
        }
    }
}

const compileNode = overload((renderers, vars, node) => toType(node), {
    'element': (renderers, vars, node, Literal) => {
        if (node.tagName.toLowerCase() === 'include') {
            const id       = node.getAttribute('src').replace(/^#/, '');
            const template = document.getElementById(id);           
            const render   = Literal(template);

            log('include', node.getAttribute('src'), 'yellow');

            renderers.push(function first(data) {
                // Splice render in place of first
                const i = renderers.indexOf(first);
                
                // Replace first render function with template render
                renderers.splice(i, 1, render);

                // Render and replace include node with rendered dom
                return render.apply(this, arguments).then((nodes) => {
                    const count = nodes.length;
                    node.after(...nodes);
                    node.remove();

                    // Return DOM mutation count
                    return count;
                });
            });

            return renderers;
        }

        compileBoolean(renderers, vars, node, 'hidden');
        compileValue(renderers, vars, node);
        compileChildren(renderers, vars, node, Literal);
        return renderers;
    },

    'fragment': (renderers, vars, node, Literal) => {
        compileChildren(renderers, vars, node, Literal);
        return renderers;
    },

    'text': (renderers, vars, node) => {
        compileTextContent(renderers, vars, node);
        return renderers;
    },

    'default': (renderers, vars, node) => {
        throw new Error('Not a node');
    }
});

export default compileNode;
