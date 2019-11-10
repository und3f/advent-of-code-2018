#!/usr/bin/env node

const fs = require('fs');

let contents = fs.readFileSync("adv5.txt", 'utf8');
let polymerString = contents.split("\n")[0];

function reducePolymer(polymer) {
    for (let i = 0; i < polymer.length-1; i += 1) {
        if (polymer[i] != polymer[i+1] && polymer[i].toLowerCase() == polymer[i+1].toLowerCase()) {
            polymer.splice(i, 2);
            return true;
        }
    }
    return false;
}

function part1(polymerString) {
    let polymer = polymerString.split('');
    //console.log(polymer);

    while (reducePolymer(polymer)) {
    }
    console.log('Part one:', polymer.length);
}

function part2(polymerString) {
    let problematicPolymer = [null, polymerString.length];
    for (let i = 97; i <= 122; i++) {
        let char = String.fromCharCode(i);

        let reducedPolymerString = polymerString.replace(new RegExp(char, "gi"), '');

        let polymer = reducedPolymerString.split('');
        while (reducePolymer(polymer)) {
        }

        if (polymer.length < problematicPolymer[1])
            problematicPolymer = [char, polymer.length];
    }
    console.log('Part two:', problematicPolymer);
}

part2(polymerString);
