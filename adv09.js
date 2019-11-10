#!/usr/bin/env node

function Game(numOfPlayers) {
    this.table = [ 0 ];
    this.current = 0;
    this.nextMarble = 1;
    this.players = new Array(numOfPlayers).fill(0);
    this.currentPlayer = 0;
}

Game.prototype.nextTurn = function(lastMarble) {

    if (this.nextMarble % 23 == 0) {
        let score = this.nextMarble;
        let removedMarbleIndex = (this.current - 7 + this.table.length) % this.table.length;
        score += (this.table.splice(removedMarbleIndex, 1))[0];
        this.players[this.currentPlayer] += score;
        this.current = removedMarbleIndex < this.table.length ? removedMarbleIndex : 0;
        this.nextMarble++;
    } else {
        let next = (this.current + 1) % this.table.length + 1;
        this.table.splice(next, 0, this.nextMarble);
        this.current = next;
        this.nextMarble++;
    }

    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
}

Game.prototype.highScore = function() {
    return this.players.reduce((total, number) => Math.max(total, number));
}

function emulateGame(players, lastMarble) {
    let game = new Game(players);

    while (game.nextMarble <= lastMarble) {
        if (game.nextMarble % 71852 == 0)
            console.log(game.nextMarble / 71852);
        game.nextTurn(lastMarble);
    }
    console.log(game.table);
    //console.log(game.players);
    
    console.log("High score", game.highScore());
}

emulateGame(404, 71852*100);
