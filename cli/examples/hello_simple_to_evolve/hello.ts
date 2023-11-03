// start
const red = '\x1b[31m%s\x1b[0m';
const blue = '\x1b[34m%s\x1b[0m';
const bold = '\x1b[1m%s\x1b[0m';
const reset = '\x1b[0m';
import fs from 'fs';
const logStream = fs.createWriteStream('log.txt', {flags: 'a'});

for(let i = 0; i < 3; i++) {
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
