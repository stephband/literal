
import { register } from '../modules/library.js';
import Observer, { mutations } from '../modules/observer.js';
import { defaults } from '../data/location.js';

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

function Route(base, path, route, captures) {
    this.base       = base;
    this.path       = path;
    this.route      = route;

    var n = -1;
    while(captures[++n] !== undefined) {
        this['$' + n] = captures[n];
    }
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
    const string = location.route;

    //let { route } = data;

    // Loop through regexes until a match is captured
    var regexp, captures, n = -1;

    while(
        (regexp = regexps[++n]) && 
        !(captures = regexp.exec(string))
    ); // Semicolon important here, don't remove or next code counted as while block

    // Ignore unmatching handlers
    if (!captures) {
        console.log('NO   route should be undefined', route)
        return route;
        //m.stop();
        //data.mutations && data.mutations.stop();
        //data.route = undefined;
        //data.mutations = undefined;
        //return data;
    }

    const key  = keys[n];
    const path = captures.input.slice(0, captures.index + captures[0].length);
    const name = captures.input.slice(captures.index + captures[0].length);

    // Where .base and .path have not changed, .route must have changed
    // and params, identifier and state may have changed, so we update the 
    // existing route and notify as route
    if (route && route.base === base && route.path === path) {
        console.log('OLD ROUTE (I think this is impossible now)');
        //route.route = name;
        return route;
    }

    // Start of route group ***
    //if (DEBUG) { console.group('route ' + path); }

    //data.mutations && data.mutations.stop();

    // Create a new route object
    route = new Route(base, path, name, captures);

route.pk = ++pk;
console.log('new Route()', pk, base, path, name);
    // Update params, id, state. Reading these properties should not alert the
    // template renderer to rerender if they change, as we are about to observe
    // them independently, so use the location observer's target object
    const target = Observer.target(location);
    route.params = target.params;
    route.id     = target.id;
    route.state  = target.state;

    const scope = Observer(route);

    // Kill everything when route changes, which we know will cause a rerender...
    // what if something else causes a rerender? Ooooh.
    const m1 = Observer.sets(location, (prop) => {
        if (prop === 'route') {
console.log('STOP route ', route.pk, base, path, name);
            m1.stop();
            m2.stop();
            //data.mutations && data.mutations.stop();
            //data.route = undefined;
            //data.mutations = undefined;
            //if (DEBUG) { console.groupEnd(); }
        }
    });

    const m2 = mutations('params id state', location, (names) => {
//console.log('Route mutated', names, route.pk);
        var n = -1, name;
        while ((name = names[++n]) !== undefined) {
            scope[name] = location[name];
        }
    });

    // Call route handler with current context (should be undefined) and scope
    const fn = patterns[key];
    return fn.call(this, scope);
}

export default register('routes', function routes(patterns) {
    const keys    = Object.keys(patterns);
    const regexps = keys.map((pattern) => RegExp(pattern));

    //var internal = {};
    var route;

    function routes(location) {
//console.log('routes()', '\n  ' + Object.keys(patterns).join('\n  '));
        return route = updateRoute(patterns, keys, regexps, location, route /* internal */);
        //return internal.route || undefined;
    }

    // Allow partial application:
    // fn = routes(patterns); fn(route);
    // or
    // routes(patterns, route);
    return arguments.length > 1 ?
        routes(arguments[1]) :
        routes ;
});

window.O = Observer;
window.m = mutations;
