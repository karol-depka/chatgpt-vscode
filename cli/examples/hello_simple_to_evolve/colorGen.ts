// put code here

function generateGradient(): void {
  for (let i = 0; i <= 255; i++) {
    let red = i;
    let green = 0;
    let blue = 0;
    let colorString = `\x1b[38;2;${red};${green};${blue}m\u2588\u2588\x1b[0m`;
    console.log(colorString);
  }
}

console.log('start')

generateGradient();


console.log('finish')

///