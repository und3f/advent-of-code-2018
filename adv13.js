#!/usr/bin/env node

const fs = require('fs');

const Directions = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
};


const CartDirectionToString = [
    '^', '>', 'v', '<', 'X'
];

const DirectionsToString = function() {
    let up_s = Directions.UP.toString();
    let right_s = Directions.RIGHT.toString();
    let down_s = Directions.DOWN.toString();
    let left_s = Directions.LEFT.toString();

    let directionsToString = {};
    directionsToString[up_s + down_s] = '|';
    directionsToString[right_s + left_s] = '-';
    directionsToString[up_s + right_s] = '\\';
    directionsToString[down_s + left_s] = '\\';
    directionsToString[up_s + left_s] = '/';
    directionsToString[right_s + down_s] = '/';
    directionsToString[up_s + right_s + down_s + left_s] = '+';
    return directionsToString;
}();

let gridStrings = fs.readFileSync("adv13.txt", 'utf8').trimEnd().split("\n");

let height = gridStrings.length;
let width = gridStrings.reduce(
    (accumulator, currentValue) => Math.max(accumulator, currentValue.length)
    , 0
);
// console.log(height, width);

let grid = new Array(height).fill(0).map(el => new Array(width));
let carts = new Array;

for (let y = 0; y < gridStrings.length; y++) {
    for (let x = 0; x < gridStrings[y].length; x++) {
        switch (gridStrings[y][x]) {
            case '+':
                grid[y][x] = [
                    Directions.UP,
                    Directions.RIGHT,
                    Directions.DOWN,
                    Directions.LEFT
                ];
                break;

            case '>':
                carts.push({y: y, x: x, direction: Directions.RIGHT});
                grid[y][x] = [Directions.RIGHT, Directions.LEFT];
                break;
            case '<':
                carts.push({y: y, x: x, direction: Directions.LEFT});
            case '-':
                grid[y][x] = [Directions.RIGHT, Directions.LEFT];
                break;

            case '^':
                carts.push({y: y, x: x, direction: Directions.UP});
                grid[y][x] = [Directions.UP, Directions.DOWN];
                break;
            case 'v':
                carts.push({y: y, x: x, direction: Directions.DOWN});
            case '|':
                grid[y][x] = [Directions.UP, Directions.DOWN];
                break;
            case '/':
                if (y > 0 && grid[y-1][x] && grid[y-1][x].indexOf(Directions.DOWN) != -1)
                    grid[y][x] = [Directions.UP, Directions.LEFT];
                else
                    grid[y][x] = [Directions.RIGHT, Directions.DOWN];
                break;

            case '\\':
                if (y > 0 && grid[y-1][x] && grid[y-1][x].indexOf(Directions.DOWN) != -1)
                    grid[y][x] = [Directions.UP, Directions.RIGHT];
                else
                    grid[y][x] = [Directions.DOWN, Directions.LEFT];

                break;

        }
    }
}

function trackToString(grid, carts) {
    let lines = [];
    for (let y in grid) {
        let line = "";
        for (let x = 0; x < width; x++) {
            let track = grid[y][x];
            if (track == null)
                line += " ";
            else {
                let code = track.map(x => x.toString()).join("");
                let c = DirectionsToString[code] || '?';
                line += c;
            }
        }
        lines.push(line);
    }

    for (let i in carts) {
        let cart = carts[i];
        let line = lines[cart.y];
        lines[cart.y] = 
            line.substr(0, cart.x)
            + CartDirectionToString[cart.direction] 
            + line.substr(cart.x + 1);

    }

    return lines.join("\n");
}

function tick(grid, carts) {
    let crash;

    for (let i in carts) {
        let cart = carts[i];

        if (cart.direction == 4)
            continue;

        // Move the cart
        switch (cart.direction) {
            case Directions.UP:
                cart.y--;
                break;
            case Directions.RIGHT:
                cart.x++;
                break;
            case Directions.DOWN:
                cart.y++;
                break;
            case Directions.LEFT:
                cart.x--;
                break;
        }


        // Turn the cart
        let track = grid[cart.y][cart.x];

        if (track == null)
            debugger;

        if (track.length == 4) {
            let nextTurn = cart.nextTurn || 0;

            let directionChange = 0
            if (nextTurn == 0)
                directionChange = -1 + 4;
            else if (nextTurn == 2)
                directionChange = 1;

            cart.direction = (cart.direction + directionChange) % 4;
            cart.nextTurn = (nextTurn + 1) % 3;
        } else if (track.indexOf(cart.direction) == -1) {
            let nextDirection = (cart.direction + 1) % 4;
            if (track.indexOf(nextDirection) == -1) {
                nextDirection = (cart.direction + 3) % 4;
            }
            cart.direction = nextDirection;
        }

        // Check for the crash
        for (let j in carts) {
            if (i == j)
                continue;
            if (carts[i].x == carts[j].x && carts[i].y == carts[j].y) {
                carts[i].direction = 4;
                carts[j].direction = 4;
                crash = [carts[i].x, carts[i].y];
            }
        }
    }

    return crash;
}

let crash;
// console.log(trackToString(grid, carts));
while (crash == null) {
    crash = tick(grid, carts);
    //console.log(trackToString(grid, carts));
}

console.log("First crash: ", crash.join(","));

carts = carts.filter(cart => cart.direction != 4);
while (carts.length > 1) {
    crash = tick(grid, carts);
    console.log(trackToString(grid, carts));
    if (crash)
        carts = carts.filter(cart => cart.direction != 4);
}

console.log("Last cart: ", carts[0].x + "," + carts[0].y);
