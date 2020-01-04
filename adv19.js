#!/usr/bin/env node

const Computer = require('./computer');

const fs = require('fs');
const path = require('path');

let contents = fs.readFileSync(
    path.basename(__filename, ".js") + ".txt", 'utf8')
    .trim();
let instructions = contents.split("\n").map(l => l.split(" "))

instructions.unshift(["#break", 1]);

const primes = [2, 3, 5, 7, 11];

function primeFactors(n) {
    let factors = [];
    let i = 2;

    while (i * i <= n) {
        if (n % i === 0) {
            n = n / i;
            factors.push(i);
        } else {
            i++;
        }
    }

    if (n > 1)
        factors.push(n);

    return factors;
}

function computeDivisorsSum(number) {
    return ["Calculate divisors of a number", number, "htt"+"ps://www.dco"+"de.fr/divisors-list-number"].join(" ");
}

let computer = new Computer();
computer.execute(instructions);

console.log("Part One:", computeDivisorsSum(computer.state[3]));

computer = new Computer();
computer.state[0] = 1;
computer.execute(instructions);
console.log("Part Two:", computeDivisorsSum(computer.state[3]));
