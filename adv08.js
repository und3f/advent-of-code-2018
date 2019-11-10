#!/usr/bin/env node

const util = require('util');
const fs = require('fs');

let contents = fs.readFileSync("adv8.txt", 'utf8').trim();
console.log(contents);
let codes = contents.split(" ").map(x => parseInt(x));

let root, nextChild;

let metadataSum = 0;
function parseNodes(codes) {
    let newCodes = codes;
    let node = {
        children: [],
        metadata: [],
    };

    let numOfChildren = codes.shift();
    let numOfMetadata = codes.shift();
    console.log("Next node, subnodes:", numOfChildren, "Metadata:", numOfMetadata);
    while (numOfChildren > node.children.length) {
        node.children.push(parseNodes(codes));
    }
    while (numOfMetadata > node.metadata.length) {
        let nextMetadata = codes.shift();
        metadataSum += nextMetadata;
        node.metadata.push(nextMetadata);
    }
    return node;
}

function calculateNodeValue(node) {
    if (node == null)
        return 0;

    if (node.children.length === 0)
        return node.metadata.reduce((total, next) => total += next);


    return node.metadata.reduce(function (total, index) {
        total += calculateNodeValue(node.children[index-1]);
        return total;
    }, 0);
}

root = parseNodes(codes);
console.log(util.inspect(root, false, null, true));
console.log("Metadata sum:", metadataSum);

console.log("Root node value:", calculateNodeValue(root));
