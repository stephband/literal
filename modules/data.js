
import { Observer as Data, getTarget } from '../../fn/observer/observer.js';

Data.getObject = getTarget;

export default Data;
export { default as observe } from '../../fn/observer/observe.js';
