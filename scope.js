
// Extend scope with library of functions

import scope       from './modules/scope.js';

import by          from 'fn/by.js';
import capture     from 'fn/capture.js';
import choose      from 'fn/choose.js';
import clamp       from 'fn/clamp.js';
import equals      from 'fn/equals.js';
import exec        from 'fn/exec.js';
import last        from 'fn/last.js';
import matches     from 'fn/matches.js';
import normalise   from 'fn/normalise.js';
import denormalise from 'fn/denormalise.js';
import getPath     from 'fn/get-path.js';
import setPath     from 'fn/set-path.js';
import slugify     from 'fn/slugify.js';
import toCamelCase from 'fn/to-camel-case.js';
import deg         from 'fn/to-deg.js';
import rad         from 'fn/to-rad.js';
import wrap        from 'fn/wrap.js';

import delegate    from 'dom/delegate.js';
import events      from 'dom/events.js';
import isValid     from 'dom/is-valid.js';
import rect        from 'dom/rect.js';
import validate    from 'dom/validate.js';
import navigate    from 'dom/navigate.js';
import location    from 'dom/location.js';
import trigger     from 'dom/trigger.js';
import { px, em, rem, vw, vh } from 'dom/parse-length.js';

import copy        from './modules/scope/copy.js';
import pluralise   from './modules/scope/pluralise.js';
import translate   from './modules/scope/translate.js';
import paramify    from './modules/scope/paramify.js';
import style       from './modules/scope/style.js';

export default Object.assign(scope, {
    by,
    capture,
    choose,
    clamp,
    equals,
    exec,
    last,
    matches,
    normalise,
    denormalise,
    getPath,
    setPath,
    slugify,
    toCamelCase,
    deg,
    rad,
    wrap,
    delegate,
    events,
    isValid,
    rect,
    validate,
    navigate,
    location,
    trigger,
    px,
    em,
    rem,
    vw,
    vh,
    copy,
    pluralise,
    translate,
    paramify,
    style
});
