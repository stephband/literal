
/*
config
Configure Literal's behaviour.

```js
    // An event dispatched when Literal updates input values. Default is `false`.
    config.updateEvent = CustomEvent('ping');

    // Run templates in sloppy mode inside a `with(data)` statement, making
    // `${ data.name }` available as simply `${ name }` in a template.
    // Warning: MDN says `with` should be considered deprecated:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with
    // I really don't see how they can remove it, though.
    useWith: false
```
*/

export default {
    // An event dispatched when Literal updates input values. May be false.
    updateEvent: false,
    // Runs templates in sloppy mode inside a `with(data)` statment, making
    // `${ data.name }` available as simply `${ name }` in a template.
    // Warning: MDN says with should be considered deprecated:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with
    // I don't see how anyone can remove it, though.
    useWith: false
}
