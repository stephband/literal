
import Observer from '../modules/observer.js';
import location from '../../dom/modules/location.js';

const assign = Object.assign;

export const defaults = {
    search: '',
    params: {},
    hash:   '',
    id:     '',
    json:   'null',
    state:  null
};

// Router scope

const root  = assign({}, defaults);
const scope = Observer(root);


/** 
routes()
**/

const names = [];

function parseParam(string) {
    var value;
    return string === '' ? '' :
        string === 'null' ? null :
        string === 'true' ? true :
        string === 'false' ? false :
        // Number string to number
        ((value = Number(string)) || value === 0) ? value :
        // Comma delimited string to array
        ((value = string.split(/\s*,\s*/)) && value.length > 1) ? value.map(parseParam) :
        // Yer basic string
        string ;
}

function fromEntries(entries) {
    // Keep a note of what state each param is in: single, multiple or 
    // undefined (unparsed)
    const state  = {};
    const object = {};
    var key, value;

    for([key, value] of entries) {
        if (state[key] === 'multiple') {
            // Values have already been got, ignore
        }
        else if (state[key] === 'single') {
            // As soon as we encounter a second instance of key, get all values 
            // for key. We flatMap to accomodate the case where a single value 
            // is parsed as an array, ie ?v=a&v=b,c ... although I'm not convinced 
            // we should be supporting nonstandard ways of representing multiple 
            // values
            object[key] = entries.getAll(key).flatMap(parseParam);
            state[key] = 'multiple';
        }
        else {
            object[key] = parseParam(value);
            state[key] = 'single';
        }
    }

    return object;
}

function updateDataFromLocation(location, history, data) {
    names.length = 0;

    if (location.pathname !== data.pathname) {
        data.pathname = location.pathname;
        data.base  = '/';
        data.path  = '';
        data.route = location.pathname.slice(1);
        names.push('route');
    }

    if (location.search !== data.search) {
        data.search = location.search;
        data.params = location.search ?
            fromEntries(new URLSearchParams(location.search)) :
            defaults.params ;
        names.push('params');
    }

    if (location.hash !== data.hash) {
        data.hash = location.hash;
        data.id   = location.hash.replace(/^#/, '') || defaults.id;
        names.push('id');
    }

    const json = JSON.stringify(history.state);
    if (json !== data.json) {
        data.json  = json;
        data.state = history.state;
        names.push('state');
    }

    return names;
}


/*
const nostate = {
    json:     'null',
    state:    null
};

function updateData(location, data) {
    return typeof location === 'string' ?
        updateDataFromLocation({
            pathname: location.replace(/(?:\?|#).*$/, ''),
            search:   location.replace(/^[^?]* REMOVESPACE /, '').replace(/#.*$/, ''),
            hash:     location.replace(/^[^#]* REMOVESPACE /, '')
        }, nostate, data) :

    // Or the global location object
    location === window.location ?
        updateDataFromLocation(location, window.history, data) :
    
    // Or another URL object
        updateDataFromLocation(location, nostate, data) ;
}
*/

location.on(function(location) {
    const names = updateDataFromLocation(location, window.history, root);
    var n = -1;
    while (names[++n] !== undefined) {
        Observer.notify(names[n], scope);
    }
});

export default scope;
