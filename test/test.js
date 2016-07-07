'use strict;'

var peaksFinder = require("..");
describe('matrix-peaks-finder test library name', function () {
    it('should return true', function () {
        peaksFinder.findPeaks2DLoG.should.be.object;
        peaksFinder.findPeaks2DMax.should.be.object;
    });
});
