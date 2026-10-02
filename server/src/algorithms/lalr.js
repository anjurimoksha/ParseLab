const { computeFirstSets } = require('./ll1');

function augmentGrammar(parsed) {
  const newStart = parsed.startSymbol + "'";
  const productions = [
    { lhs: newStart, rhs: [parsed.startSymbol] },
    ...parsed.productions
  ];
  return {
    startSymbol: newStart,
    originalStart: parsed.startSymbol,
    nonTerminals: [newStart, ...parsed.nonTerminals],
    terminals: parsed.terminals,
    productions
  };
}

function itemsEqual(i1, i2) {
  return i1.prodIdx === i2.prodIdx && i1.dotPos === i2.dotPos && i1.lookahead === i2.lookahead;
}

function itemSetsEqual(s1, s2) {
  if (s1.length !== s2.length) return false;
  for (const i1 of s1) {
    if (!s2.find(i2 => itemsEqual(i1, i2))) return false;
  }
  return true;
}

function computeFirstForString(string, firstSets) {
  const result = new Set();
  let allEpsilon = true;
  for (const symbol of string) {
    if (symbol === '$') {
      result.add('$');
      allEpsilon = false;
      break;
    }
    const sFirst = firstSets[symbol] || [symbol];
    for (const f of sFirst) {
      if (f !== 'ε') result.add(f);
    }
    if (!sFirst.includes('ε') && (!firstSets[symbol] || !firstSets[symbol].includes('ε'))) {
      allEpsilon = false;
      break;
    }
  }
  if (allEpsilon) result.add('ε');
  return Array.from(result);
}

