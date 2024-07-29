
import exec from 'fn/exec.js';
import get  from 'fn/get.js';

export default exec(/\.[\w\d.]+$/, get(0));
