#!/usr/bin/env node

const fs = require('fs');

let contents = fs.readFileSync("adv6.txt", 'utf8');
let coordinatesString = contents.split("\n");
coordinatesString.pop();

let points = [];
for (let i in coordinatesString) {
    let coord = coordinatesString[i].trim().split(", ");
    points.push([parseInt(coord[0]), parseInt(coord[1])]);
}

let perimeter = [[points[0][0], points[0][1]], [points[0][0], points[0][1]]];

for (let i in points) {
    let p = points[i];
    for (let k = 0; k < 2; k++) {
        if (perimeter[0][k] > p[k])
            perimeter[0][k] = p[k];
        else if (perimeter[1][k] < p[k])
            perimeter[1][k] = p[k];
    }
}

let pointArea = new Array(points.length).fill(0);

function distance(p1, p2) {
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

function closestPoint(p, points) {
    let distances = points
        .map((value, index) => [distance(p, value), index])
        .sort((a, b) => a[0] - b[0]);

    // equally far location
    if (distances[0][0] == distances[1][0])
        return null;

    return distances[0][1];
}

for (let i = perimeter[0][0]; i <= perimeter[1][0]; i++) {
    for (let j = perimeter[0][1]; j <= perimeter[1][1]; j++) {
        let p = closestPoint([i, j], points);
        if (p == null)
            continue;

        pointArea[p]++;
    }
}

// Remove infinite areas
for (let i = perimeter[0][0]-1; i <= perimeter[1][0]+1; i++) {
    let otherAxises = [perimeter[0][1]-1, perimeter[1][1]+1];
    for (let j in otherAxises) {
        let p = closestPoint([i, otherAxises[j]], points) ;
        if (p == null)
            continue;
        pointArea[p] = 0;
    }
}

console.log("Largest area is:", pointArea.reduce((acc, value) => { return Math.max(acc, value)}, 0));


const MAX_TOTAL_DISTANCE = 10000;
let closestTotalDistance = [MAX_TOTAL_DISTANCE + 1, [null, null]];
let regionSize = 0;
for (let i = perimeter[0][0]; i <= perimeter[1][0]; i++) {
    for (let j = perimeter[0][1]; j <= perimeter[1][1]; j++) {
        let totalDistance = 0;
        let p = [i, j];
        for (let k in points) {
            totalDistance += distance(p, points[k]);
            if (totalDistance > MAX_TOTAL_DISTANCE)
                break;
        }

        if (totalDistance < MAX_TOTAL_DISTANCE) {
            regionSize ++;
            //closestTotalDistance = [totalDistance, p];
        }
    }
}

console.log("Part two:", regionSize);
