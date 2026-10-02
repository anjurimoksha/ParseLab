const { parseGrammar } = require('./grammarParser');

// Utility to deep copy productions
function cloneProductions(productions) {
  return productions.map(p => ({ lhs: p.lhs, rhs: [...p.rhs] }));
}

function getNewNonTerminal(base, existing) {
  let attempt = base + "'";
  while (existing.has(attempt)) {
    attempt += "'";
  }
  return attempt;
}

function removeLeftRecursion(parsed) {
  const original = cloneProductions(parsed.productions);
  let productions = cloneProductions(parsed.productions);
  const nonTerminals = [...parsed.nonTerminals];
  const ntSet = new Set(nonTerminals);
  
  let changed = false;

  for (let i = 0; i < nonTerminals.length; i++) {
    const Ai = nonTerminals[i];
    
    for (let j = 0; j < i; j++) {
      const Aj = nonTerminals[j];
      const newProds = [];
      let substituted = false;
      
      for (const p of productions) {
        if (p.lhs === Ai && p.rhs[0] === Aj) {
          substituted = true;
          const gamma = p.rhs.slice(1);
          const ajProds = productions.filter(x => x.lhs === Aj);
          for (const ajP of ajProds) {
            let newRhs = [...ajP.rhs, ...gamma];
            if (newRhs[0] === 'ε' && newRhs.length > 1) {
              newRhs.shift(); // remove leading epsilon
            }
            newProds.push({ lhs: Ai, rhs: newRhs });
          }
        } else if (p.lhs === Ai) {
          newProds.push(p);
        }
      }
      
      if (substituted) {
        changed = true;
        productions = productions.filter(p => p.lhs !== Ai).concat(newProds);
      }
    }
    
    // Eliminate immediate left recursion on Ai
    const aiProds = productions.filter(p => p.lhs === Ai);
    const alphas = [];
    const betas = [];
    
    for (const p of aiProds) {
      if (p.rhs[0] === Ai) {
        alphas.push(p.rhs.slice(1));
      } else {
        betas.push(p.rhs);
      }
    }
    
    if (alphas.length > 0) {
      changed = true;
      const AiPrime = getNewNonTerminal(Ai, ntSet);
      ntSet.add(AiPrime);
      
      const newAiProds = [];
      if (betas.length === 0) {
        newAiProds.push({ lhs: Ai, rhs: [AiPrime] });
      } else {
        for (const beta of betas) {
          if (beta[0] === 'ε') {
            newAiProds.push({ lhs: Ai, rhs: [AiPrime] });
          } else {
            newAiProds.push({ lhs: Ai, rhs: [...beta, AiPrime] });
          }
        }
      }
      
      const newAiPrimeProds = [];
      for (const alpha of alphas) {
        newAiPrimeProds.push({ lhs: AiPrime, rhs: [...alpha, AiPrime] });
      }
      newAiPrimeProds.push({ lhs: AiPrime, rhs: ['ε'] });
      
      productions = productions.filter(p => p.lhs !== Ai).concat(newAiProds, newAiPrimeProds);
    }
  }

  return {
    changed,
    productions,
    nonTerminals: Array.from(ntSet)
  };
}

