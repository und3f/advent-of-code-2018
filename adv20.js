#!/usr/bin/env node

"use strict";

const fs = require('fs');
const path = require('path');

let contents = fs.readFileSync(
    path.basename(__filename, ".js") + ".txt", 'utf8')
  .trim();

// console.log(contents);

const size = 3;

function Map() {
  this.map = new Array(size).fill(0).map(() => new Array(size).fill("#"));
  this.offset = [0, 0];
  this.start = [1, 1];
  this.map[this.start[0]][this.start[1]] = 'X';
}

Map.prototype.pushRow = function () {
  this.map.push(new Array(this.map[0].length).fill('#'));
  this.map.push(new Array(this.map[0].length).fill('#'));
}

Map.prototype.unshiftRow = function () {
  this.map.unshift(new Array(this.map[0].length).fill('#'));
  this.map.unshift(new Array(this.map[0].length).fill('#'));
  this.offset[0] += 2;
}

Map.prototype.pushColumn = function () {
  this.map.forEach(row => row.push('#', '#'));
  // this.displayMap();
}

Map.prototype.unshiftColumn = function () {
  this.map.forEach(row => row.unshift('#', '#'));
  this.offset[1] += 2;
}

Map.prototype.writeDoors = function (_p, direction) {
  let p = _p.slice();
  // console.log("Write doors", p, direction);

  let my = p[0] + direction[0] * 2 + this.offset[0];
  let mx = p[1] + direction[1] * 2 + this.offset[1];
  // console.log(my, mx, this.map.length);
  if (my >= this.map.length)
    this.pushRow();
  else if (my <= 0)
    this.unshiftRow();

  if (mx >= this.map[0].length)
    this.pushColumn();
  if (mx <= 0)
    this.unshiftColumn();

  // console.log(my, mx, this.map.length);

  direction.forEach((v, i) => p[i] += v);
  let symbol = '|';
  if (direction[0] != 0)
    symbol = '-';

  this.map[p[0] + this.offset[0]][p[1] + this.offset[1]] = symbol;
  direction.forEach((v, i) => p[i] += v);
  this.map[p[0] + this.offset[0]][p[1] + this.offset[1]] = '.';

  return p;
}

Map.prototype.displayMap = function () {
  console.log(this.map.map(a => a.join("")).join("\n"));
}

Map.prototype.findFurthestRoom = function () {
  let map = this.map.map(row => row.slice())
  let positions = [{
    position: [this.start[0] + this.offset[0], this.start[1] + this.offset[1]],
    doorsPassed: 0
  }];
  let visited

  let furthestRoom = 0

  do {
    let nextPositions = []
    // console.log(positions)
    positions.forEach(positionInformation => {
      const position = positionInformation.position
      furthestRoom = Math.max(furthestRoom, positionInformation.doorsPassed)
      for (const [directionName, directionVect] of Object.entries(directions)) {
        let symbol = map[position[0] + directionVect[0]][position[1] + directionVect[1]]
        // console.log(directionName, directionVect, position, symbol)
        // console.log(position[0] + directionVect[0], position[1] + directionVect[1], symbol)
        if (symbol == '|' || symbol == '-') {
          map[position[0] + directionVect[0]][position[1] + directionVect[1]] = '#'
          nextPositions.push({
            position: [position[0] + directionVect[0] * 2, position[1] + directionVect[1] * 2],
            doorsPassed: positionInformation.doorsPassed + 1
          })
        }
      }
    })
    positions = nextPositions
  }
  while (positions.length > 0)

  return furthestRoom
}

