#!/usr/bin/env node

const Computer = require('./computer');

const fs = require('fs');
const path = require('path');

let contents = fs.readFileSync(
    path.basename(__filename, ".js") + ".txt", 'utf8')
    .trim();
let instructions = contents.split("\n").map(l => l.split(" "))

function findCheckingInstruction(instructions) {
	let directives = 0;
	for (let i in instructions) {
		if (instructions[i][0][0] === '#') {
			directives++
		} else if (instructions[i][0] == 'eqrr') {
			let register = instructions[i][1]
			if (register == 0) {
				register = instructions[i][2]
			}
			return [i-directives, register]
		}
	}
}

let checkingInstructionLine, register;
[checkingInstructionLine, register] = findCheckingInstruction(instructions)
let computer = new Computer();
computer.execute([["#break", checkingInstructionLine]].concat(instructions));
let partOne = computer.state[register]
console.log("Part one:", partOne)

let values = {}
let partTwo;
do {
	partTwo = computer.state[register]
	values[partTwo] = 1
computer.execute([["#break", checkingInstructionLine]].concat(instructions));
// console.log("Register", computer.state[register])
} while (!values[computer.state[register]])

console.log("Part two:", partTwo)