function leftFactor(productions, nonTerminals) {
  let prods = cloneProductions(productions);
  const ntSet = new Set(nonTerminals);
  let changed = false;

  let localChanged = true;
  while (localChanged) {
    localChanged = false;
    
    for (const A of Array.from(ntSet)) {
      const aProds = prods.filter(p => p.lhs === A);
      if (aProds.length <= 1) continue;

      // Find longest common prefix
      let longestPrefix = [];
      let bestGroup = [];

      for (let i = 0; i < aProds.length; i++) {
        for (let j = i + 1; j < aProds.length; j++) {
          const r1 = aProds[i].rhs;
          const r2 = aProds[j].rhs;
          let k = 0;
          while (k < r1.length && k < r2.length && r1[k] === r2[k]) {
            k++;
          }
          if (k > 0 && k > longestPrefix.length) {
            longestPrefix = r1.slice(0, k);
            bestGroup = [aProds[i], aProds[j]];
          }
        }
      }

      if (longestPrefix.length > 0) {
        // We found a common prefix, let's group ALL prods with this prefix
        const group = aProds.filter(p => {
          if (p.rhs.length < longestPrefix.length) return false;
          for (let k = 0; k < longestPrefix.length; k++) {
            if (p.rhs[k] !== longestPrefix[k]) return false;
          }
          return true;
        });

        if (group.length > 1) {
          changed = true;
          localChanged = true;
          const APrime = getNewNonTerminal(A, ntSet);
          ntSet.add(APrime);

          const newAProd = { lhs: A, rhs: [...longestPrefix, APrime] };
          const newAPrimeProds = [];

          for (const p of group) {
            const remainder = p.rhs.slice(longestPrefix.length);
            if (remainder.length === 0) {
              newAPrimeProds.push({ lhs: APrime, rhs: ['ε'] });
            } else {
              newAPrimeProds.push({ lhs: APrime, rhs: remainder });
            }
          }

          prods = prods.filter(p => !group.includes(p));
          prods.push(newAProd);
          prods.push(...newAPrimeProds);
          break; // restart outer loop since ntSet and prods changed
        }
      }
    }
  }

  return { changed, productions: prods, nonTerminals: Array.from(ntSet) };
}

function computeFirstSets(productions, nonTerminals, terminals) {
  const first = {};
  for (const t of terminals) first[t] = new Set([t]);
  for (const nt of nonTerminals) first[nt] = new Set();
  first['ε'] = new Set(['ε']);

  let changed = true;
  while (changed) {
    changed = false;
    for (const p of productions) {
      const A = p.lhs;
      const rhs = p.rhs;
      const A_first = first[A];
      const beforeSize = A_first.size;

      let allDeriveEpsilon = true;
      for (const symbol of rhs) {
        const symbolFirst = first[symbol] || new Set();
        for (const f of symbolFirst) {
          if (f !== 'ε') A_first.add(f);
        }
        if (!symbolFirst.has('ε')) {
          allDeriveEpsilon = false;
          break;
        }
      }
      
      if (allDeriveEpsilon) {
        A_first.add('ε');
      }

      if (A_first.size > beforeSize) {
        changed = true;
      }
    }
  }

  // Convert sets to arrays
  const firstArr = {};
  for (const k in first) {
    firstArr[k] = Array.from(first[k]);
  }
  return firstArr;
}

function computeFollowSets(productions, nonTerminals, startSymbol, firstSets) {
  const follow = {};
  for (const nt of nonTerminals) follow[nt] = new Set();
  follow[startSymbol].add('$');

  let changed = true;
  while (changed) {
    changed = false;
    for (const p of productions) {
      const A = p.lhs;
      const rhs = p.rhs;

      for (let i = 0; i < rhs.length; i++) {
        const B = rhs[i];
        if (!nonTerminals.includes(B)) continue;

        const followB = follow[B];
        const beforeSize = followB.size;

        let allDeriveEpsilon = true;
        for (let j = i + 1; j < rhs.length; j++) {
          const beta = rhs[j];
          const firstBeta = firstSets[beta] || [];
          for (const f of firstBeta) {
            if (f !== 'ε') followB.add(f);
          }
          if (!firstBeta.includes('ε')) {
            allDeriveEpsilon = false;
            break;
          }
        }

        if (allDeriveEpsilon) {
          const followA = follow[A];
          for (const f of followA) followB.add(f);
        }

        if (followB.size > beforeSize) {
          changed = true;
        }
      }
    }
  }

  const followArr = {};
  for (const k in follow) {
    followArr[k] = Array.from(follow[k]);
  }
  return followArr;
}

function computeFirstForString(string, firstSets) {
  const result = new Set();
  let allEpsilon = true;
  for (const symbol of string) {
    const sFirst = firstSets[symbol] || [];
    for (const f of sFirst) {
      if (f !== 'ε') result.add(f);
    }
    if (!sFirst.includes('ε')) {
      allEpsilon = false;
      break;
    }
  }
  if (allEpsilon) result.add('ε');
  return Array.from(result);
}

