'use strict'
/**
 * Created by acastillo on 7/7/16.
 */
var FFTUtils = require("ml-fft").FFTUtils;
var StatArray = require('ml-stat/array');


const smallFilter = [
    [0, 0, 1, 2, 2, 2, 1, 0, 0],
    [0, 1, 4, 7, 7, 7, 4, 1, 0],
    [1, 4, 5, 3, 0, 3, 5, 4, 1],
    [2, 7, 3, -12, -23, -12, 3, 7, 2],
    [2, 7, 0, -23, -40, -23, 0, 7, 2],
    [2, 7, 3, -12, -23, -12, 3, 7, 2],
    [1, 4, 5, 3, 0, 3, 5, 4, 1],
    [0, 1, 3, 7, 7, 7, 3, 1, 0],
    [0, 0, 1, 2, 2, 2, 1, 0, 0]];

const DEBUG = false;

/**
 Detects all the 2D-peaks in the given spectrum based on center of mass logic.
 */
function findPeaks2DLoG(inputData, convolutedSpectrum, nRows, nCols, nStdDev, customFilter) {

    if(convolutedSpectrum==null){
        var radix2Sized = FFTUtils.toRadix2(inputData, nRows, nCols, {inPlace:false});
        if(!customFilter){
            customFilter = smallFilter;
        }
        convolutedSpectrum = FFTUtils.convolute(radix2Sized.data, customFilter, radix2Sized.rows, radix2Sized.cols);
        FFTUtils.crop(convolutedSpectrum, radix2Sized.rows, radix2Sized.cols, nRows, nCols );
    }

    //console.log(convolutedSpectrum);
    var threshold = 0;
    for(var i=nCols*nRows-2;i>=0;i--)
        threshold+=Math.pow(convolutedSpectrum[i]-convolutedSpectrum[i+1],2);
    threshold=-Math.sqrt(threshold);
    threshold*=nStdDev/nRows;

    var bitmask = new Array(nCols * nRows);
    for(var i=nCols * nRows-1;i>=0;i--){
        bitmask[i]=0;
    }
    var nbDetectedPoints = 0;
    for (var i = convolutedSpectrum.length-1; i >=0 ; i--) {
        if (convolutedSpectrum[i] < threshold) {
            bitmask[i] = 1;
            nbDetectedPoints++;
        }
    }
    var iStart = 0;
    var peakList = [];

    while (nbDetectedPoints != 0) {
        for (iStart; iStart < bitmask.length && bitmask[iStart]==0; iStart++){};
        if (iStart == bitmask.length)
            break;

        nbDetectedPoints -= extractArea(inputData, convolutedSpectrum,
            bitmask, iStart, nRows, nCols, peakList, threshold);
    }

    if (peakList.length > 0&&DEBUG) {
        console.log("No peak found");
    }
    return peakList;
}
/**
 Detects all the 2D-peaks in the given spectrum based on the Max logic.
 amc
 */
function findPeaks2DMax(inputData, cs, nRows, nCols, nStdDev, customFilter) {
    var radix2Sized = FFTUtils.toRadix2(inputData, nRows, nCols);
    if(cs==null){
        if(!customFilter){
            customFilter = smallFilter;
        }
        cs = FFTUtils.convolute(radix2Sized.data, customFilter, radix2Sized.rows, radix2Sized.cols);
    }
    var threshold = 0;
    for( var i=nCols*nRows-2;i>=0;i--)
        threshold+=Math.pow(cs[i]-cs[i+1],2);
    threshold=-Math.sqrt(threshold);
    threshold*=nStdDev/nRows;

    var rowI,colI;
    var peakListMax = [];
    var tmpIndex = 0;
    for ( var i = 0; i < cs.length; i++) {
        if (cs[i] < threshold) {
            //It is a peak?
            rowI=Math.floor(i/nCols);
            colI=i%nCols;
            //Verifies if this point is a peak;
            if(rowI>0&&rowI+1<nRows&&colI+1<nCols&&colI>0){
                //It is the minimum in the same row
                if(cs[i]<cs[i+1]&&cs[i]<cs[i-1]){
                    //It is the minimum in the previous row
                    tmpIndex=(rowI-1)*nCols+colI;
                    if(cs[i]<cs[tmpIndex-1]&&cs[i]<cs[tmpIndex]&&cs[i]<cs[tmpIndex+1]){
                        //It is the minimum in the next row
                        tmpIndex=(rowI+1)*nCols+colI;
                        if(cs[i]<cs[tmpIndex-1]&&cs[i]<cs[tmpIndex]&&cs[i]<cs[tmpIndex+1]){
                            peakListMax.push({x:colI,y:rowI,z:inputData[i]});
                        }
                    }
                }
            }
        }
    }
    return peakListMax;
}
/*
 This function detects the peaks
 */
function extractArea(spectrum, convolutedSpectrum, bitmask, iStart,
                     nRows, nCols, peakList, threshold) {
    var iRow = Math.floor(iStart / nCols);
    var iCol = iStart % nCols;
    var peakPoints =[];

    scanBitmask(bitmask, nRows, nCols, iRow, iCol, peakPoints);

    var x = new Array(peakPoints.length);
    var y = new Array(peakPoints.length);
    var z = new Array(peakPoints.length);
    var nValues = peakPoints.length;
    var xAverage = 0.0;
    var yAverage = 0.0;
    var zSum = 0.0;
    if (nValues >= 9) {
        if (DEBUG)
            console.log("nValues=" + nValues);
        var maxValue = Number.NEGATIVE_INFINITY;
        var maxIndex = -1;
        for (var i = 0; i < nValues; i++) {
            var pt = (peakPoints.splice(0,1))[0];
            x[i] = pt[0];
            y[i] = pt[1];
            z[i] = spectrum[pt[1] * nCols + pt[0]];
            xAverage += x[i] * z[i];
            yAverage += y[i] * z[i];
            zSum += z[i];
            if (z[i] > maxValue) {
                maxValue = z[i];
                maxIndex = i;
            }
        }
        if (maxIndex !== -1) {
            xAverage /= zSum;
            yAverage /= zSum;
            var newPeak = {x:xAverage, y:yAverage, z:zSum};
            var minmax;
            minmax =StatArray.minMax(x);
            newPeak.minX=minmax.min;
            newPeak.maxX=minmax.max;
            minmax = StatArray.minMax(y);
            newPeak.minY=minmax.min;
            newPeak.maxY=minmax.max;
            peakList.push(newPeak);
        }
    }
    return nValues;
}
/*
 Return all the peaks(x,y points) that composes a signal.
 */
function scanBitmask(bitmask, nRows, nCols, iRow, iCol, peakPoints) {
    //console.log(nRows+" "+iRow+" "+nCols+" "+iCol);
    if (iRow < 0 || iCol < 0 || iCol == nCols || iRow == nRows)
        return;
    if (bitmask[iRow * nCols + iCol]) {
        bitmask[iRow * nCols + iCol] = 0;
        peakPoints.push([iCol, iRow]);
        scanBitmask(bitmask, nRows, nCols, iRow + 1, iCol, peakPoints);
        scanBitmask(bitmask, nRows, nCols, iRow - 1, iCol, peakPoints);
        scanBitmask(bitmask, nRows, nCols, iRow, iCol + 1, peakPoints);
        scanBitmask(bitmask, nRows, nCols, iRow, iCol - 1, peakPoints);
    }
}

module.exports={
    findPeaks2DLoG:findPeaks2DLoG,
    findPeaks2DMax:findPeaks2DMax
};
