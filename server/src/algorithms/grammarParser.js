/**
 * Parses raw grammar text into a structured format.
 */
function parseGrammar(rawText) {
  if (!rawText || !rawText.trim()) {
    throw new Error('Grammar cannot be empty.');
  }

  const lines = rawText.split('\n');
  const productions = []; // Array of { lhs, rhs: [symbol1, symbol2] }
  const nonTerminals = new Set();
  const allSymbols = new Set();
  let startSymbol = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Support -> or →
    const parts = line.split(/->|→/);
    if (parts.length < 2) {
      throw new Error(`Malformed production on line ${i + 1}: ${line}`);
    }

    const lhs = parts[0].trim();
    if (!lhs) {
      throw new Error(`Missing LHS on line ${i + 1}: ${line}`);
    }
    if (/\s/.test(lhs)) {
      throw new Error(`LHS must be a single symbol on line ${i + 1}: ${line}`);
    }

    if (!startSymbol) {
      startSymbol = lhs;
    }
    nonTerminals.add(lhs);
    allSymbols.add(lhs);

    const rhsRaw = parts.slice(1).join('->').trim();
    if (!rhsRaw) {
      throw new Error(`Missing RHS on line ${i + 1}: ${line}`);
    }

    const alternatives = rhsRaw.split('|');
    for (const alt of alternatives) {
      const altTrimmed = alt.trim();
      let symbols = altTrimmed.split(/\s+/).filter(s => s.length > 0);
      
      // Normalize epsilon
      symbols = symbols.map(s => (['ε', 'eps', 'epsilon'].includes(s.toLowerCase()) || s === 'ε' ? 'ε' : s));

      if (symbols.length === 0) {
        symbols = ['ε'];
      }

      productions.push({ lhs, rhs: symbols });
      for (const s of symbols) {
        allSymbols.add(s);
      }
    }
  }

  const terminals = new Set();
  for (const s of allSymbols) {
    if (!nonTerminals.has(s) && s !== 'ε') {
      terminals.add(s);
    }
  }

  return {
    startSymbol,
    nonTerminals: Array.from(nonTerminals),
    terminals: Array.from(terminals),
    productions
  };
}

module.exports = { parseGrammar };
