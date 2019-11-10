#!/usr/bin/env node

const fs = require('fs');

let contents = fs.readFileSync("adv1.txt", 'utf8');
let changes = contents.split("\n").map(s => parseInt(s));
changes.pop();
console.log(changes);


let freq = 0;
let freqs = {};

let i = 0;
do {
    freq += changes[i];

    if (freqs[freq] !== undefined) {
        console.log("Found: ", freq);
        break;
    }

    freqs[freq] = i;

    i++;
    if (i == changes.length)
        i = 0;
} while(true);
