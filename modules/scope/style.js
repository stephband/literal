
export default function style(element, name) {
    return getComputedStyle(element).getPropertyValue(name);
}
