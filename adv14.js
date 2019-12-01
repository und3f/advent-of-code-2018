function RecipeCalculator(initialRecipe) {
    this.board = initialRecipe;
    this.cursor1 = 0;
    this.cursor2 = 1;
}

RecipeCalculator.prototype.nextRecipe = function() {
        let first = parseInt(this.board[this.cursor1]);
        let second = parseInt(this.board[this.cursor2]);

        let sum = first + second;
        if (sum < 10) {
            this.board += sum;
        } else {
            this.board += (Math.floor(sum / 10)).toString() + (sum % 10).toString();
        }

        this.cursor1 = (this.cursor1 + first + 1) % this.board.length;
        this.cursor2 = (this.cursor2 + second + 1) % this.board.length;
}

RecipeCalculator.prototype.calculateRecipes = function (iterations) {
    while (this.board.length < iterations) {
        this.nextRecipe();
    }
}

RecipeCalculator.prototype.calculateRecipe = function (recipes) {
    let iterations = recipes + 10 - this.board.length;

    this.calculateRecipes(iterations);
    return this.board.substr(recipes, 10);
}

const step = Math.pow(2, 15);
RecipeCalculator.prototype.findRecipe = function(recipe) {
    let position;
    while ((position = this.board.indexOf(recipe)) == -1) {
        lastPosition = this.board.length - 1;
        for (let i = 0; i < step; i++)
            this.nextRecipe();
    }

    return position;
}

let recipe = new RecipeCalculator("37");

console.log("Part One:", recipe.calculateRecipe(260321));


console.log(recipe.findRecipe("260321"));
