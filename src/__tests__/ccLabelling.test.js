import { describe, expect, it } from 'vitest';

import { floodFillLabelling as labeling } from '../floodFillLabelling.js';

let rows = 8;
let cols = 8;

const bitmask1 = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1,
  1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
  0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1,
];
const result1 = new Int16Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1,
  1, 1, 0, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0,
  0, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2,
]);
const bitmask2 = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1,
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
  0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1,
];
const result24 = new Int16Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1,
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0,
  0, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2,
]);
const result28 = new Int16Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1,
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
  0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1,
]);

describe('Labeling', () => {
  it('has to find 2 regions', () => {
    let labels = labeling(bitmask1, rows, cols);
    expect(labels).toMatchObject(result1);
  });

  it('has to find 2 regions using 4 neighbours', () => {
    let labels = labeling(bitmask2, rows, cols, { neighbours: 4 });
    expect(labels).toMatchObject(result24);
  });

  it('has to find 1 region using 8 neighbours', () => {
    let labels = labeling(bitmask2, rows, cols, { neighbours: 8 });
    expect(labels).toMatchObject(result28);
  });
});
