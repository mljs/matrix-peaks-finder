import DisjointSet from 'ml-disjoint-set';

/** @type{readonly [number, number]} */
const direction4X = [-1, 0];
/** @type{readonly [number, number]} */
const direction4Y = [0, -1];

function getNeighbours4() {
  return [null, null];
}

/** @type{readonly [number, number, number, number]} */
const direction8X = [-1, -1, 0, 1];
/** @type{readonly [number, number, number, number]} */
const direction8Y = [0, -1, -1, -1];

function getNeighbours8() {
  return [null, null, null, null];
}

export function floodFillLabelling(mask, width, height, options) {
  options = options || {};
  const neighbours = options.neighbours || 8;

  let directionX;
  let directionY;
  let neighboursList;
  if (neighbours === 8) {
    directionX = direction8X;
    directionY = direction8Y;
    neighboursList = getNeighbours8();
  } else if (neighbours === 4) {
    directionX = direction4X;
    directionY = direction4Y;
    neighboursList = getNeighbours4();
  } else {
    throw new RangeError(`unsupported neighbours count: ${neighbours}`);
  }

  const size = mask.length;
  const labels = new Array(size);
  const pixels = new Int16Array(size);
  const linked = new DisjointSet();
  let index;
  let currentLabel = 1;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      // true means out of background
      let smallestNeighbor = null;
      index = i + j * width;
      if (mask[index]) {
        for (let k = 0; k < neighboursList.length; k++) {
          let ii = i + directionX[k];
          let jj = j + directionY[k];
          if (ii >= 0 && jj >= 0 && ii < width && jj < height) {
            let neighbor = labels[ii + jj * width];
            if (!neighbor) {
              neighboursList[k] = null;
            } else {
              neighboursList[k] = neighbor;
              if (
                !smallestNeighbor ||
                // @ts-ignore
                neighboursList[k].value < smallestNeighbor.value
              ) {
                smallestNeighbor = neighboursList[k];
              }
            }
          }
        }
        if (!smallestNeighbor) {
          labels[index] = linked.add(currentLabel++);
        } else {
          labels[index] = smallestNeighbor;
          for (let k = 0; k < neighboursList.length; k++) {
            if (neighboursList[k] && neighboursList[k] !== smallestNeighbor) {
              linked.union(smallestNeighbor, neighboursList[k]);
            }
          }
        }
      }
    }
  }
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      index = i + j * width;
      if (mask[index]) {
        pixels[index] = linked.find(labels[index]).value;
      }
    }
  }
  return pixels;
}
