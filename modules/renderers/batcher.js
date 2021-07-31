
const renderers = [];
const promise   = Promise.resolve(renderers);
let cued;

function render(renderers) {
    var renderer;
    while (renderer = renderers.shift()) {
        // Call .render() with latest arguments
        renderer.render.apply(renderer, renderer.cuedArguments);
        renderer.cuedArguments = undefined;
    }
    cued = undefined;
}

/** 
cue(renderer, args)
Cues a renderer to be rendered in the next batch with latest args. If the
renderer is already cued args are replaced with latest args.
**/

export function cue(renderer, args) {
    renderer.cuedArguments = args;

    if (!cued) {
        cued = promise.then(render);
        renderers.push(renderer);
    }
    else if (!renderers.includes(renderer)) {
        renderers.push(renderer);
    }

    return cued;
}

/** 
uncue(renderer)
Removes renderer from the render queue.
**/

export function uncue(renderer) {
    if (!renderers.length) { return; } 
   
    const i = renderers.indexOf(renderer);
    if (i === -1) { return; }
    renderers.splice(i, 1);
    renderer.cuedArguments = undefined;
}
