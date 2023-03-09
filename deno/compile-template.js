
import read    from './read.js';
import compile from './compile.js';
import library, { prependComment } from './library.js';
import { rewriteURLs } from './url.js';

/**
compileTemplate(source, target, data)
**/

export default function compileTemplate(source, target, debug) {
    // Declare DEBUG in template scope
    library.DEBUG = debug;

    return read(source)
    .then((template) => {
        const include  = (url, data) => library.include(source, target, url, data);
        const imports  = (url)       => library.imports(source, target, url);
        const comments = (...urls)   => library.comments(source, target, ...urls);
        const renderer = {
            source: source,
            render: compile(library, 'data, include, imports, comments', template, source)
        };

        return (data) => renderer
            .render(data, include, imports, comments)
            .then(library.DEBUG ?
                (text) => prependComment(source, target, rewriteURLs(source, target, text)) :
                (text) => rewriteURLs(source, target, text)
            );
    })
    .catch((e) => {
        e.message += ' in template ' + source.replace(Deno.cwd() + '/', '');
        throw e;
    });
}
