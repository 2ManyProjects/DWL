export function subtractOvers(x, y) {
  let tx = Math.floor(x);
  let ty = Math.floor(y);
  let temp = tx - ty;
  let result;
  let decx = x * 10 - tx * 10;
  let decy = y * 10 - ty * 10;
  if (decx == decy) {
    result = 0;
  } else if (decx > decy) {
    result = (decx - decy) / 10;
  } else {
    temp -= 1;
    result = (6 - (decy - decx)) / 10;
  }
  result += temp;
  // console.log(
  //   "X",
  //   x,
  //   " Y",
  //   y,
  //   "tx",
  //   tx,
  //   "ty",
  //   ty,
  //   "DeltaX",
  //   decx,
  //   "DeltaY",
  //   decy,
  //   result
  // );
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
