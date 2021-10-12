
import * as path from "https://deno.land/std@0.110.0/path/mod.ts";

function countUpLevels(path) {
    let n = -1;
    while(path[++n] === '..');
    return n;
}

function rootPath(source, asset) {
    const sourcePath = source.split('/');
    var assetPath    = asset.split('/');

    // Remove file name in last position
    --sourcePath.length;

    // Remove leading ./
    if (assetPath[0] === '.') {
        assetPath.shift();
    }

    // Count up levels ../
    const count = countUpLevels(assetPath);
    const upCount = Math.min(count, sourcePath.length);

    // Make assetPath by stripping up levels and prepending what's 
    // left of sourcePath
    sourcePath.length -= upCount;
    assetPath.splice(0, upCount);
    return sourcePath.concat(assetPath);
}

export function rootURL(source, asset) {    
    return rootPath(source, asset).join('/');
}



export function rewriteURL(source, target, url) {
    // Source dir relative to current working directory
    const sourcedir = path.dirname(source);
    // Target dir relative to current working directory
    const targetdir = path.dirname(target);
    // Resource path relative to current working directory
    const resource  = path.join(sourcedir, url);
    
    /*
    console.log('====== rewriteURL(source, target, url) ======',
        //'\ntarget:    ' + target,
        //'\ntargetdir: ' + targetdir,
        //'\nsource:    ' + source,
        //'\nsourcedir: ' + sourcedir,
        '\nurl:       ' + url,
        //'\nresource:  ' + resource,
        '\nrelative:  ' + path.relative(targetdir, resource)
    );
    */
    
    // Resource path relative to module
    return path.relative(targetdir, resource);
}

//            $1                                                                                                                                     $2
//            (url(' or      @import " or   src=", html=", cite=" etc.                                                   )   protocol://,/,#,$,',"   (url)
/*const rURL = /(url\(\s*['"]?|@import\s*['"]|(?:src|href|cite|action|formaction|codebase|longdesdc|usemap|poster)=['"]?\s*)(?:[a-z]+\:\/\/|[\/\#\$'"]|([\:\.\/\w-\d\%]*))/g;

export function rewriteURLs(source, target, text) {
    // Check for $2 - if a protocol was found $2 is undefined and we don't 
    // want to rewrite. Todo: write the regexp to not match protocol:// urls  
    return text.replace(rURL, ($0, $1, $2) => (
        $2 ? $1 + rewriteURL(source, target, $2) : $0
    ));
}*/

const rURL = /(url\(\s*['"]?|@import\s*['"]|(?:src|href|cite|action|formaction|codebase|longdesdc|usemap|poster)=['"]?|['"])(\.{1,2}\/[\.\/\w-\d\%]+)/g;

export function rewriteURLs(source, target, text) {
    return text.replace(rURL, ($0, $1, $2) =>
        $1 + rewriteURL(source, target, $2)
    );
}
