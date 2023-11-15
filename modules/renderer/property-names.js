
// A map of attribute names to property names for attribute renderers. Readonly
// properties of an element cannot be set, obviously. Marking them as null means
// AttributeRenderer does not try to set them as properties.
export default {
    'accept-charset': 'acceptCharset',
    accesskey:       'accessKey',
    cellpadding:     'cellPadding',
    cellspacing:     'cellSpacing',
    codebase:        'codeBase',
    colspan:         'colSpan',
    datetime:        'dateTime',
    'for':           'htmlFor',    // <label>
    form:            null,         // Readonly
    formaction:      'formAction', // <input>
    formenctype:     'formEnctype',
    formmethod:      'formMethod',
    formnovalidate:  'formNoValidate',
    formtarget:      'formTarget',
    frameborder:     'frameBorder',
    href:            null,         // <use href> is readonly
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
    viewbox:         null,          // Readonly
    viewBox:         null,          // Readonly
    cx:              null,
    cy:              null,
    r:               null
};
