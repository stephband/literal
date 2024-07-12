
export { default as by          } from '../../../fn/modules/by.js';
export { clamp                  } from '../../../fn/modules/clamp.js';
export { default as deg         } from '../../../fn/modules/to-deg.js';
export { default as rad         } from '../../../fn/modules/to-rad.js';
export { default as equals      } from '../../../fn/modules/equals.js';
export { default as matches     } from '../../../fn/modules/matches.js';
export { default as get         } from '../../../fn/modules/get-path.js';
export { default as set         } from '../../../fn/modules/set-path.js';
export { default as slugify     } from '../../../fn/modules/slugify.js';
export { default as normalise   } from '../../../fn/modules/normalise.js';
export { default as denormalise } from '../../../fn/modules/denormalise.js';
export { default as stash       } from './stash.js';

//const library = {

    /** get(path, object)
    Gets the value of `path` in `object`, where `path` is a string in JS
    dot-notation. Where a path does not lead to a value, returns `undefined`:

    ```js
    ${ get('path.to.value', data) }
    ```

    Numbers are accepted as path components:

    ```js
    ${ get('array.0', data) }
    ```
    **/


    /**
    clock(interval)

    If `interval` is a number, returns a stream of DOM timestamps at `interval`
    seconds apart.

    ```js
    ${ clock(1).map(floor) }
    ```

    <template is="literal-html">
        <p>${ clock(1).map(floor) }</p>
    </template>

    If `duration` is `"frame"`, returns a stream of DOM timestamps of animation
    frames.

    ```js
    ${ clock('frame').map((time) => time.toFixed(2)) }
    ```

    <template is="literal-html">
        <p>${ clock('frame').map((time) => time.toFixed(2)) }</p>
    </template>
    **/

//    clock: (duration) => new ClockStream(duration),


//};
