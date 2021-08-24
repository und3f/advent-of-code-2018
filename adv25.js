#!/usr/bin/env node

"use strict";

const fs = require('fs');
const path = require('path');

function Point(coord) {
	this.coord = coord
	this.manhattanToCenter = coord.reduce((a, coord) => a + Math.abs(coord), 0)
}

Point.prototype.manhattan = function(pointDest) {
	let manhattan = 0
	for (let i = 0; i < this.coord.length; i++) {
		manhattan += Math.abs(this.coord[i] - pointDest.coord[i])
	}

	return manhattan
}

Point.prototype.toString = function() {
	return this.coord.join(",")
}

function Constellation() {
	this.points = []
}

Constellation.prototype.addPoint = function(point) {
	this.points.push(point)
}

Constellation.prototype.merge = function(constellation) {
	this.points = this.points.concat(constellation.points)
}

Constellation.prototype.toString = function() {
	return "(\n" + this.points.map(p => " " + p.toString()).join("\n") + "\n)\n"
}

const CONSTELLATION_MAX_DISTANCE = 3

Constellation.prototype.pointBelongs = function(point) {
	for (let pointC of this.points) {
		if (pointC.manhattan(point) <= CONSTELLATION_MAX_DISTANCE)
			return true
	}
	return false
}


const contents = fs.readFileSync(
    path.basename(__filename, ".js") + ".txt", 'utf8')
  .trim();

let points = contents.split("\n").map(line => new Point(line.split(",").map(str => parseInt(str))))
let center = new Point([0,0,0,0])
points.sort((a, b) => a.manhattanToCenter - b.manhattanToCenter)

let constellations = []
for (let point of points) {
	let possibleConstellations = []
	for (let constellation of constellations) {
		if (constellation.pointBelongs(point)) {
			possibleConstellations.push(constellation)
		}
	}
	if (possibleConstellations.length > 0) {
		let constellation = possibleConstellations.shift()
		while (possibleConstellations.length > 0) {
			const constellationMerged = possibleConstellations.shift()
			constellation.merge(constellationMerged)
			constellations = constellations.filter(c => c !== constellationMerged)
		}
		constellation.addPoint(point)
		continue
	}

	let constellation = new Constellation()
	constellation.addPoint(point)
	constellations.push(constellation)
}
// console.log(constellations.map(c => c.toString()).join("\n"))
console.log("Part one:", constellations.length)
