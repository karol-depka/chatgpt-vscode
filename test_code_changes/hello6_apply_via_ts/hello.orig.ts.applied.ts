const startTime = Date.now();
function myFunction() {
  const startTime = Date.now();

  for (let i = 1; i <= 3; i++) {
    console.log(`Iteration: ${i}`);
    if (i % 2 === 0) {
      for (let j = 0; j < 7; j++) {
        console.log(`hi`);
      }
    }
  }
  console.log(`Total time taken: ${(Date.now() - startTime) * 1000000}ns`);
}

myFunction();
console.log(`Total time taken: ${Date.now() - startTime}ms`);
