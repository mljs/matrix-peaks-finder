'use strict;'

var peaksFinder = require("..");
var FS = require('fs');

var image = JSON.parse(FS.readFileSync(__dirname + "/image2.json").toString());
var rows = 300, cols=300;
for(var i=0;i<image.length;i++){
    image[i]-=45000;
}

var imageAsMatrix = new Array(rows);
for(var i=0;i<rows;i++){
    imageAsMatrix[i]=new Array(cols);
    for(var j=0;j<cols;j++){
        imageAsMatrix[i][j]=image[i*cols+j];
    }
}

describe('matrix-peaks-finder test library name', function () {
    it('should return true', function () {
        peaksFinder.findPeaks2DRegion.should.be.object;
        peaksFinder.findPeaks2DMax.should.be.object;
    });
});

describe('matrix-peaks-finder image matrix', function () {
    it('should find some peaks based on center of mass. Array', function () {
        var peaks = peaksFinder.findPeaks2DRegion(image,{rows:rows, cols:rows, nStdev:5});
        peaks.length.should.greaterThan(10);
    });
    it('should find some peaks based on all local maxima. Array', function () {
        var peaks = peaksFinder.findPeaks2DMax(image,{rows:rows, cols:rows, nStdev:5});
        peaks.length.should.greaterThan(10);
    });
});

describe('matrix-peaks-finder image matrix', function () {
    it('should find some peaks based on center of mass. Matrix', function () {
        var peaks = peaksFinder.findPeaks2DRegion(imageAsMatrix,{nStdev:5});
        peaks.length.should.greaterThan(10);
    });
    it('should find some peaks based on all local maxima. Matrix', function () {
        var peaks = peaksFinder.findPeaks2DMax(imageAsMatrix,{nStdev:5});
        peaks.length.should.greaterThan(10);
    });
});

