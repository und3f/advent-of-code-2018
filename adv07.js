#!/usr/bin/env node

const fs = require('fs');

let contents = fs.readFileSync("adv7.txt", 'utf8');
let stepsString = contents.split("\n");
stepsString.pop();

let stepGraph = {};
let stepRe = /Step (\w) must be finished before step (\w) can begin./i;
let steps = stepsString.map((str) => {
    let data = str.match(stepRe);
    stepGraph[data[1]] = {requires: [], provides: []};
    stepGraph[data[2]] = {requires: [], provides: []};
    return [data[1], data[2]];
});


for (let i in steps) {
    stepGraph[steps[i][1]].requires.push(steps[i][0]);
    stepGraph[steps[i][0]].provides.push(steps[i][1]);
}

function chooseStep(stepGraph) {
    let possibleSteps = [];
    for (let [key, value] of Object.entries(stepGraph)) {
        if (value.requires.length == 0)
            possibleSteps.push(key);
    }

    return possibleSteps.sort().shift();
}

let order = [];

let point;
let workers = [];
let second = 0;
const MAX_WORKERS = 5;

while ( workers.length > 0 || Object.getOwnPropertyNames(stepGraph).length !== 0) {
    while (workers.length <  MAX_WORKERS && (point = chooseStep(stepGraph))) {
        let provides = stepGraph[point].provides;
        workers.push([second + point.charCodeAt(0) - 64 + 60, point, provides]);
        delete stepGraph[point];
    }

    let nextStep = workers.sort((a, b) => {return a[0] - b[0]}).shift();
    second = nextStep[0];

    order.push(nextStep[1]);
    let provides = nextStep[2];

    for (let i in provides) {
        stepGraph[provides[i]].requires = stepGraph[provides[i]].requires.filter((pointReq) => pointReq !== nextStep[1]);
    }
}

console.log(second, order.join(''));
