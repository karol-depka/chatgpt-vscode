for(let i = 0; i < 7; i++) {
  console.log('\x1b[31m', 'hello world', '\x1b[0m');
  console.debug('\x1b[33m', 'bye', '\x1b[0m');
}
console.log('\x1b[34m\x1b[1m', 'Goodnight!', '\x1b[0m');

// start
console.log('hello world')
console.debug('bye')
// end
