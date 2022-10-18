
import { getInternals as Internals } from '../../dom/modules/element.js';

export function addLoading(element) {
    const internals = Internals(element);
    internals.loading = (internals.loading || 0) + 1;
    console.log(internals.loading, element);
}

export function removeLoading(element) {
    const internals = Internals(element);

    if (!internals.loading) {
        return;
    }

    if (internals.loading === 1) {
        if (internals.frame) {
            console.log('CANCEL', 't - ' + element.getAttribute('loading'));
            cancelAnimationFrame(internals.frame);
            internals.frame = null;
        }
        else {
            console.log('REMOVE');
            element.removeAttribute('loading');
        }
    }

    --internals.loading;
    console.log(internals.loading, element);
}

export function setLoadingAsync(element) {
    const internal = Internals(element);

    // DOM nonsense. If we are loading at connect add the loading attribute
    // after a couple of frames to allowing time for styled transitions to
    // initialise.
    internal.frame = internal.loading ? requestAnimationFrame(() =>
        internal.frame = internal.loading ? requestAnimationFrame(() => {
            internal.frame = null;
            internal.loading && element.setAttribute('loading', '');
        }) : null
    ) : null;
}

export default {
    /**
    loading=""
    Read-only (pseudo-read-only) boolean attribute indicating status of
    `src` and `data` requests.
    **/

    /**
    .loading
    Read-only boolean indicating status of `src` and `data` requests.
    **/

    loading: {
        get: function() {
            const internal = Internals(this);
            return !!internal.loading;
        }
    }
};
