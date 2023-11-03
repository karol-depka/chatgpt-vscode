// start
const redHello = '\x1b[31m%s\x1b[0m';
const blueBoldGoodbye = '\x1b[34m%s\x1b[1m';
const resetColor = '\x1b[0m';

console.log(redHello, 'hello world') // red
console.debug('bye')
console.log(blueBoldGoodbye, 'goodbye\x1b[0m') // blue, bold
console.log(blueBoldGoodbye, 'goodbye\x1b[0m') // blue, bold
console.log(resetColor) // reset color
// end
