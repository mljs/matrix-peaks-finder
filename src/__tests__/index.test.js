import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import * as peaksFinder from '../index.js';

const image = JSON.parse(
  readFileSync(`${import.meta.dirname}/image2.json`).toString(),
);
const rows = 300;
const cols = 300;
for (let i = 0; i < image.length; i++) {
  image[i] -= 45000;
}

const imageAsMatrix = new Array(rows);
for (let i = 0; i < rows; i++) {
  imageAsMatrix[i] = new Array(cols);
  for (let j = 0; j < cols; j++) {
    imageAsMatrix[i][j] = image[i * cols + j];
  }
}

describe('matrix-peaks-finder test library name', () => {
  it('should return true', () => {
    expect(peaksFinder.findPeaks2DMax).toBeInstanceOf(Object);
    expect(peaksFinder.findPeaks2DRegion).toBeInstanceOf(Object);
  });
});

describe('matrix-peaks-finder image matrix', () => {
  it('should find some peaks based on center of mass. Array', () => {
    let peaks = peaksFinder.findPeaks2DRegion(image, {
      rows,
      cols: rows,
      nStdDev: 5,
    });

    expect(peaks.length).toBeGreaterThan(10);
  });

  it('should find some peaks based on all local maxima. Array', () => {
    let peaks = peaksFinder.findPeaks2DMax(image, {
      rows,
      cols: rows,
      nStdDev: 5,
    });

    expect(peaks.length).toBeGreaterThan(10);
  });
});

describe('matrix-peaks-finder image matrix without rows cols options', () => {
  it('should find some peaks based on center of mass. Matrix', () => {
    let peaks = peaksFinder.findPeaks2DRegion(imageAsMatrix, { nStdDev: 5 });

    expect(peaks.length).toBeGreaterThan(10);
  });

  it('should find some peaks based on all local maxima. Matrix', () => {
    let peaks = peaksFinder.findPeaks2DMax(imageAsMatrix, { nStdDev: 5 });

    expect(peaks.length).toBeGreaterThan(10);
  });
});

describe('matrix-peaks-finder region centroid', () => {
  it('should normalize coordinates using absolute data weights', () => {
    const peaks = peaksFinder.findPeaks2DRegion([10, 9], {
      rows: 1,
      cols: 2,
      originalData: [-10, 9],
      filteredData: [-1, -2],
      labelling: 'floodfill',
      nStdDev: 0,
    });

    expect(peaks).toHaveLength(1);
    expect(peaks[0]).toMatchObject({
      x: 9 / 19,
      y: 0,
      z: -1,
      minX: 0,
      maxX: 1,
      minY: 0,
      maxY: 0,
    });
    expect(peaks[0].x).toBeGreaterThanOrEqual(peaks[0].minX);
    expect(peaks[0].x).toBeLessThanOrEqual(peaks[0].maxX);
  });

  it('uses the bounding-box center when all region weights are zero', () => {
    const peaks = peaksFinder.findPeaks2DRegion([0, 0, 0, 0], {
      rows: 2,
      cols: 2,
      originalData: [4, 5, 6, 7],
      filteredData: [-1, -2, -3, -4],
      labelling: 'floodfill',
      nStdDev: 0,
    });

    expect(peaks).toHaveLength(1);
    expect(peaks[0]).toMatchObject({ x: 0.5, y: 0.5, z: 22 });
  });

  it('rejects unsupported region labelling algorithms', () => {
    expect(() =>
      peaksFinder.findPeaks2DRegion([[1]], {
        rows: 1,
        cols: 1,
        filteredData: [-1],
        //@ts-expect-error
        labelling: 'unknown',
      }),
    ).toThrow('labelling unknown does not support');
  });

  it('rejects matrices without dimensions', () => {
    expect(() =>
      peaksFinder.findPeaks2DRegion([[]], {
        filteredData: [],
        originalData: [],
      }),
    ).toThrow('Invalid number of rows or columns');
    expect(() =>
      peaksFinder.findPeaks2DMax([[]], { filteredData: [], originalData: [] }),
    ).toThrow('Invalid number of rows or columns');
  });
});

describe('matrix-peaks-finder symmetric peak', () => {
  it('should give a region symmetric in rows and columns', () => {
    const size = 32;
    const centre = 16;
    const fwhm = 7;
    const data = new Float64Array(size * size);
    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        const squaredDistance = (row - centre) ** 2 + (column - centre) ** 2;
        data[row * size + column] =
          1000 * Math.exp((-4 * Math.LN2 * squaredDistance) / fwhm ** 2);
      }
    }

    const peaks = peaksFinder.findPeaks2DRegion(data, {
      rows: size,
      cols: size,
      nStdDev: 1,
    });

    expect(peaks).toHaveLength(1);
    expect([peaks[0].minX, peaks[0].maxX]).toStrictEqual([13, 19]);
    expect([peaks[0].minY, peaks[0].maxY]).toStrictEqual([13, 19]);
  });
});

describe('matrix-peaks-finder default kernel', () => {
  const { defaultKernel } = peaksFinder;

  it('should be a frozen 9x9 kernel symmetric in rows and columns', () => {
    expect(defaultKernel).toHaveLength(9);
    expect(Object.isFrozen(defaultKernel)).toBe(true);

    for (let row = 0; row < 9; row++) {
      expect(defaultKernel[row]).toHaveLength(9);
      expect(Object.isFrozen(defaultKernel[row])).toBe(true);

      for (let column = 0; column < 9; column++) {
        const value = defaultKernel[row][column];

        expect(defaultKernel[column][row]).toBe(value);
        expect(defaultKernel[8 - row][column]).toBe(value);
      }
    }

    expect(defaultKernel[4][4]).toBe(-40);
  });

  it('should be the kernel used when none is given', () => {
    const options = { rows: 300, cols: 300, nStdDev: 5 };
    const withDefault = peaksFinder.findPeaks2DRegion(image, options);
    const withExplicit = peaksFinder.findPeaks2DRegion(image, {
      ...options,
      kernel: defaultKernel,
    });

    expect(withExplicit).toStrictEqual(withDefault);
  });
});
