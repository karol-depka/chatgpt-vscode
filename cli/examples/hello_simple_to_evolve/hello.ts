// start
const red = '\x1b[31m%s\x1b[0m';
const blueBold = '\x1b[34m%s\x1b[1m';
const reset = '\x1b[0m';

console.log(red, 'hello world') // red
console.debug('bye')
console.log(blueBold, 'goodbye\x1b[0m') // blue, bold
console.log(blueBold, 'goodbye\x1b[0m') // blue, bold
console.log(reset) // reset color
// end
