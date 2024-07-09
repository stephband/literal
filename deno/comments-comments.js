

/**
comments(urls)
Parses documentation comments from files. Returns a promise of an array of
comments.
**/

import read            from './read.js';
import { rewriteURLs } from './url.js';
import parseComments   from '../modules/parse/parse-comments.js';
import { getAbsoluteFile } from './scope.js';
import { red, yellow } from './log.js';

export default function comments(source, target, ...urls) {
    return Promise.all(urls.map((path) => {
        const url = path; //getAbsoluteFile(source, path);

        return read(url)
        .then(parseComments)
        .then((comments) => {
            comments.forEach((comment) => {
                // Type property or selector tokens by file extension
                if (comment.type === 'property|selector') {
                    comment.type = /\.js(on)?$/.test(url) ?
                        'property' :
                        'selector' ;
                }

                // Indent lines that start with a word by one space in selectors
                if (comment.type === 'selector') {
                    comment.name = comment.name
                        .replace(/^(\w)/, ($0, $1) => ' ' + $1)
                        .replace(/\n(\w)/, ($0, $1) => '\n ' + $1);
                }

                // Rewrite relative URIs in body and examples
                comment.body = comment.body && rewriteURLs(url, target, comment.body);
                comment.examples.forEach((example, i, examples) => {
                    // Overwrite in place
                    examples[i] = rewriteURLs(url, target, example);
                });
            });

            return comments;
        });
    }))
    .then((comments) => comments.flat())
    .catch((error) => {
        console.log(red + ' ' + yellow + ' ' +  red + ' ' + yellow, 'Import', urls.join(', '), error.constructor.name, error.message, error.stack);
        throw error;
    });
}
