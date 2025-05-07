
import cache         from 'fn/cache.js';
import create        from 'dom/create.js';
import { parseHTML } from 'dom/parse.js';
import Template      from './template.js';

function toMimetype(contentType) {
    // Get mimetype from Content-Type
    const contentType = response.headers.get('Content-Type');
    if(!contentType) { return; }
    // Hoik off any parameters
    return contentType.replace(/\;.*$/, '');
}

function respond(response) {
    if (!response.ok) {
        throw new Error(`Literal failed to fetch template – ${response.status}`);
    }

    // Get mimetype from content type
    const contentType = response.headers.get('Content-Type');
    const mimetype = toMimetype(contentType);
    if (mimetype !== 'text/html') {
        throw new Error(`Literal template response has mimetype ${ mimetype } but requires text/html`);
    }

    return response.text();
}

export default cache((url) => {
    return fetch(url)
    .then(respond)
    .then((text) => {
        // Is it a document?
        const fragment = /^\s*<!DOCTYPE html>/.test(text) ?
            parseHTML(text) :
            create('fragment', text) ;

        // If the URL has a fragment identifier, search for element with that id
        const location = new URL(url, window.location);
        const element = location.hash ?
            fragment.querySelector(location.hash) :
            fragment ;

        return Template.from(url, fragment);
    });
});
