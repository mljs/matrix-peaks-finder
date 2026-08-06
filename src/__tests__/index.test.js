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
});
