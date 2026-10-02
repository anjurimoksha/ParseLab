// Globals provided by vitest --globals
const { parseGrammar } = require('../src/algorithms/grammarParser');
const { removeLeftRecursion, leftFactor, computeFirstSets, computeFollowSets, buildLL1Table, parseLL1 } = require('../src/algorithms/ll1');
const { augmentGrammar, buildLR1States, mergeLALR, buildLALRTable, parseLALR } = require('../src/algorithms/lalr');

describe('LL(1) Algorithms', () => {
  it('should parse grammar, compute FIRST/FOLLOW, build table and parse successfully', () => {
    const raw = `E -> E + T | T
T -> T * F | F
F -> ( E ) | id`;
    
    const parsed = parseGrammar(raw);
    const lrResult = removeLeftRecursion(parsed);
    expect(lrResult.changed).toBe(true);

    const lfResult = leftFactor(lrResult.productions, lrResult.nonTerminals);
    const firstSets = computeFirstSets(lfResult.productions, lfResult.nonTerminals, parsed.terminals);
    const followSets = computeFollowSets(lfResult.productions, lfResult.nonTerminals, parsed.startSymbol, firstSets);

    expect(firstSets['E']).toEqual(expect.arrayContaining(['(', 'id']));
    expect(followSets['E']).toEqual(expect.arrayContaining([')', '$']));

    const { table, hasConflict } = buildLL1Table(lfResult.productions, lfResult.nonTerminals, parsed.terminals, firstSets, followSets);
    expect(hasConflict).toBe(false);

    const parseResult = parseLL1(table, lfResult.productions, parsed.startSymbol, 'id + id * id', parsed.terminals);
    expect(parseResult.accepted).toBe(true);
    
    const parseResultFail = parseLL1(table, lfResult.productions, parsed.startSymbol, 'id + * id', parsed.terminals);
    expect(parseResultFail.accepted).toBe(false);
  });
});

describe('LALR(1) Algorithms', () => {
  it('should parse grammar, build LR(1) states, merge LALR, build table and parse', () => {
    const raw = `S -> C C
C -> c C | d`;
    
    const parsed = parseGrammar(raw);
    const augmented = augmentGrammar(parsed);
    const firstSets = computeFirstSets(augmented.productions, augmented.nonTerminals, augmented.terminals);
    
    const { states, transitions } = buildLR1States(augmented, firstSets);
    expect(states.length).toBe(10); // canonical LR(1) for this is 10 states

    const { mergedStates, mergedTransitions } = mergeLALR(states, transitions);
    expect(mergedStates.length).toBe(7); // LALR merges to 7 states

    const { table, hasConflict } = buildLALRTable(mergedStates, mergedTransitions, augmented.productions, augmented.terminals, augmented.nonTerminals);
    expect(hasConflict).toBe(false);

    const parseResult1 = parseLALR(table, augmented.productions, 'd c d', augmented.terminals);
    expect(parseResult1.accepted).toBe(true);

    const parseResult2 = parseLALR(table, augmented.productions, 'c c d d', augmented.terminals);
    expect(parseResult2.accepted).toBe(true);

    const parseResult3 = parseLALR(table, augmented.productions, 'c d c', augmented.terminals);
    expect(parseResult3.accepted).toBe(false);
  });
});
