
// Arguments

const args = Deno.args;

console.log.apply(console, args);


// Filesystem
//
// Flags:
//
// --allow-read
// --allow-write

// open() asynchronously returns the Uint8Array buffer of the file.
const file = await Deno.open('./sample.txt');

// TextDecoder decodes the Uint8Array to unicode text
const decoder = new TextDecoder('utf-8');

// text is decoded and saved.
const text = decoder.decode(await Deno.readAll(file));




//create a text encoder that encodes utf8 string to Uint8Array
const encoder = new TextEncoder();

// encodes your utf8 text
const data = encoder.encode("Writing to file in Deno is simple!\n");

// asynchronously write to file creates or overwrites a file
await Deno.writeFile("./sample1.txt", data);
                 
// set permissions on new file
await Deno.writeFile("./sample3.txt", data, {mode: 0o777});  

// append the data to the file
await Deno.writeFile("./sample4.txt", data, {append: true}); 

// check if the file exists, if not, do nothing
await Deno.writeFile("./sample2.txt", data, {create: false});
