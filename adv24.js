#!/usr/bin/env node

"use strict";

const fs = require('fs');
const path = require('path');

const contents = fs.readFileSync(
    path.basename(__filename, ".js") + ".txt", 'utf8')
  .trim();

const groupRe = /(\d+) units each with (\d+) hit points \(?([^\)]*)\)? ?with an attack that does (\d+) (\w+) damage at initiative (\d+)/

function Group(id, units, hp, buffs, attack, attackType, initiative) {
  // console.log(units, hp, buffs, attack, attackType, initiative)
  this.id = id
  this.units = units
  this.hp = hp
  this.attack = attack
  this.attackType = attackType
  this.initiative = initiative

  this.buffs = {}
  for (const key of ["immune", "weak"]) {
    this.buffs[key] = new Set()
    if (buffs[key] == undefined)
      continue

    for (const buff of buffs[key]) {
      this.buffs[key].add(buff)
    }
  }
}

Group.prototype.clone = function () {
  return new Group(this.id, this.units, this.hp, this.buffs, this.attack, this.attackType, this.initiative)
}

Group.prototype.effectivePower = function () {
  return this.units * this.attack
}

Group.prototype.attackMultiplierAgainst = function (targetGroup) {
  let attackMultiplier = 1
  if (targetGroup.buffs.immune.has(this.attackType)) {
    attackMultiplier = 0
  } else if (targetGroup.buffs.weak.has(this.attackType)) {
    attackMultiplier = 2
  }
  return attackMultiplier
}

Group.prototype.selectTarget = function (targetGroups) {
  let group = this
  const uep = this.effectivePower()
  let damages = targetGroups.map(target => group.attackMultiplierAgainst(target) * uep)
  let maxDamage = Math.max(...damages)

  if (maxDamage === 0)
    return

  for (let i in damages) {
    const damage = damages[i]
    if (this.verbose)
      console.log(`${this.army.name} group ${this.id} would deal defending group ${targetGroups[i].id} ${damage} damage`)
  }

  let targets = targetGroups.filter((group, i) => damages[i] == maxDamage)

  if (targets.length === 1)
    return targets[0]

  let ep = targets.map(target => target.effectivePower())
  const maxEP = Math.max(...ep)
  targets = targets.filter((group, i) => ep[i] == maxEP)

  if (targets.length === 1)
    return targets[0]

  targets.sort((b, a) => a.initiative - b.initiative)
  return targets[0]
}

Group.prototype.attackTarget = function (target) {
  let multiplier = this.attackMultiplierAgainst(target)
  let killed = Math.floor(multiplier * this.effectivePower() / target.hp)
  target.units = Math.max(0, target.units - killed)
  if (this.verbose)
    console.log(`${this.army.name} group ${this.id} attacks defending group ${target.id}, killing ${killed}`)
}

Group.prototype.toString = function () {
  return `Group ${this.id} contains ${this.units} units`
}

function Army(name, groups) {
  this.name = name
  this.groups = groups
  this.groups.sort((b, a) => a.initiative - b.initiative)
  for (let group of groups) {
    group.army = this
  }
}

Army.prototype.selectTarget = function (targetArmy) {
  let groupsTargets = []
  let targets = targetArmy.groups

  let groups = this.groups.slice()
  groups.sort((b, a) => a.effectivePower() - b.effectivePower())

  for (const group of groups) {
    const target = group.selectTarget(targets)
    if (target == null)
      continue

    targets = targets.filter(_target => _target !== target)
    groupsTargets.push([group, target])
  }
  return groupsTargets
}

Army.prototype.toString = function () {
  let groupsString = this.groups.map(group => group.toString()).join("\n")
  if (this.groups.length < 1)
    groupsString = "No groups remain"

  return this.name + "\n" +
    groupsString +
    "\n"
}

Army.prototype.boost = function (boost) {
  for (let group of this.groups)
    group.attack += boost

  return this
}

Army.prototype.isAlive = function () {
  this.groups = this.groups.filter(group => group.units > 0)
  if (this.groups.length > 0)
    return true

  return false
}

