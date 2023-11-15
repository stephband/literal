
/*
Parse files for documentation comments
*/

import capture from '../../fn/modules/capture.js';
import noop    from '../../fn/modules/noop.js';
import slugify from '../../fn/modules/slugify.js';

import { parseString } from './parse-string.js';
import { parseParams } from './parse-params.js';
import parseMarkdown   from '../deno/parse-markdown.js';


const parseParensClose = capture(/^\)\s*/, {}, null);

/**
parseComment(string)
Where a documentation comment is found, returns a token object of the form:

```
{
    id:           unique id for this token object
    type:         type of comment, one of `'attribute'`, `'constructor'`,
                  `'element'`, `'function'`, `'method'`, `'part'`, `'property'`,
                  `'selector'`, `'string'`, `'text'`, `'var'`
    name:         name of attribute, property, function, element or class
    title:
    postfix:      syntax characters that follow declaration
    defaultValue: default value
    params:       where `type` is `'method'` or `'function'`, list of parameters
    body:         body of comment, code highlighted
    examples:     array of html code examples found in comment body, unhighlighted
}
```
**/

const ids = {};

function createId(string) {
    if (ids[string] === undefined) {
        ids[string] = 0;
        return string;
    }
    else {
        ++ids[string];
        return string + '-' + ids[string];
    }
}

