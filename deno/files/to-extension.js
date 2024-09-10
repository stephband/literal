
import get  from 'fn/get.js';
import exec from 'fn/exec.js';

export default exec(/\.[\w\d.]+$/, get(0));
