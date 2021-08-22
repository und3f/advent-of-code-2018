#!/usr/bin/env node

"use strict";

const fs = require('fs');
const path = require('path');

let contents = fs.readFileSync(
    path.basename(__filename, ".js") + ".txt", 'utf8')
  .trim();

let input = {}
contents.split("\n").forEach(line => {
  let data = line.split(": ")
  input[data[0]] = data[1]
})
input.target = input.target.split(",").map(number => parseInt(number))

function Coord(x, y) {
  this.y = y
  this.x = x
}


Coord.prototype.equals = function (coord2) {
  if (this.y == coord2.y && this.x == coord2.x) {
    return true
  }
  return false
}

Coord.prototype.manhattan = function (coord2) {
  return Math.abs(this.x - coord2.x) + Math.abs(this.y - coord2.y)
}

Coord.prototype.toString = function () {
  return `${this.x},${this.y}`
}

function Cave(depth, target) {
  this.depth = depth
  this.target = target
  this.caveMouth = new Coord(0, 0)

  this.calculatedLevels = {}
  this.calculatedErosion = {}
  // this.display()
}

Cave.prototype.display = function () {
  let map = new Array(this.target.y + 1 + 5).fill(null)
  map = map.map(() => new Array(this.target.x + 1 + 5).fill(null))

  for (let y in map) {
    for (let x in map[y]) {
      map[y][x] = this.caveCellSymbol(new Coord(x, y))
    }
  }

  map[0][0] = 'M'
  map[this.target.y][this.target.x] = 'T'

  console.log(map.map(line => line.join("")).join("\n"))
}

Cave.prototype.riskyLevel = function () {
  let riskyLevel = 0
  for (let y = 0; y <= this.target.y; y++) {
    for (let x = 0; x <= this.target.x; x++) {
      riskyLevel += this.regionType(new Coord(x, y))
    }
  }
  return riskyLevel
}

Cave.prototype.caveCellSymbol = function (coord) {
  switch (this.regionType(coord)) {
  case 0:
    return '.'
    break
  case 1:
    return '='
    break
  case 2:
    return '|'
    break
  default:
    throw "Wrong region type"
  }
}

Cave.prototype.erosionLevel = function (coord) {
  let erosion
  if (erosion = this.calculatedErosion[coord.toString()]) {
    return erosion
  }
  erosion = (this.depth + this.geologicalLevel(coord)) % 20183
  this.calculatedErosion[coord.toString()] = erosion
  return erosion
}

Cave.prototype.regionType = function (coord) {
  return this.erosionLevel(coord) % 3
}

Cave.prototype.geologicalLevel = function (coord) {
  if (coord.equals(this.caveMouth) || coord.equals(this.target)) {
    return 0
  }

  if (coord.y == 0) {
    return coord.x * 16807
  } else if (coord.x == 0) {
    return coord.y * 48271
  }

  let level
  if (level = this.calculatedLevels[coord.toString()]) {
    // console.log("Restored", coord.toString(), level)
    return level
  }

  level = this.erosionLevel(new Coord(coord.x - 1, coord.y)) *
    this.erosionLevel(new Coord(coord.x, coord.y - 1))

  this.calculatedLevels[coord.toString()] = level
  // console.log("Saving", coord.toString(), level)
  return level
}

const tools = {
  neither: 0,
  torch: 1,
  climbingGear: 2,
}

const possibleTools = {
  0: new Set().add(tools.torch).add(tools.climbingGear),
  1: new Set().add(tools.neither).add(tools.climbingGear),
  2: new Set().add(tools.torch).add(tools.neither),
}

function Walker(cave, coord, time, tool) {
  this.coord = coord
  this.cave = cave
  this.tool = tool
  this.time = time

  this.log = [this]

  this.aproxTravelTime = this.coord.manhattan(this.cave.target) * (TIME_REGION_TRAVEL /*+ TIME_TOOLS_SWITCH */ ) + this.time
}

const TIME_REGION_TRAVEL = 1
const TIME_TOOLS_SWITCH = 7

