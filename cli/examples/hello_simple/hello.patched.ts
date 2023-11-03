import chalk from 'chalk';

// start
for (let i = 0; i < 7; i++) {
  console.log(chalk.red('hello world'));
  console.debug(chalk.yellow('bye'));
}
console.log(chalk.blue.bold('Goodnight!'));
console.log('hello world')
console.debug('bye')
// end
