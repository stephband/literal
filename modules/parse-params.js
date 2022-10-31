import capture from '../../fn/modules/capture.js';


/**
parseParams(array, string)
**/

//                                  1         2              3
//                                  name …    ...            ,
const parseParam = capture(/^\s*(?:([\w]+|…)|(\.\.\.))\s*(?:(,)|\))|^\s*\)/, {
    // param or …
    1: function(params, tokens) {
        params.push(tokens[1]);
        return params;
    },

    // ...
    2: function(params, tokens) {
        // Turn three dots into a proper ellipsis character
        params.push('…');
        return params;
    },

    3: (params, tokens) => parseParam(params, tokens)
});

export function parseParams(string) {
    //console.log(1, string);
    return parseParam([], string);
}
