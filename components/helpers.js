export function subtractOvers(x, y) {
  let tx = Math.floor(x);
  let ty = Math.floor(y);
  let temp = tx - ty;
  let result;
  let decx = x - tx;
  let decy = y - ty;
  decx = Math.floor((Math.floor(decx * 100) + 1) / 10) / 10; //Formatting
  decy = Math.floor((Math.floor(decy * 100) + 1) / 10) / 10;
  if (decx >= decy) {
    result = decx - decy;
  } else {
    temp -= 1;
    result = Math.floor((0.6 - (decy - decx)) * 10) / 10;
  }
  result += temp;
  return result;
}

export function generateGuid() {
  var result, i, j;
  result = "";
  for (j = 0; j < 32; j++) {
    if (j === 8 || j === 12 || j === 16 || j === 20) result = result + "-";
    i = Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase();
    result = result + i;
  }
  return result;
}
