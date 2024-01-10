
import { Observer as Data, getTarget } from '../../fn/observer/observer.js';
import observe from '../../fn/observer/observe.js';

Data.getObject = getTarget;
Data.observe   = observe;

export default Data;
export { observe };
