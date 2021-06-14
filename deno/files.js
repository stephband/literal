
// TextDecoder decodes the Uint8Array to unicode text
const decoder = new TextDecoder('utf-8');

export function read() {
    // open() asynchronously returns the Uint8Array buffer of the file.
    const file = await Deno.open('./sample.txt');
    
    // text is decoded and saved.
    return decoder.decode(await Deno.readAll(file));
}
