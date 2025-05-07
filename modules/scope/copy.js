
//import messages from './messages.js';

export default function copy(value) {
    console.log('COPY', value);

    return navigator.clipboard
    .writeText(value)
    /*.then(function() {
        messages.push({
            type: 'pass',
            text: '"' + value + '" copied to clipboard',
            duration: 3
        });
    }, function() {
        messages.push({
            type: 'warn',
            text: 'Link not copied to clipboard. Select it and copy it manually.'
        });
    });*/
}
