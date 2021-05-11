
export default async function select(selector, root) {
    const files = [];

    for await (const entry of Deno.readDir(root)) {
        if (entry.isFile && (!selector.matchfile || selector.matchfile(entry.name))) {
            entry.path = root;
            files.push(entry);
        }
        else if (entry.isDirectory && (!selector.matchdir || selector.matchdir(entry.name))) {
            files.push.apply(files, await select(selector, root + entry.name + '/'));
        }
    }

    return files;
}
