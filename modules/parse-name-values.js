import capture from '../../fn/modules/capture.js';
import last    from '../../fn/modules/last.js';

/**
parseNameValues(array, string)

Parses string of the form `"name:value ..."` into an array
of `{ name, value }` objects.

**/

//                                1                 2
const parseNameValues = capture(/^([\w-]+)(?:\s*:\s*(\w+))?\s*;?\s*/, {
    // Name
    1: (namevalues, captures) => {
        namevalues.push({
            name: captures[1]
        });
        return namevalues;
    },

    // Value
    2: (namevalues, captures) => {
        const namevalue = last(namevalues);
        namevalue.value = captures[2];
        return namevalues;
    },

    done: (namevalues, captures) => {
        return captures[0].length < captures.input.length ?
            parseNameValues(namevalues, captures) :
            namevalues ;
    }
});

export default parseNameValues;
