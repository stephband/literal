/**
setProperty(node, name, value)/
**/

// Readonly properties cannot be set, obviously. Marking them as this name
// means AttributeRenderer does not try to set them as properties. Crude.
export default {
    'accept-charset': 'acceptCharset',
    accesskey:       'accessKey',
    cellpadding:     'cellPadding',
    cellspacing:     'cellSpacing',
    codebase:        'codeBase',
    colspan:         'colSpan',
    datetime:        'dateTime',
    'for':           'htmlFor',    // <label>
    form:            null,         // Readonly, mark as null
    formaction:      'formAction', // <input>
    formenctype:     'formEnctype',
    formmethod:      'formMethod',
    formnovalidate:  'formNoValidate',
    formtarget:      'formTarget',
    frameborder:     'frameBorder',
    href:            null,         // <use href> is readonly, mark as null
    httpequiv:       'httpEquiv',
    longdesc:        'longDesc',
    maxlength:       'maxLength',
    minlength:       'minLength',
    nohref:          'noHref',
    noresize:        'noResize',
    noshade:         'noShade',    // <hr>
    nowrap:          'noWrap',
    novalidate:      'noValidate', // <form>
    readonly:        'readOnly',
    rowspan:         'rowSpan',
    tabindex:        'tabIndex',
    tfoot:           'tFoot',
    thead:           'tHead',
    usemap:          'useMap',
    valign:          'vAlign',
    valuetype:       'valueType',   // <object>
    viewbox:         null,          // Readonly, mark as null
    viewBox:         null,          // Readonly, mark as null
    cx:              null,
    cy:              null,
    r:               null
};
