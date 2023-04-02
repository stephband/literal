
// Markdown library
// https://marked.js.org/#/README.md#README.md
import '../libs/marked/marked.min.js';

// Syntax highlighter
// https://prismjs.com/
import '../libs/prism/prism.js';

const options = {
    // GitHub Flavoured Markdown
    gfm: true,

    // Highlight code blocks
    highlight: function(code, lang, callback) {
        return Prism.highlight(code, Prism.languages[lang || 'js'], lang || 'js');
    },

    // Emit self-closing tags
    xhtml: true,

    // Typographic niceties
    smartypants: true
};

export default function(markdown) {
    // If single line of text parse as inline markdown
    return /\n/.test(markdown) ?
        marked.parse(markdown, options) :
        marked.parseInline(markdown, options) ;
}
