'use strict;'

var peaksFinder = require("..");
var FS = require('fs');

var image = JSON.parse(FS.readFileSync(__dirname + "/image2.json").toString());
for(var i=0;i<image.length;i++){
    image[i]-=45000;
}

describe('matrix-peaks-finder test library name', function () {
    it('should return true', function () {
        peaksFinder.findPeaks2DLoG.should.be.object;
        peaksFinder.findPeaks2DMax.should.be.object;
    });
});

describe('matrix-peaks-finder image matrix', function () {
    it('should find some peaks based on center of mass. :)', function () {
        var peaks = peaksFinder.findPeaks2DLoG(image,null,300,300,5);
        peaks.length.should.greaterThan(10);
    });
    it('should find some peaks based on all local maxima. :)', function () {
        var peaks = peaksFinder.findPeaks2DMax(image,null,300,300,5);
        peaks.length.should.greaterThan(10);
    });
});

