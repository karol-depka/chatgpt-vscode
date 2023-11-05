// program starting

// import the presidents data
import { presidents } from './presidents.ts';

// print the 10 most recent presidents
console.log('The 10 most recent presidents are:');
for (let i = 0; i < 10; i++) {
  console.log(presidents[i].name);
}
// program ending
