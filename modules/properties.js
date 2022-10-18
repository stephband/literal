
import { getInternals as Internals } from '../../dom/modules/element.js';

export function addLoading(element) {
    const internals = Internals(element);
    internals.loading = (internals.loading || 0) + 1;
}

export function removeLoading(element) {
    const internals = Internals(element);

    if (!internals.loading) {
        return;
    }

    if (internals.loading === 1) {
        if (internals.frame) {
            cancelAnimationFrame(internals.frame);
            internals.frame = null;
        }
        else {
            element.removeAttribute('loading');
        }
    }

    --internals.loading;
}

export function setLoadingAsync(element) {
    const internal = Internals(element);

    // DOM nonsense. If we are loading at connect add the loading attribute
    // after a couple of frames to allowing time for styled transitions to
    // initialise.
    (internal.loading && (internal.frame = requestAnimationFrame(() =>
        (internal.loading && (internal.frame = requestAnimationFrame(() =>
            (internal.loading && this.setAttribute('loading', ''))
        )))
    )));
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