Walker.prototype.walkVariants = function () {
  let coordVariants = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ].map(direction => new Coord(this.coord.x + direction[0], this.coord.y + direction[1]))
    .filter(coord => coord.x >= 0 && coord.y >= 0)

  const sourceRegionTools = possibleTools[this.cave.regionType(this.coord)]
  let walkerVariants = []
  for (let coord of coordVariants) {
    if (coord.equals(cave.target)) {
      if (this.tool == tools.torch) {
        walkerVariants.push(new Walker(this.cave, coord, this.time + TIME_REGION_TRAVEL, this.tool))
      } else {
        if (sourceRegionTools.has(tools.torch)) {
          walkerVariants.push(new Walker(this.cave, coord, this.time + TIME_REGION_TRAVEL + TIME_TOOLS_SWITCH, tools.torch))
        }
      }
      continue
    }

    const targetRegionTools = possibleTools[this.cave.regionType(coord)]

    if (targetRegionTools.has(this.tool)) {
      walkerVariants.push(new Walker(this.cave, coord, this.time + TIME_REGION_TRAVEL, this.tool))
    } else {
      Array.from(sourceRegionTools).filter(tool => targetRegionTools.has(tool)).forEach(tool => {
        walkerVariants.push(new Walker(this.cave, coord, this.time + TIME_REGION_TRAVEL + TIME_TOOLS_SWITCH, tool))
      })
    }
  }

  let that = this

  for (let walker of walkerVariants) {
    walker.log = this.log.concat(walker.log)
  }

  return walkerVariants
}

Walker.prototype.toString = function () {
  return `@${this.coord} time: ${this.time} tool: ${this.tool}`
}

Walker.prototype.toStateString = function () {
  return `${this.coord}!${this.tool}`
}

function checkPath(cave, log) {
  for (let i = 1; i < log.length; i++) {
    const walker = log[i]
    const prev = log[i - 1]

    let timeIncrement = TIME_REGION_TRAVEL
    if (walker.tool != prev.tool)
      timeIncrement += TIME_TOOLS_SWITCH
    if (walker.time != prev.time + timeIncrement) {
      throw (`Wrong time change ${prev} → ${walker}`)
    }

    if (walker.coord.manhattan(prev.coord) !== 1) {
      throw (`Wrong coord change ${prev} → ${walker}`)
    }

    if (!possibleTools[cave.regionType(prev.coord)].has(walker.tool)) {
      throw (`Impossible tool switch @${prev.coord}(${cave.regionType(prev.coord)}) ${walker}`)
    }

    if (!possibleTools[cave.regionType(walker.coord)].has(walker.tool)) {
      throw (`Wrong tool used @${walker.coord}(${cave.regionType(walker.coord)}) ${walker}`)
    }
  }
}

function findTidiestPath(cave) {
  let walkers = [new Walker(cave, new Coord(0, 0), 0, tools.torch)]
  let fastestRoute = walkers[0].coord.manhattan(cave.target) * (TIME_REGION_TRAVEL + TIME_TOOLS_SWITCH)
  let reached = {}
  while (walkers.length > 0) {
    let walker = walkers.shift()

    if (walker.time + walker.coord.manhattan(cave.target) >= fastestRoute) {
      continue
    }
    if (walker.coord.equals(cave.target)) {
      // console.log(`Target reached in ${walker.time}`)
      // console.log(walker.log.map(w => w.toString()).join("\n"))
      // checkPath(cave, walker.log)
      fastestRoute = Math.min(fastestRoute, walker.time)
      continue
    }
    // console.log(fastestRoute, walker.toString())

    walkers = walkers.concat(walker.walkVariants().filter(walker => {
      let reachedData = reached[walker.toStateString()];
      if (reachedData === undefined || reachedData > walker.time) {
        reached[walker.toStateString()] = walker.time

        return true
      }
      return false
    }))

    walkers.sort((a, b) => a.aproxTravelTime - b.aproxTravelTime)
    // console.log(walkers.map(walker => walker.aproxTravelTime))
  }
  return fastestRoute
}

let cave = new Cave(parseInt(input.depth), new Coord(input.target[0], input.target[1]))
/*
console.log(cave.geologicalLevel(new Coord(0, 0)))
console.log(cave.geologicalLevel(new Coord(1, 0)))
console.log(cave.erosionLevel(new Coord(1, 0)))
console.log(cave.geologicalLevel(new Coord(0, 1)))
console.log(cave.erosionLevel(new Coord(0, 1)))
console.log(cave.geologicalLevel(new Coord(1, 1)))
console.log(cave.erosionLevel(new Coord(1, 1)))
console.log(cave.regionType(new Coord(1, 1)))
console.log(cave.geologicalLevel(new Coord(10, 10)))
*/

console.log("Part one:", cave.riskyLevel())
// cave.display()
//cave.display()
console.log("Part two:", findTidiestPath(cave))
