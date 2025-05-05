
import run      from 'fn/test.js';
import Template from '../template.js';

run(
'Template.fromHTML(id, html)',
['#test-from-html', 'DIV', null, '', 3],
(test, done) => {
    const id   = '#test-from-html';
    const html = '<div class="test" attribute="${ attr }">Test ${ name } content <span>${ value }</span></div>';
    const template = Template.fromHTML(id, html);

    test(template.id);
    test(template.content.firstElementChild.tagName);
    test(template.content.firstElementChild.getAttribute('attribute'));
    test(template.content.firstElementChild.textContent.trim());
    test(template.compiled.length);
    done();
});

run(
'Template.fromFragment(id, fragment)',
['#test-from-fragment', 'SPAN', '', 'Static content remains untouched', 1],
(test, done) => {
    const id = '#test-from-fragment';
    const fragment = document.createDocumentFragment();
    const span1  = document.createElement('span');
    span1.textContent = 'Fragment content with ${value}';
    fragment.appendChild(span1);
    const span2  = document.createElement('span');
    span2.textContent = 'Static content remains untouched';
    fragment.appendChild(span2);
    const template = Template.fromFragment(id, fragment);

    test(template.id);
    test(template.content.firstElementChild.tagName);
    test(template.content.firstElementChild.textContent);
    test(template.content.lastElementChild.textContent);
    test(template.compiled.length);
    done();
});

run(
'Template.fromTemplate(template)',
['#test-template-1', 'P', '', 2, true],
(test, done) => {
    const element  = document.getElementById('test-template-1');
    const template = Template.fromTemplate(element);
    const template2 = Template.get('#test-template-1');

    test(template.id);
    test(template.content.firstElementChild.tagName);
    test(template.content.firstElementChild.textContent);
    test(template.compiled.length);
    test(template2 === template);
    done();
});
