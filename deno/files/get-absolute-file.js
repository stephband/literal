
import * as path from "https://deno.land/std@0.110.0/path/mod.ts";
import deno from '../../deno.json' with { type: 'json' };

export default function getAbsoluteFile(source, src) {
    const root     = path.parse(source);
    const dir      = root.dir;
    const relative = src.replace(/#.*$/, '');
//console.log(root, dir, relative);
    return path.join(dir, relative);
}
