
import noop from '../../fn/modules/noop.js';

const colors = {
    'aqua':   '#00a8a9',
    'green':  '#d8cd17',
    'yellow': '#eac60c',
    'orange': '#ffa000',
    'red':    '#ff003a',
    'grey':   '#81868f'
};

let grouped = false;

export const log = DEBUG ?
    function log($1, $2, color = '#d8cd17') {
        console.log((grouped ? '%c      %c' : '%cLiteral %c') + $1 + ' %c' + $2,
            'color: ' + (colors.grey) + '; font-weight: 300;', 
            'color: ' + (colors[color] || color) + '; font-weight: 300;', 
            'color: ' + (colors.grey) + '; font-weight: 300;'
        );
    } :
    noop ;

export const group = DEBUG ?
    function log($1, $2, color = '#d8cd17') {
        console.group((grouped ? '%c      %c' : '%cLiteral %c') + $1 + ' %c' + $2,
            'color: ' + (colors.grey) + '; font-weight: 600;', 
            'color: ' + (colors[color] || color) + '; font-weight: 300;', 
            'color: ' + (colors.grey) + '; font-weight: 300;'
        );
        grouped = true;
    } :
    noop ;

export const groupCollapsed = DEBUG ?
    function log($1, $2, color = '#d8cd17') {
        console.groupCollapsed((grouped ? '%c      %c' : '%cLiteral %c') + $1 + ' %c' + $2,
            'color: ' + (colors.grey) + '; font-weight: 600;', 
            'color: ' + (colors[color] || color) + '; font-weight: 300;', 
            'color: ' + (colors.grey) + '; font-weight: 300;'
        );
        grouped = true;
    } :
    noop ;

export const groupEnd = DEBUG ?
    function() {
        console.groupEnd();
        grouped = false;
    } :
    noop ;
