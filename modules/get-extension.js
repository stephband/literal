
import exec from '../../fn/modules/exec.js';
import get  from '../../fn/modules/get.js';

export default exec(/\.[\w\d.]+$/, get(0));
