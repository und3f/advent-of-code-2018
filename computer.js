"use strict";

module.exports = Computer;

function Computer(_state) {
    let state = this.state = _state !== undefined ? [0].concat(_state) : new Array(6).fill(0);
    this.ip = 0;

    let that = this;

    this.opcodes = {
        addr: (a, b, c) => state[c] = state[a] + state[b],
        addi: (a, b, c) => state[c] = state[a] + b,
        mulr: (a, b, c) => state[c] = state[a] * state[b],
        muli: (a, b, c) => state[c] = state[a] * b,
        banr: (a, b, c) => state[c] = state[a] & state[b],
        bani: (a, b, c) => state[c] = state[a] & b,
        borr: (a, b, c) => state[c] = state[a] | state[b],
        bori: (a, b, c) => state[c] = state[a] | b,
        setr: (a, b, c) => state[c] = state[a],
        seti: (a, b, c) => state[c] = a,
        gtir: (a, b, c) => state[c] = a > state[b] ? 1 : 0,
        gtri: (a, b, c) => state[c] = state[a] > b ? 1 : 0,
        gtrr: (a, b, c) => state[c] = state[a] > state[b] ? 1 : 0,
        eqir: (a, b, c) => state[c] = a == state[b] ? 1 : 0,
        eqri: (a, b, c) => state[c] = state[a] == b ? 1 : 0,
        eqrr: (a, b, c) => state[c] = state[a] == state[b] ? 1 : 0,
    }

}

Computer.prototype.execute = function(_instructions) {
    let instructions = _instructions.slice();

    let breakPoint = null;
    while (instructions[0][0][0] === '#') {
        const declaration = instructions.shift();
        switch(declaration[0]) {
            case '#ip':
                this.ip = declaration[1];
								break;
            case '#break':
                breakPoint = parseInt(declaration[1]);
								break;
        }
    }

    // Precompile code
    let code = instructions.map(instruction => {
        const ag = instruction.slice(1).map(s => parseInt(s));
        const fn = this.opcodes[instruction[0]];
        return [fn, ag];
    });

    let iStats = new Array(code.length).fill(0);
    let n = 0;
    for (let i = this.state[this.ip]; i < code.length; i = this.state[this.ip]) {

        //process.stdout.write(this.toString() + " " + instructions[i].join(" ") + "\n");
        iStats[i]++;

        if (breakPoint === i)
            break;
        /*
        if (n++ == 40000)
            break;
            */
        code[i][0].apply(this, code[i][1]);
        this.state[this.ip]++;
    }

}

Computer.prototype.toString = function() {
    return "ip=" + this.state[this.ip] + " [" + this.state.join(", ") + "]";
}
