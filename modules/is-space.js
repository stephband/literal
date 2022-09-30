const rspaces = /^\s*$/;

export default function isSpace(string) {
    return string === '' || rspaces.test(string);
}
