
export default function getTemplate(src) {
    const id          = src.slice(1);
    const template    = document.getElementById(id);

    if (!template) {
        throw new Error('Template ' + src + ' not found');
    }

    return template;
}
