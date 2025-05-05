
import run     from 'fn/test.js';
import Data    from 'fn/data.js';
import Literal from '../literal.js';


run('Literal.fromTemplate(template, element, data)', [
    'a: 1 b: 2',
    'a: 3 b: 2',
    'a: 3 b: 4'
], (test, done) => {
    const element  = document.getElementById('parent-2');
    const template = document.getElementById('test-template-2');
    const object   = { a: 1, b: 2 };
    const renderer = Literal.fromTemplate(template, object, { element });
    const data     = Data(object);

    element.appendChild(renderer.fragment);

    requestAnimationFrame(() => {
        test(element.textContent.trim());
        data.a = 3;
        requestAnimationFrame(() => {
            test(element.textContent.trim());
            data.b = 4;
            requestAnimationFrame(() => {
                test(element.textContent.trim());
                requestAnimationFrame(done);
            });
        });
    });
});

run('Literal.from("#id", element, { a, b })', [
    'a: 1 b: 2',
    'a: 3 b: 2',
    'a: 3 b: 4'
], (test, done) => {
    const element  = document.getElementById('parent-3');
    const object   = { a: 1, b: 2 };
    const renderer = Literal.from('#test-template-3', object, { element });
    const data     = Data(object);

    element.appendChild(renderer.fragment);

    requestAnimationFrame(() => {
        test(element.textContent.trim());
        data.a = 3;
        requestAnimationFrame(() => {
            test(element.textContent.trim());
            data.b = 4;
            requestAnimationFrame(() => {
                test(element.textContent.trim());
                requestAnimationFrame(done);
            });
        });
    });
});

run('Literal.from("#id", element, { object { a, b } })', [
    'a: 1 b: 2',
    'a: 3 b: 2',
    'a: 3 b: 4'
], (test, done) => {
    const element  = document.getElementById('parent-4');
    const object   = { object: { a: 1, b: 2 } };
    const renderer = Literal.from('#test-template-4', object, { element });
    const data     = Data(object);

    element.appendChild(renderer.fragment);

    requestAnimationFrame(() => {
        test(element.textContent.trim());
        data.object.a = 3;
        requestAnimationFrame(() => {
            test(element.textContent.trim());
            data.object.b = 4;
            requestAnimationFrame(() => {
                test(element.textContent.trim());
                requestAnimationFrame(done);
            });
        });
    });
});

run('Literal.from("#id", element, { array [{ a, b }, { a, b}] })', [
    'a: 1 b: 2\n    \n        a: 3 b: 4',
    'a: 3 b: 4', true,
    'a: 5 b: 6\n    \n        a: 3 b: 4', true,
    ''
], (test, done) => {
    const element  = document.getElementById('parent-5');
    const object   = { array: [{ a: 1, b: 2 }, { a: 3, b: 4 }] };
    const renderer = Literal.from('#test-template-5', object, { element });
    const data     = Data(object);

    element.appendChild(renderer.fragment);

    // Test data array
    requestAnimationFrame(() => {
        test(element.textContent.trim());
        // Get the second paragraph
        const p1 = element.querySelector('p + p');
        // Test content removed from front of array
        data.array.shift();
        requestAnimationFrame(() => {
            test(element.textContent.trim());
            // Get the only paragraph
            const p2 = element.querySelector('p');
            // Has the paragraph been persistent?
            test(p1 === p2);
            // Test content added to front of array
            data.array.unshift({ a: 5, b: 6 });
            requestAnimationFrame(() => {
                test(element.textContent.trim());
                // Get the second paragraph
                const p3 = element.querySelector('p + p');
                // Has the paragraph been persistent?
                test(p1 === p3);
                // Test empty array
                data.array = [];
                requestAnimationFrame(() => {
                    test(element.textContent.trim());
                    requestAnimationFrame(done);
                });
            });
        });
    });
});
