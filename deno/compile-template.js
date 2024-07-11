
import read    from './read.js';
import compile from './compile.js';
import include from './include.js';
import * as cope from './scope.js';
import { rewriteURLs } from './url.js';


/**
compileTemplate(src, target, data)
**/

export default (src, debug) => read(src)
    .then((template) => {
        const renderer = {
            filepath: src,
            render:   compile(library, 'request, data, routeparams, include, comments', template, src)
        };

        return (request, data, routeparams) => renderer
            .render(request, data, routeparams,
                // include(url, data)
                (url, data) => include(src, url, request, data, routeparams),
                // comments(...urls)
                (...urls)   => library.comments(src, request.url, ...urls)
            )
            .then(library.DEBUG ?
                (text) => scope.prependComment(src, request.url, rewriteURLs(src, request.url, text)) :
                (text) => rewriteURLs(src, request.url, text)
            );
    })
    .catch((e) => {
        e.message += ' in template ' + src.replace(Deno.cwd() + '/', '');
        throw e;
    });
