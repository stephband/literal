
import { register } from '../modules/library.js';
import { Observer, mutations, observe, getTarget } from '../modules/observer.js';
import { defaults } from '../data/location.js';
import { log } from '../modules/log.js';

const DEBUG = window.DEBUG && (window.DEBUG === true || window.DEBUG.includes('routes'));

const assign = Object.assign;

/*
function stop(route) {
    //console.trace('stop', distributor);
    const handlers = route.handlers;
    var n = -1;
    var handler;

    while (handler = handlers[++n]) {
        handler.stop && handler.stop();
    }

    // Throw away references to all handlers
    handlers.length = 0;

    // End of route group ***
    if (DEBUG) { console.groupEnd(); }
}
*/

function Route(base, path, name) {
    this.base = base;
    this.path = path;
    this.name = name;
}

assign(Route.prototype, {
    params:     defaults.params,
    identifier: defaults.identifier,
    state:      defaults.state
});

let pk = 0;

function updateRoute(patterns, keys, regexps, location, route) {
    // Reading from location means that if route changes the literal is rerendered
    // but if this is a sub route .... ?
    const base   = location.base + location.path;
    const string = location.name;

    //let { route } = data;

    // Loop through regexes until a match is captured
    var regexp, captures, n = -1;

    while(
        (regexp = regexps[++n]) && 
        !(captures = regexp.exec(string))
    ); // Don't remove semicolon or following code is counted as a while block

    // Ignore unmatching handlers
    if (!captures) { return; }

    const key  = keys[n];
    const path = captures.input.slice(0, captures.index + captures[0].length);
    const name = captures.input.slice(captures.index + captures[0].length);

    // Where .base and .path have not changed, .name must have changed
    // and params, identifier and state may have changed, so we update the 
    // existing route and notify as route
    if (route && route.base === base && route.path === path) {
        console.log('OLD ROUTE (I think this is impossible now)');
        return route;
    }

    // Start of route group ***
    //if (DEBUG) { console.group('route ' + path); }

    //data.mutations && data.mutations.stop();

    // Create a new route object
    route = new Route(base, path, name);
route.pk = ++pk;

    log('route', pk + ' ' + base + ' ' + path + ' ' + name, 'aqua');

    // Update params, id, state. Reading these properties should not alert the
    // template renderer to rerender if they change, as we are about to observe
    // them independently, so use the location observer's target object
    const target = getTarget(location);
    route.params = target.params;
    route.id     = target.id;
    route.state  = target.state;

    const scope = Observer(route);

    // Kill everything when route changes, which we know will cause a rerender...
    // what if something else causes a rerender? Ooooh.
    const m1 = observe('name', location, target.name)
    .each(() => {
log('route ', route.pk + ', ' + base + ', ' + path + ', ' + name, 'orange');
        m1.stop();
        m2.stop();
        //data.mutations && data.mutations.stop();
        //data.route = undefined;
        //data.mutations = undefined;
        //if (DEBUG) { console.groupEnd(); }
    });

    const m2 = mutations('params id state', location)
    .each((names) => {
        var n = -1, name;
        while ((name = names[++n]) !== undefined) {
            scope[name] = location[name];
        }
    });

    // Call route handler with current context (should be undefined unless 
    // routes() was made a method of an object) and scope, $1, $2, ...
    const fn = patterns[key];
    captures[0] = scope;
    return fn.apply(this, captures);
}

export default register('routes', function routes(patterns) {
    const keys    = Object.keys(patterns);
    const regexps = keys.map((pattern) => RegExp(pattern));

    var route;

    function routes(location) {
        return route = updateRoute(patterns, keys, regexps, location, route);
    }

    // Allow partial application:
    // fn = routes(patterns); fn(route);
    // or
    // routes(patterns, route);
    return arguments.length > 1 ?
        routes(arguments[1]) :
        routes ;
});
