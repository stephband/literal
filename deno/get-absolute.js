
import * as path from "https://deno.land/std@0.110.0/path/mod.ts";

const cwd = Deno.cwd();

export default function getAbsolute(source, src) {
    // If src starts with '/' assume it is path from cwd
    if (src[0] === '/') {
        return cwd + src;
    }

    const root     = path.parse(source);
    const dir      = root.dir;

    return path.join(dir, src);
}
