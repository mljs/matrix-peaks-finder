'use strict;'

var peaksFinder = require("..");
var FS = require('fs');

var image = JSON.parse(FS.readFileSync(__dirname + "/image.json").toString());


describe('matrix-peaks-finder test library name', function () {
    it('should return true', function () {
        peaksFinder.findPeaks2DLoG.should.be.object;
        peaksFinder.findPeaks2DMax.should.be.object;
    });
});


var peaks = peaksFinder.findPeaks2DLoG(image,null,300,300,1);
console.log(peaks);
console.log(peaks.length);