// start
const red = '\x1b[31m%s\x1b[0m';
const blue = '\x1b[34m%s\x1b[0m';
const purple = '\x1b[35m%s\x1b[0m';
const yellow = '\x1b[33m%s\x1b[0m';
const bold = '\x1b[1m%s\x1b[0m';
const reset = '\x1b[0m';
import fs from 'fs';
const logStream = fs.createWriteStream('log.txt', {flags: 'a'});

for(let i = 0; i < 3; i++) {
  console.log(yellow, i); // yellow
  console.log(purple, 'welcome') // purple
  console.log(purple, 'welcome') // purple
  console.log('\x1b[33m%s\x1b[0m', 'HELLO ALVARO and PARKER'); // orange
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