Army.prototype.setVerbose = function (verbose) {
  this.verbose = verbose
  for (const group of this.groups)
    group.verbose = verbose
}

Army.prototype.score = function () {
  return this.groups.reduce((a, group) => a + group.units, 0)
}

Army.prototype.clone = function () {
  return new Army(this.name, this.groups.map(group => group.clone()))
}

function Battlefield(army1, army2) {
  this.armies = [army1, army2]
}

Battlefield.prototype.setVerbose = function (verbose) {
  this.verbose = verbose
  for (const army of this.armies)
    army.setVerbose(verbose)

  return this
}

Battlefield.prototype.score = function () {
  return this.armies.reduce((score, army) => score + army.score(), 0)
}

Battlefield.prototype.turn = function () {
  let groupsTargets = []

  if (this.verbose)
    console.log(this.toString())

  for (let army = 0; army < this.armies.length; army++) {
    let target = (army + 1) % 2
    groupsTargets = groupsTargets.concat(this.armies[army].selectTarget(this.armies[target]))
  }

  groupsTargets = groupsTargets.sort((b, a) => a[0].initiative - b[0].initiative)

  for (const groupTarget of groupsTargets) {
    groupTarget[0].attackTarget(groupTarget[1])
  }

  if (this.verbose)
    console.log()

  for (let army = 0; army < this.armies.length; army++) {
    if (!this.armies[army].isAlive()) {
      if (this.verbose)
        console.log(this.toString())
      return this.armies[(army + 1) % 2]
    }
  }

  return
}

Battlefield.prototype.toString = function () {
  let res = new String()
  for (let army of this.armies)
    res += army.toString()
  return res
}

Battlefield.prototype.clone = function () {
  return new Battlefield(...this.armies.map(army => army.clone()))
}

const battlefield = new Battlefield(...contents.split("\n\n").map(teamString => {
  let lines = teamString.split("\n")
  const teamName = lines.shift().split(":")[0]

  let groups = []
  for (const groupLine of lines) {
    const match = groupLine.match(groupRe)
    if (!match)
      throw (`Failed to parse line "${groupLine}"`)
    let buffs = {}

    if (match[3]) {
      for (const buffStr of match[3].split("; ")) {
        const temp = buffStr.split(" to ")
        buffs[temp[0]] = temp[1].split(", ")
      }
    }
    groups.push(new Group(groups.length + 1, parseInt(match[1]), parseInt(match[2]), buffs, parseInt(match[4]), match[5], parseInt(match[6])))
  }
  return new Army(teamName, groups)
}))

function strategyUsualBattle(battlefield) {
  let winner
  let score
  while (!winner) {
    winner = battlefield.turn()
    let newArmiesScore = battlefield.armies.map(army => army.score())
    let newScore = battlefield.score()
    if (score === newScore)
      return
    score = newScore
  }
  return winner
}

const IMMUNE_SYSTEM = 'Immune System'

function strategyImmuneBoost(battlefield) {
  let armies = battlefield.armies
  let immuneSystemI = 0
  while (armies[immuneSystemI].name !== IMMUNE_SYSTEM)
    immuneSystemI++

  let immuneSystem = battlefield.armies[immuneSystemI]
  let infection = battlefield.armies[(immuneSystemI + 1) % 2]

  let winner = infection

  let boost = 1
  for (; winner.name != IMMUNE_SYSTEM; boost += 10) {
    // console.log(boost, immuneSystemBoosted)
    winner = strategyUsualBattle(new Battlefield(infection.clone(), immuneSystem.clone().boost(boost)))
  }

  let immune_lost = false
  for (; !immune_lost; boost--) {
    let _winner = strategyUsualBattle(new Battlefield(infection.clone(), immuneSystem.clone().boost(boost)).setVerbose(false))
    immune_lost = _winner == null || _winner.name != IMMUNE_SYSTEM
    if (!immune_lost)
      winner = _winner
  }

  return winner
}

console.log("Part one:", strategyUsualBattle(battlefield.clone()).score())
console.log("Part two:", strategyImmuneBoost(battlefield).score())
