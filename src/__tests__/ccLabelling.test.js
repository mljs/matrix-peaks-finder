import { describe, expect, it } from 'vitest';

import { drainLabelling } from '../drainLabelling.js';
import { floodFillLabelling as labeling } from '../floodFillLabelling.js';

const rows = 8;
const cols = 8;

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

  it('rejects unsupported flood-fill neighbourhoods', () => {
    expect(() => labeling([1], 1, 1, { neighbours: 6 })).toThrow(
      'unsupported neighbours count: 6',
    );
  });

  it('unions multiple flood-fill neighbours', () => {
    const labels = labeling([1, 0, 1, 1, 1, 1], 3, 2, { neighbours: 4 });

    expect(labels).toMatchObject(new Int16Array([1, 0, 1, 1, 1, 1]));
  });

  it('supports four-neighbour drain labelling', () => {
    const labels = drainLabelling([1, 2, 3, 4], [1, 1, 1, 1], {
      neighbours: 4,
      width: 2,
      height: 2,
    });

    expect(labels).toMatchObject(new Int16Array([1, 1, 1, 1]));
  });

  it('rejects unsupported drain neighbourhoods', () => {
    expect(() =>
      drainLabelling([1], [1], { neighbours: 6, width: 1, height: 1 }),
    ).toThrow('unsupported neighbours count: 6');
  });
});
