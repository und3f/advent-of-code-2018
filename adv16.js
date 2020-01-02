#!/usr/bin/env node

const fs = require('fs');
let contents = fs.readFileSync("adv16.txt", 'utf8').trim();
let samples, testProgram;
[samples, testProgram] = contents.split("\n\n\n\n");
samplesRe = /Before: \[(.+)\]\n([\d ]+)\nAfter: +\[(.+)\]/;
samples = samples.split("\n\n").map(l => l.match(samplesRe).slice(1,4).map(s => s.split(/,? /).map(s => parseInt(s))));
testProgram = testProgram.split("\n").map(l => l.split(" ").map(s => parseInt(s)));

function Computer(state) {
    this.state = state.slice();

    let that = this;
    let gr = (r) => that.state[r];
    let sr = (r, v) => that.state[r] = v;

    this.opcodes = {
        addr: (a, b, c) => sr(c, gr(a) + gr(b)),
        addi: (a, b, c) => sr(c, gr(a) + b),
        mulr: (a, b, c) => sr(c, gr(a) * gr(b)),
        muli: (a, b, c) => sr(c, gr(a) * b),
        banr: (a, b, c) => sr(c, gr(a) & gr(b)),
        bani: (a, b, c) => sr(c, gr(a) & b),
        borr: (a, b, c) => sr(c, gr(a) | gr(b)),
        bori: (a, b, c) => sr(c, gr(a) | b),
        setr: (a, b, c) => sr(c, gr(a)),
        seti: (a, b, c) => sr(c, a),
        gtir: (a, b, c) => sr(c, a > gr(b) ? 1 : 0),
        gtri: (a, b, c) => sr(c, gr(a) > b ? 1 : 0),
        gtrr: (a, b, c) => sr(c, gr(a) > gr(b) ? 1 : 0),
        eqir: (a, b, c) => sr(c, a == gr(b) ? 1 : 0),
        eqri: (a, b, c) => sr(c, gr(a) == b ? 1 : 0),
        eqrr: (a, b, c) => sr(c, gr(a) == gr(b) ? 1 : 0),
    }
}

Computer.prototype.execute = function(instruction) {
    this.opcodes[instruction[0]](...(instruction.slice(1)));
}

Computer.prototype.findSuitableInstructions = function(_instruction, expectedResult) {
    let expectedResultS = JSON.stringify(expectedResult);
    let instructionArgument = _instruction.slice();
    let originalState = this.state.slice();

    let opcode = instructionArgument.shift();
    let possibleInstructions = [];
    for (let instruction in this.opcodes) {
        this.opcodes[instruction](...instructionArgument);

        if (JSON.stringify(this.state) === expectedResultS)
            possibleInstructions.push(instruction);
        this.state = originalState.slice();
    }
    return possibleInstructions;
}


let behaveLikeThreeOrMoreOpcodes = 0;
let opcodePossibleInstructions = {};

samples.forEach(sample => {
    let opcode = sample[1][0];
    let computer = new Computer(sample[0]);
    let possibleInstructions = computer.findSuitableInstructions(sample[1], sample[2]);
    if (possibleInstructions.length >= 3)
        behaveLikeThreeOrMoreOpcodes++;

    possibleInstructions.forEach(instruction => {
        if (opcodePossibleInstructions[opcode] == null)
            opcodePossibleInstructions[opcode] = possibleInstructions
        else {
            let a = new Set(opcodePossibleInstructions[opcode]);

            opcodePossibleInstructions[opcode] = possibleInstructions.filter(i => a.has(i));
        }
    });
});

let opcodeToInstruction = {};

let totalInstructions = Object.keys(opcodePossibleInstructions).length;

let determinedInstructions = new Set();
while (Object.keys(opcodeToInstruction).length < totalInstructions) {
    for (let i in opcodePossibleInstructions) {
        let possibleInstructions = opcodePossibleInstructions[i];
        //console.log(i, possibleInstructions, possibleInstructions.length);
        if (possibleInstructions.length == 1) {
            let instruction = possibleInstructions.shift();
            console.log("Found", i, instruction);
            determinedInstructions.add(instruction);
            opcodeToInstruction[i] = instruction;
            delete opcodePossibleInstructions[i];
        } else if (possibleInstructions.length - determinedInstructions.size <= 1) {
            opcodePossibleInstructions[i] = opcodePossibleInstructions[i].filter(i => !determinedInstructions.has(i));
        }
    }
}

console.log(opcodeToInstruction);
let computer = new Computer(new Array(5).fill(0));
console.log(testProgram);
testProgram.forEach(machineCode => {
    let instruction = [opcodeToInstruction[machineCode[0]]].concat(machineCode.slice(1));
    computer.execute(instruction);
});

console.log("Part One:", behaveLikeThreeOrMoreOpcodes);

console.log("Part Two:", computer.state[0]);
