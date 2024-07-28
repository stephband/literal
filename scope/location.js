
import Signal from '../../fn/modules/signal.js';

function stripHash(hash) {
    return hash.replace(/^#/, '');
}

const defaults = {
    search:     '',
    params:     {},
    hash:       '',
    identifier: '',
    state:      null
};

const pathname = Signal.of(window.location.pathname);
const search   = Signal.of(window.location.search);
const hash     = Signal.of(window.location.has);
const href     = Signal.of(window.location.href);
const state    = Signal.of(JSON.stringify(window.history.state));

const location = {
    /** .base **/
    /** .path **/
    base: '/',
    path: '',

    /** .hash **/
    get hash() {
        return hash.value;
    },

    /** .identifier **/
    get identifier() {
        return stripHash(this.hash) || defaults.identifier;
    },

    /** .params **/
    get params() {
        return this.search ?
            Object.fromEntries(new URLSearchParams(this.search)) :
            defaults.params ;
    },

    /** .pathname **/
    get pathname() {
        return pathname.value;
    },

    /** .pathname **/
    get name() {
        return this.pathname.slice(1);
    },

    /** .search **/
    get search() {
        return Object.fromEntries(new URLSearchParams(location.search));
    },

    /** .href **/
    get href() {
        return href.value;
    },

    /** .state **/
    get state() {
        return state.value;
    }
};

export default location;

export function update() {
    // Update signals
    pathname.value = window.location.pathname;
    search.value   = window.location.search;
    hash.value     = window.location.hash;
    href.value     = window.location.href;
    state.value    = JSON.stringify(window.history.state);
}

// Synchronise root location
//update();

// Listen to load and popstate events to notify when navigation has occured
window.addEventListener('popstate', update);
window.addEventListener('DOMContentLoaded', update);

// Clean up empty hash URLs
window.addEventListener('hashchange', function(e) {
    /*
    A `hashchange` is received when:
    - navigation via browser buttons when the hash changes
    - navigation via typing a new hash in the URL bar
    - navigation via history.back() and .forward() when the hash changes
    - location.hash is set to something other than its current value
    */

    const location = window.location;
    const history  = window.history;

    // Detect navigations to # and silently remove the # from the url.
    // Any call to replaceState or pushState in iOS opens the URL bar.
    if (stripHash(location.hash) === '') {
        history.replaceState(history.state, document.title, location.href.replace(/#$/, ''));
    }
});
