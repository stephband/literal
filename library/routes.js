
import { Observer, mutations, observe, getTarget } from '../modules/observer.js';
import location, { defaults } from './location.js';
import { log } from '../modules/log.js';

const DEBUG = window.DEBUG && (window.DEBUG === true || window.DEBUG.includes('routes'));

const assign = Object.assign;

let pk = 0;

function stop(stopable) {
    return stopable.stop ?
        stopable.stop() : 
        stopable() ;
}

function stopRoute(route) {
    const stopables = route.stopables;
    if (!stopables) { return; }
    stopables.forEach(stop);
    stopables.length = 0;
}

function Route(base, path, name, params, id, state) {
    this.base   = base;
    this.path   = path;
    this.name   = name;
    this.params = params;
    this.id     = id;
    this.state  = state;

    this.pk = ++pk;
    log('route', this.pk + ' ' + base + ' - ' + path + (name ? ' - ' + name : ''), 'aqua');
}

assign(Route.prototype, {
    params:     defaults.params,
    identifier: defaults.identifier,
    state:      defaults.state,

    done: function() {
        const stopables = this.stopables || (this.stopables = []);
        stopables.push.apply(stopables, arguments);
        return this;
    }
});


/** 
routes(routers, location)
**/

function createRoute(root, base, path, name, params, id, state) {
    // Create a new route object
    const route = new Route(base, path, name, getTarget(params), id, getTarget(state));
    const scope = Observer(route);

    route.done(
        mutations('params id state', root).each((names) => {
            var n = -1, name;
            while ((name = names[++n]) !== undefined) {
                scope[name] = root[name];
            }
        })
    );

    return route;
}

const captureReturn = {};

function capture(regexps, pathname) {
    // Loop through regexes until a match is captured
    var regexp, captures, n = -1;
    while(
        (regexp = regexps[++n]) && 
        !(captures = regexp.exec(pathname))
    ); // Don't remove semicolon or following code is counted as a while block

    captureReturn.index    = captures ? n : undefined ;
    captureReturn.captures = captures;

    return captureReturn;
}

export default function routes(fns) {
    const keys    = Object.keys(fns);
    const regexps = keys.map((pattern) => RegExp(pattern));
    var route, marker;

    function routes(root) {
        root = getTarget(root);
        root = root === window.location ? location : root ;

        const pathnames = observe('name', root, NaN).each((pathname) => {
            // Reading from location means that if route changes the literal is rerendered
            // but if this is a sub route .... ?
            const { index, captures } = capture(regexps, pathname);

            // Ignore unmatching handlers
            if (!captures) {
                route && stopRoute(route);
                route = undefined;
                const dom = document.createTextNode('');
                if (marker) {
                    marker.stop && marker.stop();
                    marker.before(dom);
                    marker.remove();
                }
                marker = dom;
                return;
            }

            const fn   = fns[keys[index]];
            const base = root.base + root.path;
            const path = captures.input.slice(0, captures.index + captures[0].length);
            const name = captures.input.slice(captures.index + captures[0].length);

            // If path has not changed update name and exit
            if (route && path === route.path) {
                Observer(route).name = name;
                return;
            }

            // We want to rerender here
            //route && console.log(route.path + ' STOP', route.pk);
            route && stopRoute(route);
            route = createRoute(root, base, path, name, root.params, root.id, root.state);

            // Call route handler with current context (should be undefined unless 
            // routes() was made a method of an object) and scope, $1, $2, ...
            captures[0] = Observer(route);
            const output = fn.apply(this, captures);
            const dom = typeof output === 'string' ?
                document.createTextNode(output) :
                output ;

            if (marker) {            
                marker.stop && marker.stop();
                marker.before(dom);
                marker.remove();
            }

            marker = dom;
        });

        // The base route, location, is never done. .done() takes an object 
        // with a .stop() method or a function. pathnames has a .stop() method.
        if (root && root.done) {
            root.done(pathnames);
        }

        return marker;
    }

    // Allow partial application:
    // node = routes(patterns, route), or
    // fn = routes(patterns), node = fn(route)    
    return arguments.length > 1 ?
        routes(arguments[1]) :
        routes ;
}