//                              1                                        2        3
//                              .class element attribute=" :pseudo()     ,newline ,
const parseSelector = capture(/^([\w\d:.[][\w\d:\-[\]="' …>+().]+)(?:,\s*(\n)\s*|,(\s*))?/, {
    // Class, element, attribute, pseudo selector
    1: (selector, captures) => selector + captures[1],
    // Comma new lines, stripping extra whitespace
    2: (selector, captures) => parseSelector(selector + ',\n', captures),
    // Comma spaces, preserving whitespace
    3: (selector, captures) => parseSelector(selector + ',' + captures[3], captures),
    // Doesn't parse
    catch: (selector, captures) => console.log('Parse selector undefined: ', captures.input.slice(0, 18))
});

//                                        1           2      3            4
const parsePropertyToSelector = capture(/^(,\s*\n\s*)|(,\s*)|(\s*[>+]\s*)|(-)/, {
    // Comma and new lines, stripping spaces
    1: (selector, captures) => selector + ',\n',
    // Comma and whitespace
    2: (selector, captures) => selector + captures[2],
    // Child or sibling selector
    3: (selector, captures) => selector + captures[3],
    // The rest of a class selector
    4: (selector, captures) => selector + captures[4],
    // Continue parsing
    done: parseSelector,
    // Compound selector
    catch: parseSelector
});

//                            1             2       3         4          5
//                            word          (       =         line       anything else
const parseDotted = capture(/^(\w[\w\d]*)(?:(\(\s*)|(\s*=\s*)|(\s*\n\s*)|(\s*))/, {
    // If it is .xxx it could be a property or selector
    1: (data, captures) => {
        data.name = captures[1];
        return data;
    },

    // Is it a method
    2: (data, captures) => {
        data.type   = 'method';
        data.params = parseParams(captures);
        return data;
    },

    // Is it a property with a default value
    3: (data, captures) => {
        data.type   = 'property';
        // TODO
        //data.default = parseValue(captures);
        return data;
    },

    // Fudge. Could be a property without a default value, could be a class
    // selector. This is dependent on context, and we retype this particular
    // type later depending on file extension.
    4: (data, captures) => {
        //data.name = '.' + data.name;
        data.type = 'property|selector';
        return data;
    },

    5: (data, captures) => {
        // Is it a selector
        const selector = parsePropertyToSelector('.' + data.name, captures);

        if (!selector) {
            throw new Error('Failed to parse .name ' + captures.input.slice(0, 18));
        }

        data.type = 'selector';
        data.name = selector;
        return data;
    }
});

//                             1                   2       3    4                               5
//                             attribute =     |   N       n    ame     .method                 (   |Title
const parseName = capture(/^(?:([\w-:]+)\s*=\s*|(?:([A-Z])|(\w))([\w\d]*(?:\.[\w\d]+)*)\s*\(\s*|([A-Z](?:[^\n]|,\s*)*))\s*/, {
    // name="value" name='value' name=value
    1: (data, captures) => {
        if (captures[1] === 'slot') {
            data.type = 'slot';
            data.name = parseString(captures);
        }
        else {
            data.type    = 'attribute';
            data.name    = captures[1];
            data.defaultValue = parseString(captures);
        }

        return data;
    },

    // Constructor
    2: (data, captures) => {
        data.type   = 'constructor';
        data.name   = captures[2] + captures[4];
        data.params = parseParams(captures);
        return data;
    },

    // function
    3: (data, captures) => {
        data.type   = 'function' ;
        data.name   = captures[3] + captures[4];
        data.params = parseParams(captures);
        return data;
    },

    // Title (begins with a capital and continues until newline that is not
    // preceded by a comma)
    5: (data, captures) => {
        data.type = 'text';
        data.name = captures[5];
        return data;
    },

    catch: (data, captures) => {
        const selector = parseSelector('', captures);

        if (!selector) {
            throw new Error('Failed to parse name ' + captures.input.slice(0, 18));
        }

        data.type = 'selector';
        data.name = selector;
        return data;
    }
});

//                             1                        2    3    4             5   6   7   8
//                             indent                   .    --   ::part(       "   '   <   word
const parseComment = capture(/([^\S\r\n]*)\/\*\*+\s*(?:(\.)|(--)|(::part\()\s*|(")|(')|(<)|(\b))/, {
    // New data object
    0: function(nothing, captures) {
        return {
            defaultValue: null,
            //prefix: '',
            title: '',
            indent: captures[1]
        };
    },

    2: parseDotted,

    // CSS Variable (name): (value)
    //           1                 2
    3: capture(/^([\w-]+)(?:\s*:\s*([\w\d-]+))?\s*/, {
        // --variable
        1: (data, captures) => {
            data.type   = 'var';
            data.name   = captures[1];
            return data;
        },

        // --variable: default
        2: (data, captures) => {
            data.defaultValue = captures[2];
            return data;
        },

        catch: function(data) {
            throw new SyntaxError('Invalid --variable');
        }
    }),

    // Part ::part( (name) )
    4: capture(/^([\w-]+)\s*\)\s*/, {
        1: (data, captures) => {
            data.type = 'part';
            data.name = captures[1];
            return data;
        },

        catch: (data, captures) => {
            throw new SyntaxError('Invalid ::part()');
        }
    }),

    // String 'text'
    5: capture(/^([^"]*)"/, {
        1: (data, captures) => {
            data.type = 'string';
            data.name = captures[1];
            return data;
        },

        catch: function(data) {
            throw new SyntaxError("Unclosed 'string");
        }
    }),

    // String "text"
    6: capture(/^([^']*)'/, {
        1: (data, captures) => {
            data.type = 'string';
            data.name = captures[1];
            return data;
        },

        catch: function(data) {
            throw new SyntaxError('Unclosed "string');
        }
    }),

    // Element <tag>
    7: capture(/^(\w[^>]*)>/, {
        // Element name
        1: (data, captures) => {
            data.type = 'element';
            data.name = captures[1];
            return data;
        },

        catch: function(data) {
            throw new SyntaxError('Invalid <tag>');
        }
    }),

    // attribute="", key:, Constructor(, function(, Title or selector
    8: parseName,

    //                 1 all until **/
    done: capture(/^\s*([\s\S]*?)\*+\//, {
        1: (data, captures) => {
            data.examples = [];

            // Strip indentation from body before processing as Markdown
            const body = data.indent ?
                captures[1].replaceAll('\n' + data.indent, '\n') :
                captures[1] ;

            data.body = parseMarkdown(body);

            return data;
        },

        done: (data, captures) => {
            // TODO params?
            data.id = createId(data.type + '-' + slugify(data.name) + (data.params ? '' : ''));
            return data;
        }
    }),

    // Return undefined where no (more) comments found
    catch: noop
}, null);


/**
parseComments(string)
Parses documentation comments out of JS or CSS files.
**/

export default capture(/^/, {
    // We use capture here to guarantee a captures object
    0: (nothing, captures) => [],
    done: (comments, captures) => {
        let comment;
        while ((comment = parseComment(captures))) {
            comments.push(comment);
        }
        return comments;
    }
}, null);
