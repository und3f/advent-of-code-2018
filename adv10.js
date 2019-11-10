#!/usr/bin/env node

const fs = require('fs');

let contents = fs.readFileSync("adv10.txt", 'utf8').trim();
let pointRe = /position=<\s*(-?\d+),\s*(-?\d+)>\s*velocity=<\s*(-?\d+),\s*(-?\d+)>/;
let points = contents.split("\n").map(string => {
    let m = string.match(pointRe);
    return {
        position: [parseInt(m[1]), parseInt(m[2])],
        velocity: [parseInt(m[3]), parseInt(m[4])]
    }
});

function preparePoints(points, seconds) {
    let pointsCoordinates = [];
    for (let i in points) {
        let position = points[i].position;
        let velocity = points[i].velocity;
        pointsCoordinates.push(
            [
                position[0] + velocity[0] * seconds,
                position[1] + velocity[1] * seconds
            ]);
    }

    pointsCoordinates.sort((a, b) => {
        if (a[1] != b[1])
            return a[1] - b[1];
        else
            return a[0] - b[0];
    });

    let perimiter = [
        [pointsCoordinates[0][0], pointsCoordinates[0][1]],
        [pointsCoordinates[0][0], pointsCoordinates[0][1]]
    ];

    for (let i in pointsCoordinates) {
        let p = pointsCoordinates[i];
        if (perimiter[0][0] > p[0])
            perimiter[0][0] = p[0];
        else if (perimiter[1][0] < p[0])
            perimiter[1][0] = p[0]

        if (perimiter[0][1] > p[1])
            perimiter[0][1] = p[1];
        else if (perimiter[1][1] < p[1])
            perimiter[1][1] = p[1]
    }
    let offset = [-perimiter[0][0], -perimiter[0][1]];
    let size  = [
        perimiter[1][0]-perimiter[0][0]+1,
        perimiter[1][1]-perimiter[0][1]+1
    ];

    return [pointsCoordinates, perimiter, offset, size];
}

function renderPoints(points, seconds) {
    let prepared = preparePoints(points, seconds);
    let pointsCoordinates = prepared[0];
    let perimiter = prepared[1];
    let offset = prepared[2];
    let size = prepared[3];


    let renderedScreen = new String();
    let nextPoint = 0;
    for (let i = 0; i < size[1]; i++) {
        let line = new Array(size[0]).fill('.');
        let j = 0;

        while (j < size[0]) {
            if (pointsCoordinates[nextPoint][1] + offset[1] != i) {
                renderedScreen += '.'.repeat(size[0] - j);
                break;
            }

            let distanceToNextPoint = pointsCoordinates[nextPoint][0] + offset[0] - j;

            renderedScreen += '.'.repeat(distanceToNextPoint) + "#";
            j += distanceToNextPoint + 1;

            while (pointsCoordinates[nextPoint][0] + offset[0] == j - 1) {
                if (nextPoint < pointsCoordinates.length-1)
                    nextPoint++
                else 
                    nextPoint = 0;
            }

        }

        renderedScreen += "\n";
    }
    return renderedScreen;
}

let perimeter0 =  preparePoints(points, 0)[3];
let smallestArea = perimeter0[0] * perimeter0[1];

let seconds = 1;
while (true) {
    let perimeter = preparePoints(points, seconds)[3];
    let area = perimeter[0] * perimeter[1];
    if (area > smallestArea)
        break;
    smallestArea = area;
    seconds++;
};
seconds--;

console.log("Message after " + seconds + " seconds");
console.log(renderPoints(points, seconds));
