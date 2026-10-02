const { parseGrammar } = require('../algorithms/grammarParser');
const { removeLeftRecursion, leftFactor, computeFirstSets, computeFollowSets, buildLL1Table, parseLL1 } = require('../algorithms/ll1');

exports.analyze = (req, res, next) => {
  try {
    const { grammar } = req.body;
    if (!grammar) {
      return res.status(400).json({ error: 'Grammar is required.' });
    }

    const parsed = parseGrammar(grammar);
    const lrResult = removeLeftRecursion(parsed);
    const lfResult = leftFactor(lrResult.productions, lrResult.nonTerminals);
    
    const finalProductions = lfResult.productions;
    const finalNonTerminals = lfResult.nonTerminals;
    
    const firstSets = computeFirstSets(finalProductions, finalNonTerminals, parsed.terminals);
    const followSets = computeFollowSets(finalProductions, finalNonTerminals, parsed.startSymbol, firstSets);
    
    const { table, hasConflict, conflicts } = buildLL1Table(
      finalProductions, finalNonTerminals, parsed.terminals, firstSets, followSets
    );

    res.json({
      parsed,
      leftRecursion: lrResult,
      leftFactored: lfResult,
      firstSets,
      followSets,
      table,
      hasConflict,
      conflicts,
      finalProductions
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
    const lrResult = removeLeftRecursion(parsed);
    const lfResult = leftFactor(lrResult.productions, lrResult.nonTerminals);
    
    const finalProductions = lfResult.productions;
    const finalNonTerminals = lfResult.nonTerminals;
    
    const firstSets = computeFirstSets(finalProductions, finalNonTerminals, parsed.terminals);
    const followSets = computeFollowSets(finalProductions, finalNonTerminals, parsed.startSymbol, firstSets);
    
    const { table, hasConflict } = buildLL1Table(
      finalProductions, finalNonTerminals, parsed.terminals, firstSets, followSets
    );

    if (hasConflict) {
      return res.status(400).json({ error: 'Grammar is not LL(1). Resolve conflicts before parsing strings.' });
    }

    const parseResult = parseLL1(table, finalProductions, parsed.startSymbol, input, parsed.terminals);
    res.json(parseResult);
  } catch (err) {
    next(err);
  }
};
