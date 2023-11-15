
import observe from '../../fn/observer/observer.js';
import { Observer as Data, getTarget } from '../../fn/observer/observer.js';

Data.getObject = getTarget;

export default Data;
