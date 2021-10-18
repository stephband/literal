
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

export const log = window.DEBUG ?
    function log($1, $2, $3 = '', $4 = '', color = '#d8cd17') {
        console.log((grouped ? '%c      %c' : '%cLiteral %c') + $1 + ' %c' + $2 + ' %c' + $3 + ' %c' + $4,
            'color: ' + (colors.grey) + '; font-weight: 300;', 
            'color: ' + (colors[color] || color) + '; font-weight: 300;', 
            'color: ' + (colors.grey) + '; font-weight: 300;',
            'color: ' + (colors[color] || color) + '; font-weight: 300;', 
            'color: ' + (colors.grey) + '; font-weight: 300;'
        );
    } :
    noop ;

export const group = window.DEBUG ?
    function log($1, $2, color = '#d8cd17') {
        console.group((grouped ? '%c      %c' : '%cLiteral %c') + $1 + ' %c' + $2,
            'color: ' + (colors.grey) + '; font-weight: 600;', 
            'color: ' + (colors[color] || color) + '; font-weight: 300;', 
            'color: ' + (colors.grey) + '; font-weight: 300;'
        );
        grouped = true;
    } :
    noop ;

export const groupCollapsed = window.DEBUG ?
    function log($1, $2, color = '#d8cd17') {
        console.groupCollapsed((grouped ? '%c      %c' : '%cLiteral %c') + $1 + ' %c' + $2,
            'color: ' + (colors.grey) + '; font-weight: 600;', 
            'color: ' + (colors[color] || color) + '; font-weight: 300;', 
            'color: ' + (colors.grey) + '; font-weight: 300;'
        );
        grouped = true;
    } :
    noop ;

export const groupEnd = window.DEBUG ?
    function() {
        console.groupEnd();
        grouped = false;
    } :
    noop ;

export const time = window.DEBUG ?
    function log($1) {
        console.time((grouped ? '      ' : 'Literal ') + $1);
    } :
    noop ;

export const timeEnd = window.DEBUG ?
    function log($1) {
        console.timeEnd((grouped ? '      ' : 'Literal ') + $1);
    } :
    noop ;
