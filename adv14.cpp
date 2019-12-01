#include <iostream>
#include <cstdlib>
#include <cstring>

using namespace std;

class RecipeCalculator {
    public:
        RecipeCalculator(string initialBoard) {
            board = initialBoard;
            board.reserve(1048576);
        }
        void nextRecipe() {
            int first = board[firstCursor] - '0';
            int second = board[secondCursor] - '0';

            int sum = first + second;

            
            if (sum >= 10) {
                board.append(1, char(sum / 10 + '0'));
            }

            board.append(1, sum % 10 + '0');

            firstCursor = (firstCursor + first + 1) % board.length();
            secondCursor = (secondCursor + second + 1) % board.length();
        }

        const string calculateRecipe (int recipes) {
            int targetLength = recipes + 10;

            while (board.length() < targetLength)
                nextRecipe();

            return board.substr(recipes, 10);
        }

        const int step = 1024 * 1024;
        int findRecipe(const string &recipe) {
            int prevStep = 0;
            int found = -1;
            while ((found = board.find(recipe)) == -1) {
                calculateRecipe(board.length() + step);

                if (board.length() - prevStep > 1000000) {
                    prevStep = board.length();
                }
            }
            return found;
        }

        const string &getBoard() {
            return board;
        }

    private:
        string board;
        int firstCursor = 0, secondCursor = 1;
};

int main() {
    RecipeCalculator recipe("37");

    cout << "Part One: " << recipe.calculateRecipe(260321) << endl;
    cout << "Part Two: " << recipe.findRecipe("260321") << endl;
    return 0;
}
