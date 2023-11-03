// start
console.log('\x1b[38;2;255;0;0m%s\x1b[0m', 'Red');
console.log('\x1b[38;2;0;255;0m%s\x1b[0m', 'Green');
console.log('\x1b[38;2;0;0;255m%s\x1b[0m', 'Blue');
const red = '\x1b[31m%s\x1b[0m';
const blue = '\x1b[34m%s\x1b[0m';
const purple = '\x1b[35m%s\x1b[0m';
const yellow = '\x1b[33m%s\x1b[0m';
const orange = '\x1b[33m%s\x1b[0m';
const bold = '\x1b[1m%s\x1b[0m';
const reset = '\x1b[0m';
import fs from 'fs';
const logStream = fs.createWriteStream('log.txt', {flags: 'a'});
function createColorRow() {
  for(let r = 0; r < 50; r++){
    printRGB(r, 0, 0);
  }
}
function printRGB(r: number, g: number, b: number) {
  console.log("\x1b[38;2;" + r + ";" + g + ";" + b + "m%s\x1b[0m", "X");
}
for(let r = 0; r < 256; r++){
  for(let g = 0; g < 256; g++){
    for(let b = 0; b < 256; b++){
        printRGB(r, g, b);
    } 
  }
  createColorRow();

for(let i = 0; i < 3; i++) {
  console.log(yellow, i); // yellow
  console.log(orange, 'HELLO ALVARO and PARKER'); // orange
  console.log(purple, 'welcome') // purple
  console.log(purple, 'welcome') // purple
  if(i % 2 != 0) console.log(purple, 'this is odd!') // violet
  if(i % 2 == 0) console.log(red, 'hello earth') // red
    logStream.write('hello earth\n');
  if(i == 2) {
    console.debug('bye')
    logStream.write('bye\n');
    console.log(blue + bold + 'goodbye\x1b[0m') // blue, bold
    console.log(blue + bold + 'goodbye\x1b[0m') // blue, bold
    logStream.write('goodbye\n');
  }
  console.log(reset + '') // reset color
}

// end
