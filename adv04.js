#!/usr/bin/env node

const fs = require('fs');

let contents = fs.readFileSync("adv4.txt", 'utf8');
let logStrings = contents.split("\n");
logStrings.pop();

let logRe = new RegExp('^\\[(\\d+)-(\\d+)-(\\d+) (\\d+):(\\d+)] (.+)$');
let shiftRe = new RegExp('Guard #(\\d+) begins shift');
let log = [];

let guardsSleep = {};

for (let i in logStrings) {
    let logString = logStrings[i];
    let data = logString.match(logRe);

    let date = [];
    for (let j =  1; j <= 5; j++)
        date.push(parseInt(data[j]));

    let record = {date: date};

    let shiftData = data[6].match(shiftRe)
    if (shiftData != null) {
        record.type = "shift";
        record.guard = parseInt(shiftData[1]);
        guardsSleep[record.guard] = new Array(60).fill(0);
    } else {
        record.type = data[6];
    }
    log.push(record);
}

log.sort(
    (a, b) => {
        for (let i = 0; i < 5; i++) {
            let diff = a.date[i] - b.date[i];
            if (diff !== 0)
                return diff
        }
    }
);

let guard = null;
let asleepTime = null;

for (let i in log) {
    let record = log[i];

    switch(record.type) {
        case 'shift':
            guard = record.guard;
            break;
        case 'falls asleep':
            asleepTime = record.date;
            break;
        case 'wakes up':
            for (let minute = asleepTime[4]; minute < record.date[4]; minute++) {
                guardsSleep[guard][minute]++;
            }
            break;
    }
}

function strategy1(guardsSleep) {
    let maxSleepGuard = [null, 0];
    for (let i in guardsSleep) {
        let sum = guardsSleep[i].reduce((accumulator, currentValue) => accumulator + currentValue);
        if (sum > maxSleepGuard[1]) {
            maxSleepGuard = [i, sum];
        }
    }


    let maxSleepMinute = [null, 0];
    let guardSleeps = guardsSleep[maxSleepGuard[0]];
    for (let minute in guardSleeps) {
        if (guardSleeps[minute] > maxSleepMinute[1])
            maxSleepMinute = [minute, guardSleeps[minute]];
    }

    console.log('Strategy 1: guard #' + maxSleepGuard[0], 'on minute', maxSleepMinute[0]);
}

function strategy2(guardsSleep) {

    let maxSleepGuard = [null, null, 0];
    for (let guard in guardsSleep) {
        for (let minute = 0; minute < 60; minute++) {
            if (guardsSleep[guard][minute] > maxSleepGuard[2])
                maxSleepGuard = [guard, minute, guardsSleep[guard][minute]]
        }
    }

    console.log('Strategy 2: guard #' + maxSleepGuard[0], 'on minute', maxSleepGuard[1]);
}

strategy1(guardsSleep);
strategy2(guardsSleep);