function buildLL1Table(productions, nonTerminals, terminals, firstSets, followSets) {
  const table = {};
  for (const nt of nonTerminals) {
    table[nt] = {};
    for (const t of terminals) table[nt][t] = [];
    table[nt]['$'] = [];
  }

  const conflicts = [];

  for (let i = 0; i < productions.length; i++) {
    const p = productions[i];
    const A = p.lhs;
    const alpha = p.rhs;
    const firstAlpha = computeFirstForString(alpha, firstSets);

    for (const t of firstAlpha) {
      if (t !== 'ε') {
        table[A][t].push(i); // Push production index
      }
    }

    if (firstAlpha.includes('ε')) {
      const followA = followSets[A];
      for (const b of followA) {
        table[A][b].push(i);
      }
    }
  }

  let hasConflict = false;
  for (const nt of nonTerminals) {
    for (const t in table[nt]) {
      if (table[nt][t].length > 1) {
        hasConflict = true;
        conflicts.push({ nonTerminal: nt, lookahead: t, productions: table[nt][t] });
      }
    }
  }

  return { table, hasConflict, conflicts };
}

function tokenizeInput(inputString, terminals) {
  const sortedTerminals = [...terminals].sort((a, b) => b.length - a.length);
  let remaining = inputString.trim();
  const tokens = [];
  while (remaining.length > 0) {
    remaining = remaining.trim();
    if (remaining.length === 0) break;
    let matched = false;
    for (const t of sortedTerminals) {
      if (remaining.startsWith(t)) {
        tokens.push(t);
        remaining = remaining.substring(t.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      const match = remaining.match(/^\S+/);
      if (match) {
        tokens.push(match[0]);
        remaining = remaining.substring(match[0].length);
      } else {
        break;
      }
    }
  }
  return tokens;
}

function parseLL1(table, productions, startSymbol, inputString, terminals) {
  const tokens = tokenizeInput(inputString, terminals);
  tokens.push('$');
  
  const stack = ['$', startSymbol];
  let cursor = 0;
  const trace = [];
  let stepNum = 1;

  while (stack.length > 0) {
    const top = stack[stack.length - 1];
    const currentInput = tokens[cursor];
    const remainingInput = tokens.slice(cursor).join(' ');

    if (top === '$' && currentInput === '$') {
      trace.push({
        step: stepNum++,
        stack: stack.join(' '),
        input: remainingInput,
        action: 'Accept',
        type: 'success'
      });
      return { trace, accepted: true };
    }

    if (top === currentInput) {
      trace.push({
        step: stepNum++,
        stack: stack.join(' '),
        input: remainingInput,
        action: `Shift ${top}`,
        type: 'match'
      });
      stack.pop();
      cursor++;
    } else if (table[top] !== undefined) {
      // It's a non-terminal
      const prodIndices = table[top][currentInput];
      if (!prodIndices || prodIndices.length === 0) {
        trace.push({
          step: stepNum++,
          stack: stack.join(' '),
          input: remainingInput,
          action: `Error: No entry for M[${top}, ${currentInput}]`,
          type: 'error'
        });
        return { trace, accepted: false, reason: `No table entry for ${top} and ${currentInput}` };
      }
      
      const prodIdx = prodIndices[0]; // Just take first if conflict
      const prod = productions[prodIdx];
      
      trace.push({
        step: stepNum++,
        stack: stack.join(' '),
        input: remainingInput,
        action: `Reduce by ${prod.lhs} -> ${prod.rhs.join(' ')}`,
        type: 'expand'
      });

      stack.pop();
      if (prod.rhs[0] !== 'ε') {
        for (let i = prod.rhs.length - 1; i >= 0; i--) {
          stack.push(prod.rhs[i]);
        }
      }
    } else {
      trace.push({
        step: stepNum++,
        stack: stack.join(' '),
        input: remainingInput,
        action: `Error: Terminal mismatch. Expected ${top}, got ${currentInput}`,
        type: 'error'
      });
      return { trace, accepted: false, reason: `Expected ${top}, found ${currentInput}` };
    }
  }

  return { trace, accepted: false, reason: 'Stack empty before input consumed' };
}

module.exports = {
  removeLeftRecursion,
  leftFactor,
  computeFirstSets,
  computeFollowSets,
  buildLL1Table,
  parseLL1
};
