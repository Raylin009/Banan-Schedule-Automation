function sum(a, b) {
  return a + b;
}
module.exports = sum;

const dStr = "Fri, 18 Dec 2020 08:20:32 +0000"
const date = new Date(dStr);
const year = date.getFullYear()

console.log(year)

