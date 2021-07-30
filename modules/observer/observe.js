
import { getTarget } from './observer.js';
import Observable from './observable.js';

/**
observe(path, target)
Returns an Observable of a dot-notation `path` in `target`, with the methods:

```
.each(fn)
.pipe(pushable)
.stop()
```

May also be called with an initial value. Where the value at `path` of `target`
is not strictly equal to initial, the consumer `fn` or `pushable` (you can't 
have both) will be called synchronously when bound.

```
observe(path, target, initial)
.each(fn)
```
**/

export default function observe(path, object, initial) {
    return new Observable(path, getTarget(object), initial);
}
