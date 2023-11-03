// start
function loopHello() {
  for (let i = 0; i < 7; i++) {
    console.log('hello world');
    console.debug('bye');
    if (i % 2 !== 0) {
      console.log('odd!');
      console.log('odd it is');
    }
  }
}
loopHello();
console.log('hello world')
console.debug('bye')
// end
