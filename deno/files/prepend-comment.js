export default function prependComment(source, target, string) {
    return (target.endsWith('.css') || target.endsWith('.js')) ?
        '/* Literal template "' + source + '" */\n' + string.replace(/^\s*, ''/) :
    target.endsWith('.html') ?
        string.replace(/^\s(\<\!DOCTYPE html\>)?/, ($0, doctype) =>
            (doctype ? doctype + '\n' : '') +
            '<!-- Literal template "' + source + '" -->\n'
        ) :
    string ;
}
