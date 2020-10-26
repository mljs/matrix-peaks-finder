import { readFileSync } from 'fs';

import * as peaksFinder from '..';

let image = JSON.parse(readFileSync(`${__dirname}/image2.json`).toString());
let rows = 300;
let cols = 300;
for (let i = 0; i < image.length; i++) {
  image[i] -= 45000;
}

let imageAsMatrix = new Array(rows);
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
      rows: rows,
      cols: rows,
      nStdev: 5,
    });
    expect(peaks.length).toBeGreaterThan(10);
  });
  it('should find some peaks based on all local maxima. Array', () => {
    let peaks = peaksFinder.findPeaks2DMax(image, {
      rows: rows,
      cols: rows,
      nStdev: 5,
    });
    expect(peaks.length).toBeGreaterThan(10);
  });
});

describe('matrix-peaks-finder image matrix without rows cols options', () => {
  it('should find some peaks based on center of mass. Matrix', () => {
    let peaks = peaksFinder.findPeaks2DRegion(imageAsMatrix, { nStdev: 5 });
    expect(peaks.length).toBeGreaterThan(10);
  });
  it('should find some peaks based on all local maxima. Matrix', () => {
    let peaks = peaksFinder.findPeaks2DMax(imageAsMatrix, { nStdev: 5 });
    expect(peaks.length).toBeGreaterThan(10);
  });
});
