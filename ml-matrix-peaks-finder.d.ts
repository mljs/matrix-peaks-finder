declare module 'ml-matrix-peaks-finder' {
  interface FindPeaks2DRegionOptions {
    nStdDev: number;
    kernel?: number[][] | Float64Array[];
    originalData: number[] | Float64Array;
    filteredData: number[] | Float64Array;
    rows: number;
    cols: number;
    labelling?: 'drain' | 'floodfill';
  }
  interface Peak2D {
    id?: string;
    x: number;
    y: number;
    z: number;
    maxX: number;
    minX: number;
    maxY: number;
    minY: number;
  }
  function findPeaks2DRegion(
    absoluteData: number[] | Float64Array,
    options?: FindPeaks2DRegionOptions,
  ): Peak2D[];
}
