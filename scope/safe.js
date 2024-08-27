
import create from 'dom/create.js';

export default function safe(html) {
    return create('fragment', html);
}
