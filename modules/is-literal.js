
// Todo: This is a bit of a crude test for literal strings. Surely can be
// improved.

const rliteral = /\$\{/;

export default function isLiteral(string) {
    return string && rliteral.test(string);
}
