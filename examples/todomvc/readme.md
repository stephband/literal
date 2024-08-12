# Literal • [TodoMVC](http://todomvc.com)

> Official description of the framework (from its website)


## Resources

- [Website]()
- [Documentation]()
- [Used by]()
- [Blog]()
- [FAQ]()

### Articles

- [Interesting article]()

### Support

- [Stack Overflow](http://stackoverflow.com/questions/tagged/__)
- [Google Groups]()
- [Twitter](http://twitter.com/__)
- [Google+]()

*Let us [know](https://github.com/tastejs/todomvc/issues) if you discover anything worth sharing.*


## Implementation

How was the app created? Anything worth sharing about the process of creating the app? Any spec violations?

This implementation of TodoMVC was created using Literal's `<template is="literal-html">`
element. The view/controller logic is contained in two templates in `index.html`, while
the model is exported by `js/app.js`.


demonstrating how
well suited the `literal-html` element is to quick prototyping: import the element, start
writing HTML with literal expressions. Bosh. No `npm` or any building required.

This is not the only way of working with `literal-html`.


The spec says, "when the route changes, the todo list should be filtered on a model level".
This implementation violates that; the filtering is done in the template. This is how the
template knows to track changes to the array.

## Credit

Created by [Stephen Band](http://stephen.band)
