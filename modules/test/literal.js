
import run, { done as onDone } from 'fn/test.js';
import Data    from 'fn/data.js';
import Literal from '../literal.js';

// Expose totals on documentElement and log error if any test fails
onDone((totals) => {
    document.documentElement.dataset.testResults = JSON.stringify(totals);
    if (totals.fail) console.error('Literal test failures:', totals);
});


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

run('Literal.create("#id", element, { a, b })', [
    'a: 1 b: 2',
    'a: 3 b: 2',
    'a: 3 b: 4'
], (test, done) => {
    const element  = document.getElementById('parent-3');
    const object   = { a: 1, b: 2 };
    const renderer = Literal.create('#test-template-3', object, { element });
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

run('Literal.create("#id", element, { object { a, b } })', [
    'a: 1 b: 2',
    'a: 3 b: 2',
    'a: 3 b: 4'
], (test, done) => {
    const element  = document.getElementById('parent-4');
    const object   = { object: { a: 1, b: 2 } };
    const renderer = Literal.create('#test-template-4', object, { element });
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

run('Literal.create("#id", element, { array [{ a, b }, { a, b}] })', [
    'a: 1 b: 2\n    \n        a: 3 b: 4',
    'a: 3 b: 4', true,
    'a: 5 b: 6\n    \n        a: 3 b: 4', true,
    'a: 5 b: 6\n    \n        a: 7 b: 4',
    ''
], (test, done) => {
    const element  = document.getElementById('parent-5');
    const object   = { array: [{ a: 1, b: 2 }, { a: 3, b: 4 }] };
    const renderer = Literal.create('#test-template-5', object, { element });
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
                // Test moved object/renderer is still live
                data.array[1].a = 7;
                requestAnimationFrame(() => {
                    test(element.textContent.trim());
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
});

run('<template consts>', [
    '0'
], (test, done) => {
    const element  = document.getElementById('parent-6');
    const object   = { thing: 0 };
    const renderer = Literal.create('#test-template-6', object, { element });
    const data     = Data(object);

    element.appendChild(renderer.fragment);

    // Test data array
    requestAnimationFrame(() => {
        test(element.textContent.trim());
        requestAnimationFrame(done);
    });
});

run('include() minimal DOM moves on shift, move-to-front, and reverse', [
    '1,2,3,4',
    // After shift: only 1 removed, 0 nodes re-inserted, surviving <p>s identical
    '2,3,4', true, true, true, 0,
    // After move last to front [4,2,3]: 2 and 3 untouched (only 1 <p> moved)
    '4,2,3', true, true, true, 1,
    // After reverse [3,2,4]: all <p>s preserved and still live to mutations
    '3,2,4', true, true, true,
    '3,2,99'
], (test, done) => {
    const element  = document.createElement('div');
    element.id     = 'parent-7';
    document.body.appendChild(element);

    const items    = [{ a: 1, b: 0 }, { a: 2, b: 0 }, { a: 3, b: 0 }, { a: 4, b: 0 }];
    const object   = { array: items };
    const renderer = Literal.create('#test-template-5', object, { element });
    const data     = Data(object);

    element.appendChild(renderer.fragment);

    // Helper to read `a` values from rendered <p> elements
    const readA = () => Array.from(element.querySelectorAll('p'))
        .map((p) => p.textContent.trim().split(/\s+/)[1])
        .join(',');

    // Count <p> element additions via MutationObserver
    let addedPs = 0;
    const observer = new MutationObserver((records) => {
        for (const r of records) {
            for (const n of r.addedNodes) {
                if (n.nodeName === 'P') ++addedPs;
            }
        }
    });
    observer.observe(element, { childList: true });

    requestAnimationFrame(() => {
        test(readA());
        const [, p2, p3, p4] = element.querySelectorAll('p');

        // Shift front item: surviving <p>s must NOT be detached/re-inserted
        addedPs = 0;
        data.array.shift();
        requestAnimationFrame(() => {
            // Flush pending mutation records synchronously
            for (const r of observer.takeRecords()) {
                for (const n of r.addedNodes) if (n.nodeName === 'P') ++addedPs;
            }
            const ps = element.querySelectorAll('p');
            test(readA());
            test(ps[0] === p2);
            test(ps[1] === p3);
            test(ps[2] === p4);
            test(addedPs);

            // Move last item (4) to front: only 1 <p> should move in DOM
            addedPs = 0;
            const lastItem = data.array.pop();
            data.array.unshift(lastItem);
            requestAnimationFrame(() => {
                for (const r of observer.takeRecords()) {
                    for (const n of r.addedNodes) if (n.nodeName === 'P') ++addedPs;
                }
                const ps2 = element.querySelectorAll('p');
                test(readA());
                test(ps2[0] === p4);
                test(ps2[1] === p2);
                test(ps2[2] === p3);
                test(addedPs);

                // Reverse [4,2,3] -> [3,2,4]: all <p>s preserved
                data.array.reverse();
                requestAnimationFrame(() => {
                    const ps3 = element.querySelectorAll('p');
                    test(readA());
                    test(ps3[0] === p3);
                    test(ps3[1] === p2);
                    test(ps3[2] === p4);

                    // Verify moved child renderer is still reactive
                    data.array[2].a = 99;
                    requestAnimationFrame(() => {
                        test(readA());
                        observer.disconnect();
                        requestAnimationFrame(done);
                    });
                });
            });
        });
    });
});
