#!/usr/bin/env node

const fs = require('fs');

let contents = fs.readFileSync("adv12.txt", 'utf8').trim();
let pointRe = /position=<\s*(-?\d+),\s*(-?\d+)>\s*velocity=<\s*(-?\d+),\s*(-?\d+)>/;
let lines = contents.split("\n");
let initial = lines.shift().split(": ")[1];
lines.shift();

let spread = lines.map(string => {
    let r = string.trim().split(" => ");
    return r;
});

console.log(initial, spread);

const neighborth = 2;
function generateNextGeneration(state, spread) {
    let generation = new String();
    for (let i = 0; i < state.length; i++) {
        let potState = state.substring(Math.max(0, i - neighborth), Math.min(i + neighborth + 1, state.length));
        if (i < neighborth) {
            potState = state.substring(state.length + i - neighborth, state.length) + potState;
        }
        else if (i >= state.length - neighborth) {
            potState += state.substring(0, i - (state.length - neighborth) + 1);
        }
        // console.log(potState);

        let result = '.';
        for (let i in spread) {
            if (potState == spread[i][0]) {
                result = spread[i][1];
                break;
            }
        }
        generation += result;
    }

    return generation;
}

let left = 0;
let generation = initial;
console.log(0, generation);

for (let i = 1; i <= 20; i++) {

    if (generation[0] == '#' || generation[1] == '#') {
        generation = '..' + generation;
        left += 2;
    }

    if (generation[generation.length - 1] == '#' || generation[generation.length - 2] == '#')
        generation += '..';

    generation = generateNextGeneration(generation, spread);
    console.log(i, generation);
}

let sum = 0;
for (let i = 0; i < generation.length - 1; i++) {
    if (generation[i] == '#')
        sum += i - left;
}
console.log(sum);
