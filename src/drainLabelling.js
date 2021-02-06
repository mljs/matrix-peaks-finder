import DisjointSet from 'ml-disjoint-set';

const direction8X = [-1, -1, 0, 1, -1, 0, 1, 1];
const direction8Y = [0, -1, -1, -1, 1, 1, 1, 0];
const neighbours8 = [null, null, null, null, null, null, null, null];

const direction4X = [-1, 0, 1, 0];
const direction4Y = [0, -1, 0, 1];
const neighbours4 = [null, null, null, null];

export function drainLabelling(data, mask, options = {}) {
  const { neighbours = 8, width, height } = options;

  let directionX;
  let directionY;
  let neighboursList;
  if (neighbours === 8) {
    directionX = direction8X;
    directionY = direction8Y;
    neighboursList = neighbours8;
  } else if (neighbours === 4) {
    directionX = direction4X;
    directionY = direction4Y;
    neighboursList = neighbours4;
  } else {
    throw new RangeError(`unsupported neighbours count: ${neighbours}`);
  }

  let sorted = new Array(height * width);
  for (let i = 0, index = 0; i < height; i++) {
    for (let j = 0; j < width; j++, index++) {
      sorted[index] = { value: data[index], row: i, col: j, mask: mask[index] };
    }
  }

  sorted.sort((a, b) => a.value - b.value);

  const size = mask.length;
  const labels = new Array(size);
  const pixels = new Int16Array(size);
  const linked = new DisjointSet();

  for (let i = 0, currentLabel = 1; i < mask.length; i++) {
    let element = sorted[i];
    if (!element.mask) continue;

    let { row, col, value } = element;
    let index = col + row * width;
    let label = labels[index];
    if (!label) {
      labels[index] = linked.add(currentLabel++);
    }

    for (let k = 0; k < neighboursList.length; k++) {
      let ii = col + directionX[k];
      let jj = row + directionY[k];
      if (ii >= 0 && jj >= 0 && ii < width && jj < height) {
        let neighbor = labels[ii + jj * width];
        if (!neighbor) {
          let neighborValue = data[ii + jj * width];
          if (value < neighborValue) {
            labels[ii + jj * width] = labels[index];
          }
        }
      }
    }
  }

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let index = i + j * width;
      if (mask[index]) {
        pixels[index] = linked.find(labels[index]).value;
      }
    }
  }
  return pixels;
}
