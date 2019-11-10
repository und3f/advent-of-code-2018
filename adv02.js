#!/usr/bin/env node

const fs = require('fs');

let contents = fs.readFileSync("adv2.txt", 'utf8');
let ids = contents.split("\n");
ids.pop();

function part1(ids) {
    let founds = {};

    for (let i in ids) {
        let str = ids[i];

        let letters = {};
        for (let j in str) {
            let letter = str[j];
            letters[letter] = (letters[letter] || 0) + 1;
        }

        let found = {};
        for (let j in letters) {
            if (letters[j] > 1) {
                found[letters[j]] = 1;
            }
        }

        let aFound = Object.keys(found);
        for (let j in aFound) {
            let n = aFound[j];
            founds[n] = (founds[n] || 0) + 1;
        };
    }

    console.log(founds);
}

function part2(ids) {
    function diff(str1, str2) {
        let length = Math.max(str1.length, str2.length);

        let diff = 0;
        for (let i = 0; i < length; i++) {
            if (str1[i] !== str2[i])
                diff++;
        }
        return diff;
    }

    let minDiff = contents[0].length + 1;
    let minDiffStrs = [];

    for (let i = 0; i < ids.length; i++) {
        for (let j = i+1; j < ids.length; j++) {
            let aDiff = diff(ids[i], ids[j]);
            if (aDiff < minDiff) {
                minDiff = aDiff;
                minDiffStrs = [ids[i], ids[j], i, j];
            }
        }
    }

    console.log(minDiff, minDiffStrs);
}

part1(ids);
part2(ids);
