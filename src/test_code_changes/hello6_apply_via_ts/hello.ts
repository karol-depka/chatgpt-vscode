const startTime = Date.now();

for (let i = 1; i <= 99; i++) {
    console.log(`Iteration: ${i}`);
    if (i % 2 === 0) {
        for (let j = 0; j < 7; j++) {
            console.log(`hi`);
        }
    }
}

console.log(`Total time taken: ${Date.now() - startTime}ms`);
