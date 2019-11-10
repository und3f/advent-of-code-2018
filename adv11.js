#!/usr/bin/env node

const fs = require('fs');

let serial = 7347;

function findPowerLevel(serial, x, y) {
    let rackID = x + 10;
    let startPowerLevel = (rackID * y + serial) * rackID;
    let hundredsDigit = Math.floor(startPowerLevel / 100) % 10;
    return hundredsDigit - 5;
}

const gridSize = 300;
let grid = new Array(gridSize).fill(0).map(a => new Array(gridSize));

for (let i = 0; i < gridSize; i++)
    for (let j = 0; j < gridSize; j++)
        grid[i][j] = findPowerLevel(serial, i, j);

function findBestSquare(grid, squareSize) {
    let bestSum = {
        sum: 0,
    }

    for (let x = 0; x < gridSize - squareSize; x++) {
        for (let y = 0; y < gridSize - squareSize; y++) {
            let sum = 0;
            for (let i = 0; i < squareSize; i++)
                for (let j = 0; j < squareSize; j++)
                    sum += grid[i + x][j + y];

            if (bestSum.sum < sum)
                bestSum = {
                    sum: sum,
                    x: x,
                    y: y,
                    squareSize: squareSize
                };
        }
    }
    return bestSum;
}

console.log("Part1: ", findBestSquare(grid, 3));

let bestSum = {sum: 0};
for (let squareSize = 1; squareSize < 300; squareSize++) {
    if (squareSize % 10 == 0)
        console.log("Trying: ", squareSize, "best sum so far", bestSum);
    let sum = findBestSquare(grid, squareSize);
    if (sum.sum > bestSum.sum)
        bestSum = sum;
}

console.log("Part1: ", bestSum);
