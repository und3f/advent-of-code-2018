#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

let contents = fs.readFileSync(
    path.basename(__filename, ".js") + ".txt", 'utf8')
    .trim();

function Forest(mapString) {
    this.map = mapString.split("\n").map(l => l.split(""));
    this.height = this.map.length;
    this.width = this.map[0].length;
}

Forest.prototype.getSurrounding = function (oy, ox) {
    let surrounding = {};
    for (let y = oy - 1; y <= oy + 1; y++) {
        for (let x = ox - 1; x <= ox + 1; x++) {
            if (y == oy && x == ox)
                continue;

            if (this.map[y] != null) {
                const symbol = this.map[y][x];
                if (symbol != null)
                    surrounding[symbol] = (surrounding[symbol] || 0) + 1;
            }
        }
    }
    return surrounding;
}

Forest.prototype.spendMinute = function() {
    let newMap = new Array(this.height).fill(0).map(() => new Array(this.width));

    for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
            let acreContent = this.map[y][x];
            let surrounding = this.getSurrounding(y, x);

            switch (acreContent) {
                case '.':
                    if (surrounding['|'] >= 3)
                        acreContent = '|';
                    break;
                case '|':
                    if (surrounding['#'] >= 3)
                        acreContent = '#';
                    break;
                case '#':
                    if (!(surrounding['#'] >= 1 && surrounding['|'] >= 1))
                        acreContent = '.';
                    break;
            }
            newMap[y][x] = acreContent;
        }
    }
    this.map = newMap;
}

Forest.prototype.toString = function() {
    return this.map.map(a => a.join("")).join("\n");
}

Forest.prototype.value = function() {
    let wooded = 0, lumberyards = 0;

    for (let y = 0; y < this.height; y++)
        for (let x = 0; x < this.width; x++) {
            const s = this.map[y][x];
            if (s === '|')
                wooded++;
            else if (s === '#')
                lumberyards++;
        }

    return wooded * lumberyards;
}

let forest = new Forest(contents);
//console.log(forest.toString(), "\n");

let i;
for (i = 0; i < 10; i++)
    forest.spendMinute();
// console.log(forest.toString(), "\n");
console.log("Part One:", forest.value());

let states = []
let cycle;
let partTwoTarget = 1000000000;
for (; i < partTwoTarget; i++) {
    forest.spendMinute();
    let fs = forest.toString();
    let sameState = states.indexOf(fs);

    if (cycle === undefined && sameState != -1) {
        delete states;
        cycle = i - sameState;
        i = (i + cycle * Math.floor((partTwoTarget - 1 - i) / cycle))
    } else 
        states[i] = fs;
}

console.log("Part Two:", forest.value());