Map.prototype.countRooms = function (maxDoors) {
  let map = this.map.map(row => row.slice())
  let positions = [{
    position: [this.start[0] + this.offset[0], this.start[1] + this.offset[1]],
    doorsPassed: 0,
    roomsVisited: []
  }];
  let visited

  let count = 0

  do {
    let nextPositions = []
    // console.log(positions)
    for (const positionInformation of positions) {
      const position = positionInformation.position
      positionInformation.roomsVisited.push(position)

      if (positionInformation.doorsPassed >= maxDoors) {
        count++
      }

      for (const [directionName, directionVect] of Object.entries(directions)) {
        let symbol = map[position[0] + directionVect[0]][position[1] + directionVect[1]]
        // console.log(directionName, directionVect, position, symbol)
        // console.log(position[0] + directionVect[0], position[1] + directionVect[1], symbol)
        if (symbol == '|' || symbol == '-') {
          map[position[0] + directionVect[0]][position[1] + directionVect[1]] = '#'
          nextPositions.push({
            position: [position[0] + directionVect[0] * 2, position[1] + directionVect[1] * 2],
            doorsPassed: positionInformation.doorsPassed + 1,
            roomsVisited: positionInformation.roomsVisited,
          })
        }
      }
    }
    positions = nextPositions
  }
  while (positions.length > 0)

  return count
}

const directions = {
  N: [-1, 0],
  S: [1, 0],
  W: [0, -1],
  E: [0, 1],
};

Map.prototype.traceSymbols = function (regex, startPosition) {
  let position = (startPosition || this.start).slice();
  // console.log(position);

  // this.displayMap();
  for (let i = 0; i < regex.length; i++) {
    position = this.writeDoors(position, directions[regex[i]]);
    // this.displayMap();
  }
  // console.log(regex, position);
  return position
}

function mergeParts(parts1, parts2) {
  if (parts1.length === 0)
    return parts2;

  if (parts2.length === 0)
    return parts1;

  let mergedParts = [];
  parts1.forEach(p1 =>
    parts2.forEach(p2 =>
      mergedParts.push(p1 + p2)));
  return mergedParts;
}

Map.prototype.parseRegexGroup = function (regex, regexPosition, mapPositions) {
  let i = regexPosition;
  let positions = []

  while (regex[i] !== ')') {
    let parsedPositions[i, parsedPositions] = this.parseRegexPart(regex, i, mapPositions);
    positions = positions.concat(parsedPositions)
    switch (regex[i]) {
    case '|':
      i++;
      /*
      if (regex[i] === ')')
        parts.push('');
				*/
    case ')':
      break;
    default:
      throw "Unexpected symbol at regex[" + i + "] \"" + regex[i] + '"';
    }
    // console.log("Parsed group part", i, parsedParts);
  }

  // console.log("Group", parts);
  return [i, positions];
}

Map.prototype.parseRegexPart = function (regex, regexPosition, mapPositions) {
  // let parts = new Array();
  // let part = new String();
  let positions = mapPositions

  for (let i = regexPosition; i < regex.length; i++) {
    switch (regex[i]) {
    case 'N':
    case 'W':
    case 'S':
    case 'E':
      positions = positions.map(position => this.writeDoors(position, directions[regex[i]]))
      // part += regex[i];
      break;

    case '(':
      // let parsedParts;
      [i, positions] = this.parseRegexGroup(regex, i + 1, positions);
      // console.log("Parsed", i, parsedParts, part);
      // parts = mergeParts(mergeParts(parts, [part]), parsedParts);
      //parts.push(...(mergeParts([part], parsedParts)));
      // console.log(parts);
      /*
        part = "";
				*/
      if (regex[i + 1] === ')')
        return [i + 1, positions];
      break;


    default:
      // console.log(i, "return");
      // return [i, mergeParts(parts, [part])];
      return [i, positions]
    }
  }

  return [regex.length, mergeParts(parts, [part])];
}

Map.prototype.parseRegex = function (regex) {
  if (regex[0] !== '^')
    throw "Wrong start symbol of regex", regex[0];

  let p, parts;
  [p, parts] = this.parseRegexPart(regex, 1, [this.start]);

  if (regex[p] !== '$')
    throw "Wrong end symbol of regex[" + p + ']: "' + regex[p] + '"';;

  return parts;
}

let map = new Map();

map.parseRegex(contents);
//process.exit(1);
// variants.forEach(variant => map.traceSymbols(variant));
// map.displayMap();
console.log("Part one:", map.findFurthestRoom())
console.log("Part two:", map.countRooms(1000))

// console.log(variants);
// console.log(variants.reduce((a, v) => a = Math.max(a, v.length), 0));
