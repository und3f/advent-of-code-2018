#include <iostream>
#include <cstdlib>
#include <fstream>
#include <vector>
#include <iterator>
#include <cstring>
#include <map>

using namespace std;

typedef string pattern_t;
struct Rule {
    pattern_t pattern;
    bool spread;

};
typedef map<string, bool> Rules_t;

std::ostream& operator<<(std::ostream& os, Rule const& arg)
{
    os << arg.pattern << " => " << (arg.spread ? '#' : '.');
    return os;
}

string nextGeneration(const string &generation, Rules_t &rules) {
    string nextGeneration = generation;
    Rules_t::iterator it;

    for (int i = 2; i < generation.length() - 2; i++) {
        it = rules.find(generation.substr(i-2, 5));

        char result = it == rules.end() ? '.' : it->second ? '#' : '.';
        
        // cout << "\t" << generation.substr(i-2, 5) << " -> " << result << endl;
        nextGeneration[i] = result;
    }

    return nextGeneration;
}

int calculateSum(string &generation, int left) {
    int sum = 0;
    for (int i = 0; i < generation.length(); i++)
        if (generation[i] == '#')
            sum += i - left;

    return sum;
}

int main() {
    ifstream inputfile("adv12.txt");
    string line;

    string initial;
    Rules_t rules;


    if (inputfile.is_open()) {
        getline(inputfile, line);
        initial = line.substr(15);
        
        getline(inputfile, line);

        while(getline(inputfile, line)) {
            bool spread = line[9] == '#' ? true : false;
            rules.insert(pair<pattern_t, bool>(line.substr(0, 5), spread));
        }
    }


    string generation = initial;
    int left = 0;

    for (int i = 1; i <= 50000000000; i++) {
        if (generation[0] == '#' || generation[1] == '#' || generation[2] == '#') {
            generation = "..." + generation;
            left += 3;
        }
        if (generation[generation.length()-1] == '#' || generation[generation.length()-2] == '#'|| generation[generation.length()-3] == '#')
            generation += "...";

        generation = nextGeneration(generation, rules);

        int offset = generation.find('#');
        if (offset > 5) {
            offset -= 3;
            left -= offset;
            generation = generation.substr(offset);
        }
        if (i % 1000000 == 0) {
            cout << i << " offset: " << left << " sum: " << calculateSum(generation, left) << endl;
            cout << generation << endl;;
        }
    }


    // cout << generation << endl;

    int sum = calculateSum(generation, left);

    cout << "Sum: " << sum << endl;
}