function closure(items, productions, firstSets) {
  const J = [...items];
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < J.length; i++) {
      const item = J[i];
      const prod = productions[item.prodIdx];
      if (item.dotPos < prod.rhs.length && prod.rhs[0] !== 'ε') {
        const B = prod.rhs[item.dotPos];
        // If B is non-terminal
        if (productions.some(p => p.lhs === B)) {
          const beta = prod.rhs.slice(item.dotPos + 1);
          beta.push(item.lookahead);
          const firstBeta = computeFirstForString(beta, firstSets);
          
          for (let pIdx = 0; pIdx < productions.length; pIdx++) {
            if (productions[pIdx].lhs === B) {
              for (const b of firstBeta) {
                if (b !== 'ε') {
                  const newItem = { prodIdx: pIdx, dotPos: 0, lookahead: b };
                  if (!J.find(it => itemsEqual(it, newItem))) {
                    J.push(newItem);
                    changed = true;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return J;
}

function gotoFn(items, X, productions, firstSets) {
  const gotoItems = [];
  for (const item of items) {
    const prod = productions[item.prodIdx];
    if (item.dotPos < prod.rhs.length && prod.rhs[item.dotPos] === X) {
      gotoItems.push({ prodIdx: item.prodIdx, dotPos: item.dotPos + 1, lookahead: item.lookahead });
    } else if (prod.rhs[0] === 'ε' && X === 'ε') {
      // Epsilon transition not typical in LR, but if we handle epsilon rules:
      // dot moves past epsilon essentially
    }
  }
  return closure(gotoItems, productions, firstSets);
}

function buildLR1States(grammar, firstSets) {
  const initialItem = { prodIdx: 0, dotPos: 0, lookahead: '$' };
  const I0 = closure([initialItem], grammar.productions, firstSets);
  
  const states = [I0];
  const transitions = []; // { from, symbol, to }
  
  const symbols = [...grammar.nonTerminals, ...grammar.terminals];

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      for (const X of symbols) {
        if (X === grammar.startSymbol) continue; // no transitions on S'
        const nextState = gotoFn(state, X, grammar.productions, firstSets);
        if (nextState.length > 0) {
          let stateIdx = states.findIndex(s => itemSetsEqual(s, nextState));
          if (stateIdx === -1) {
            states.push(nextState);
            stateIdx = states.length - 1;
            changed = true;
          }
          if (!transitions.find(t => t.from === i && t.symbol === X && t.to === stateIdx)) {
            transitions.push({ from: i, symbol: X, to: stateIdx });
          }
        }
      }
    }
  }

  return { states, transitions };
}

function getCore(state) {
  const coreItems = state.map(item => ({ prodIdx: item.prodIdx, dotPos: item.dotPos }));
  // deduplicate
  const uniqueCore = [];
  for (const ci of coreItems) {
    if (!uniqueCore.find(u => u.prodIdx === ci.prodIdx && u.dotPos === ci.dotPos)) {
      uniqueCore.push(ci);
    }
  }
  // sort for deterministic comparison
  uniqueCore.sort((a, b) => a.prodIdx !== b.prodIdx ? a.prodIdx - b.prodIdx : a.dotPos - b.dotPos);
  return uniqueCore;
}

function coresEqual(c1, c2) {
  if (c1.length !== c2.length) return false;
  for (let i = 0; i < c1.length; i++) {
    if (c1[i].prodIdx !== c2[i].prodIdx || c1[i].dotPos !== c2[i].dotPos) return false;
  }
  return true;
}

function mergeLALR(lr1States, lr1Transitions) {
  const cores = lr1States.map(getCore);
  const mapping = []; // old state index -> merged state index
  const mergedStates = [];
  
  for (let i = 0; i < lr1States.length; i++) {
    const c1 = cores[i];
    let found = -1;
    for (let j = 0; j < mergedStates.length; j++) {
      if (coresEqual(c1, getCore(mergedStates[j]))) {
        found = j;
        break;
      }
    }
    if (found === -1) {
      mergedStates.push([...lr1States[i]]);
      mapping[i] = mergedStates.length - 1;
    } else {
      // Merge lookaheads
      for (const item of lr1States[i]) {
        if (!mergedStates[found].find(it => itemsEqual(it, item))) {
          mergedStates[found].push(item);
        }
      }
      mapping[i] = found;
    }
  }

  const mergedTransitions = [];
  for (const t of lr1Transitions) {
    const newFrom = mapping[t.from];
    const newTo = mapping[t.to];
    if (!mergedTransitions.find(mt => mt.from === newFrom && mt.symbol === t.symbol && mt.to === newTo)) {
      mergedTransitions.push({ from: newFrom, symbol: t.symbol, to: newTo });
    }
  }

  return { mergedStates, mergedTransitions, mapping };
}

function buildLALRTable(states, transitions, productions, terminals, nonTerminals) {
  const table = [];
  for (let i = 0; i < states.length; i++) {
    const row = { ACTION: {}, GOTO: {} };
    for (const t of terminals) row.ACTION[t] = [];
    row.ACTION['$'] = [];
    for (const nt of nonTerminals) row.GOTO[nt] = null;
    table.push(row);
  }

  const conflicts = [];

  // Shifts and Gotos
  for (const t of transitions) {
    if (terminals.includes(t.symbol)) {
      table[t.from].ACTION[t.symbol].push(`s${t.to}`);
    } else if (nonTerminals.includes(t.symbol)) {
      table[t.from].GOTO[t.symbol] = t.to;
    }
  }

  // Reduces and Accepts
  for (let i = 0; i < states.length; i++) {
    for (const item of states[i]) {
      const prod = productions[item.prodIdx];
      if (item.dotPos === prod.rhs.length || prod.rhs[0] === 'ε') {
        if (item.prodIdx === 0) {
          table[i].ACTION['$'].push('acc');
        } else {
          table[i].ACTION[item.lookahead].push(`r${item.prodIdx}`);
        }
      }
    }
  }

  let hasConflict = false;
  for (let i = 0; i < states.length; i++) {
    for (const t in table[i].ACTION) {
      if (table[i].ACTION[t].length > 1) {
        hasConflict = true;
        conflicts.push({ state: i, symbol: t, actions: table[i].ACTION[t] });
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

function parseLALR(table, productions, inputString, terminals) {
  const tokens = tokenizeInput(inputString, terminals);
  tokens.push('$');
  
  const stack = [0];
  const symbols = [];
  let cursor = 0;
  const trace = [];
  let stepNum = 1;

  while (true) {
    const state = stack[stack.length - 1];
    const currentInput = tokens[cursor];
    const remainingInput = tokens.slice(cursor).join(' ');
    
    // Build stack string: e.g. "0 c 3 C 8"
    let stackStr = "";
    for (let i = 0; i < symbols.length; i++) {
      stackStr += `${stack[i]} ${symbols[i]} `;
    }
    stackStr += `${stack[stack.length - 1]}`;

    if (!table[state] || !table[state].ACTION[currentInput]) {
      trace.push({
        step: stepNum++,
        stack: stackStr,
        input: remainingInput,
        action: `Error: No ACTION[${state}, ${currentInput}]`,
        type: 'error'
      });
      return { trace, accepted: false, reason: `No entry for state ${state} and symbol ${currentInput}` };
    }

    const actions = table[state].ACTION[currentInput];
    if (actions.length === 0) {
      trace.push({
        step: stepNum++,
        stack: stackStr,
        input: remainingInput,
        action: `Error: Blank ACTION[${state}, ${currentInput}]`,
        type: 'error'
      });
      return { trace, accepted: false, reason: `Syntax error at ${currentInput}` };
    }

    const action = actions[0]; // Take first if conflict

    if (action.startsWith('s')) {
      const nextState = parseInt(action.substring(1));
      trace.push({
        step: stepNum++,
        stack: stackStr,
        input: remainingInput,
        action: `Shift ${nextState}`,
        type: 'shift'
      });
      stack.push(nextState);
      symbols.push(currentInput);
      cursor++;
    } else if (action.startsWith('r')) {
      const prodIdx = parseInt(action.substring(1));
      const prod = productions[prodIdx];
      trace.push({
        step: stepNum++,
        stack: stackStr,
        input: remainingInput,
        action: `Reduce by ${prod.lhs} -> ${prod.rhs.join(' ')}`,
        type: 'reduce'
      });
      
      const popCount = prod.rhs[0] === 'ε' ? 0 : prod.rhs.length;
      for (let i = 0; i < popCount; i++) {
        stack.pop();
        symbols.pop();
      }
      
      const topState = stack[stack.length - 1];
      const gotoState = table[topState].GOTO[prod.lhs];
      if (gotoState === undefined || gotoState === null) {
        trace.push({
          step: stepNum++,
          stack: stack.join(' '),
          input: remainingInput,
          action: `Error: No GOTO[${topState}, ${prod.lhs}]`,
          type: 'error'
        });
        return { trace, accepted: false, reason: 'Invalid GOTO' };
      }
      
      stack.push(gotoState);
      symbols.push(prod.lhs);
    } else if (action === 'acc') {
      trace.push({
        step: stepNum++,
        stack: stackStr,
        input: remainingInput,
        action: 'Accept',
        type: 'success'
      });
      return { trace, accepted: true };
    } else {
      return { trace, accepted: false, reason: 'Unknown action' };
    }
  }
}

module.exports = {
  augmentGrammar,
  buildLR1States,
  mergeLALR,
  buildLALRTable,
  parseLALR
};
