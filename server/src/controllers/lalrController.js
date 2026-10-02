const { parseGrammar } = require('../algorithms/grammarParser');
const { augmentGrammar, buildLR1States, mergeLALR, buildLALRTable, parseLALR } = require('../algorithms/lalr');
const { computeFirstSets } = require('../algorithms/ll1'); // Used for LR1 construction

exports.analyze = (req, res, next) => {
  try {
    const { grammar } = req.body;
    if (!grammar) return res.status(400).json({ error: 'Grammar is required.' });

    const parsed = parseGrammar(grammar);
    const augmented = augmentGrammar(parsed);
    const firstSets = computeFirstSets(augmented.productions, augmented.nonTerminals, augmented.terminals);
    
    const { states: lr1States, transitions: lr1Transitions } = buildLR1States(augmented, firstSets);
    const { mergedStates, mergedTransitions, mapping } = mergeLALR(lr1States, lr1Transitions);
    
    const { table, hasConflict, conflicts } = buildLALRTable(
      mergedStates, mergedTransitions, augmented.productions, augmented.terminals, augmented.nonTerminals
    );

    res.json({
      parsed,
      augmented,
      lr1States,
      lr1Transitions,
      lalrStates: mergedStates,
      lalrTransitions: mergedTransitions,
      mapping,
      table,
      hasConflict,
      conflicts,
      finalProductions: augmented.productions
    });
  } catch (err) {
    next(err);
  }
};

exports.parse = (req, res, next) => {
  try {
    const { grammar, input } = req.body;
    if (!grammar) return res.status(400).json({ error: 'Grammar is required.' });
    if (input === undefined) return res.status(400).json({ error: 'Input is required.' });

    const parsed = parseGrammar(grammar);
    const augmented = augmentGrammar(parsed);
    const firstSets = computeFirstSets(augmented.productions, augmented.nonTerminals, augmented.terminals);
    
    const { states: lr1States, transitions: lr1Transitions } = buildLR1States(augmented, firstSets);
    const { mergedStates, mergedTransitions } = mergeLALR(lr1States, lr1Transitions);
    
    const { table, hasConflict } = buildLALRTable(
      mergedStates, mergedTransitions, augmented.productions, augmented.terminals, augmented.nonTerminals
    );

    if (hasConflict) {
      return res.status(400).json({ error: 'Grammar is not LALR(1). Resolve conflicts before parsing strings.' });
    }

    const parseResult = parseLALR(table, augmented.productions, input, augmented.terminals);
    res.json(parseResult);
  } catch (err) {
    next(err);
  }
};
