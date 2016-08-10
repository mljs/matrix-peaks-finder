'use strict'
/**
 * Created by acastillo on 7/7/16.
 */
var StatArray = require('ml-stat').array;
var convolution = require('ml-matrix-convolution');
var labeling = require("./ccLabeling");


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
function findPeaks2DRegion(input, opt) {
    var options = Object.assign({},{nStdev:3, kernel:smallFilter}, opt);
    var tmp = convolution.matrix2Array(input);
    var inputData = tmp.data;
    var i;
    if(tmp.rows&&tmp.cols){
        options.rows = tmp.rows;
        options.cols = tmp.cols;
    }
    var nRows = options.rows;
    var nCols = options.cols;
    if(!nRows||!nCols){
        throw new Error("Invalid number of rows or columns "+nRows+" "+nCols);
    }

    var customFilter = options.kernel;
    var cs = options.filteredData;
    if(!cs)
        cs = convolution.fft(inputData, customFilter, options);

    var nStdDev = options.nStdev;

    var threshold = 0;
    for( i=nCols*nRows-2;i>=0;i--)
        threshold+=Math.pow(cs[i]-cs[i+1],2);
    threshold=-Math.sqrt(threshold);
    threshold*=nStdDev/nRows;

    var bitmask = new Array(nCols * nRows);
    for( i=nCols * nRows-1;i>=0;i--){
        bitmask[i]=0;
    }
    var nbDetectedPoints = 0;
    for ( i = cs.length-1; i >=0 ; i--) {
        if (cs[i] < threshold) {
            bitmask[i] = 1;
            nbDetectedPoints++;
        }
    }

    var pixels = labeling(bitmask, nCols, nRows, {neighbours:8});
    var peakList  = extractPeaks(pixels, inputData, nRows, nCols);

    if (peakList.length > 0&&DEBUG) {
        console.log("No peak found");
    }
    return peakList;
}
/**
 Detects all the 2D-peaks in the given spectrum based on the Max logic.
 amc
 */
function findPeaks2DMax(input, opt) {
    var options = Object.assign({},{nStdev:3, kernel:smallFilter}, opt);
    var tmp = convolution.matrix2Array(input);
    var inputData = tmp.data;

    if(tmp.rows&&tmp.cols){
        options.rows = tmp.rows;
        options.cols = tmp.cols;
    }
    var nRows = options.rows;
    var nCols = options.cols;
    if(!nRows||!nCols){
        throw new Error("Invalid number of rows or columns "+nRows+" "+nCols);
    }

    var customFilter = options.kernel;
    var cs = options.filteredData;
    if(!cs)
        cs = convolution.fft(inputData, customFilter, options);


    var nStdDev = options.nStdev;
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

function extractPeaks(pixels, data, nRow, nCols){
    //console.log(JSON.stringify(pixels));
    //How many different groups we have?
    var labels = {};
    var row, col, tmp, i;
    for( i = 0; i < pixels.length; i++){
        if(pixels[i]!=0){
            col = i%nCols;
            row = (i-col) / nCols;
            if(labels[pixels[i]]){
                tmp = labels[pixels[i]];
                tmp.x+=col*data[i];
                tmp.y+=row*data[i];
                tmp.z+=data[i];
                if( col < tmp.minX)
                    tmp.minX = col;
                if( col > tmp.maxX)
                    tmp.maxX = col;
                if( row < tmp.minY)
                    tmp.minY = row;
                if( row > tmp.maxY)
                    tmp.maxY = row;
            }
            else{
                labels[pixels[i]]={
                    x:col*data[i],
                    y:row*data[i],
                    z:data[i],
                    minX:col,
                    maxX:col,
                    minY:row,
                    maxY:row
                };
            }
        }
    }
    var keys = Object.keys(labels);
    var peakList = new Array(keys.length);
    for( i = 0; i < keys.length; i++ ){
        peakList[i] = labels[keys[i]];
        peakList[i].x/=peakList[i].z;
        peakList[i].y/=peakList[i].z;
    }
    return peakList;
}

module.exports={
    findPeaks2DRegion:findPeaks2DRegion,
    findPeaks2DMax:findPeaks2DMax
};
