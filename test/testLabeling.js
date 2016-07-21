/**
 * Created by acastillo on 7/21/16.
 */
var labeling = require('../src/ccLabeling');

var rows = 8, cols = 8;

const bitmask1 = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1,
];
const result1 = new Int16Array([
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 2, 2, 2,
    0, 0, 0, 0, 0, 2, 2, 2,
    0, 0, 0, 0, 0, 2, 2, 2,
    0, 0, 0, 0, 0, 2, 2, 2,
    0, 0, 0, 0, 0, 2, 2, 2
]);

const bitmask2 = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1,
];
const result2_4 = new Int16Array([
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 2, 2, 2, 2,
    0, 0, 0, 0, 0, 2, 2, 2,
    0, 0, 0, 0, 0, 2, 2, 2,
    0, 0, 0, 0, 0, 2, 2, 2
]);

const result2_8 = new Int16Array([
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 1
]);


describe('Labeling', function () {
    it(' has to find 2 regions', function () {
        var labels = labeling(bitmask1, rows, cols);
        labels.should.eql(result1);
    });

    it(' has to find 2 regions using 4 neighbours', function () {
        var labels = labeling(bitmask2, rows, cols, {neighbours:4});
        labels.should.eql(result2_4);
    });

    it(' has to find 2 regions using 8 neighbours', function () {
        var labels = labeling(bitmask2, rows, cols, {neighbours:8});
        labels.should.eql(result2_8);
    });
});
