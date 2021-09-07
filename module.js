
import './elements/literal-template.js';
import './elements/literal-include.js';

export { cache as compiled } from './modules/compile.js';
export { register } from './modules/library.js';

import analytics from './modules/analytics.js';
export { analytics };
