#!/usr/bin/env node

const fs = require('fs');

let contents = fs.readFileSync("adv3.txt", 'utf8');
let claimStrings = contents.split("\n");
claimStrings.pop();

let claimOverlaps = {};
let events = [];
let claimRe = new RegExp('^#(\\d+) @ (\\d+),(\\d+): (\\d+)x(\\d+)');
for (let i in claimStrings) {
    let claimString = claimStrings[i];
    let data = claimString.match(claimRe);
    let rect = {
        "id": parseInt(data[1]),
        "x": parseInt(data[2]),
        "y": parseInt(data[3]),
        "width": parseInt(data[4]),
        "height": parseInt(data[5])
    }
    events.push([rect.x, function(claims) {claims.push(rect)}]);
    events.push([rect.x + rect.width,
        function(claims) {
            claims.splice(claims.indexOf(rect), 1);
        }
    ]);
    claimOverlaps[rect.id] = 0;
}

events.sort((a, b) => {return a[0] - b[0]});

function calculateOverlaps(aClaims) {
    let overlaps = 0;

    let eventsY = [];
    for (let i in aClaims) {
        let rect = aClaims[i];
        eventsY.push([rect.y, (claims) => {claims.push(rect)}]);
        eventsY.push([rect.y + rect.height, (claims) => {
            claims.splice(claims.indexOf(rect), 1);
        }]);
    }
    eventsY.sort((a, b) => {return a[0] - b[0]});

    let y = 0;
    let currentClaims = [];
    while (eventsY.length > 0) {
        let nextY = eventsY[0][0];
        if (currentClaims.length > 1) {
            overlaps += nextY - y;
            for (let i in currentClaims) {
                claimOverlaps[currentClaims[i].id]++;
            }
        }

        while (eventsY.length > 0 && eventsY[0][0] == nextY) {
            eventsY.shift()[1](currentClaims);
        }
        y = nextY;
    }
    return overlaps;
}

let x = 0;
let overlaps = 0;
let claims = [];
while (events.length > 0) {
    let nextX = events[0][0];
    overlaps += calculateOverlaps(claims) * (nextX - x);

    while (events.length > 0 && events[0][0] == nextX) {
        events.shift()[1](claims);
    }
    x = nextX;
}

console.log("Total overlaps: ", overlaps);
for (let k in claimOverlaps) {
    if (claimOverlaps[k] == 0)
        console.log("Doesn't overlaps: ", k);
}
