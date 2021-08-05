
import noop from '../../fn/modules/noop.js';

const colors = {
    'aqua':   '#00a8a9',
    'green':  '#d8cd17',
    'yellow': '#eac60c',
    'orange': '#ffa000',
    'red':    '#ff003a',
    'grey':   '#81868f'
};

export const log = DEBUG ?
    function log($1, $2, color = '#d8cd17') {
        console.log('%cLiteral %c' + $1 + ' %c' + $2,
            'color: ' + (colors.grey) + '; font-weight: 600;', 
            'color: ' + (colors[color] || color) + '; font-weight: 300;', 
            'color: ' + (colors.grey) + '; font-weight: 300;'
        );
    } :
    noop ;

export const group = DEBUG ?
    function log($1, $2, color = '#d8cd17') {
        console.group('%cLiteral %c' + $1 + ' %c' + $2,
            'color: ' + (colors.grey) + '; font-weight: 600;', 
            'color: ' + (colors[color] || color) + '; font-weight: 300;', 
            'color: ' + (colors.grey) + '; font-weight: 300;'
        );
    } :
    noop ;

export const groupEnd = DEBUG ?
    console.groupEnd :
    noop ;
