'use strict'

const DisjointSet = require('ml-disjoint-set');

const direction4X = [-1, 0];
const direction4Y = [0, -1];
const neighbours4 = [null, null];

const direction8X = [-1, -1, 0, 1];
const direction8Y = [0, -1, -1, -1];
const neighbours8 = [null, null, null, null];

function ccLabeling(mask, width, height, options) {
    options = options || {};
    const neighbours = options.neighbours || 8;

    var directionX;
    var directionY;
    var neighboursList;
    if (neighbours === 8) {
        directionX = direction8X;
        directionY = direction8Y;
        neighboursList = neighbours8;
    } else if (neighbours === 4) {
        directionX = direction4X;
        directionY = direction4Y;
        neighboursList = neighbours4;
    } else {
        throw new RangeError('unsupported neighbours count: ' + neighbours);
    }

    const size = mask.length;
    const labels = new Array(size);
    const pixels = new Int16Array(size);
    const linked = new DisjointSet();
    var index;
    var currentLabel = 1;
    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            // true means out of background
            var smallestNeighbor = null;
            index = i + j * width;

            if (mask[index]) {
                for (var k = 0; k < neighboursList.length; k++) {
                    var ii = i + directionX[k];
                    var jj = j + directionY[k];
                    if (ii >= 0 && jj >= 0 && ii < width && jj < height) {
                        var neighbor = labels[ii + jj * width];
                        if (!neighbor) {
                            neighboursList[k] = null;
                        } else {
                            neighboursList[k] = neighbor;
                            if (!smallestNeighbor || neighboursList[k].value < smallestNeighbor.value) {
                                smallestNeighbor = neighboursList[k];
                            }
                        }
                    }
                }
                if (!smallestNeighbor) {
                    labels[index] = linked.add(currentLabel++);
                } else {
                    labels[index] = smallestNeighbor;
                    for (var k = 0; k < neighboursList.length; k++) {
                        if (neighboursList[k] && neighboursList[k] !== smallestNeighbor) {
                            linked.union(smallestNeighbor, neighboursList[k]);
                        }
                    }
                }
            }
        }
    }

    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            index = i + j * width;
            if (mask[index]) {
                pixels[index] = linked.find(labels[index]).value;
            }
        }
    }
    return pixels;

}

module.exports = ccLabeling;
