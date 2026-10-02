const { parseGrammar } = require('../src/algorithms/grammarParser');
const { computeFirstSets } = require('../src/algorithms/ll1');
const { augmentGrammar, buildLR1States } = require('../src/algorithms/lalr');

const raw = `S -> C C
C -> c C | d`;
const parsed = parseGrammar(raw);
const augmented = augmentGrammar(parsed);
const firstSets = computeFirstSets(augmented.productions, augmented.nonTerminals, augmented.terminals);
console.log('firstSets:', firstSets);

const { states, transitions } = buildLR1States(augmented, firstSets);
console.log('states length:', states.length);
states.forEach((s, i) => console.log('State', i, ':', s));
