# ParseLab

Interactive Parser Generator & Visualizer for LL(1) and LALR(1) grammars.

## Setup
1. Run \`npm run install-all\` from the root folder.
2. (Optional) In \`server/\`, copy \`.env.example\` to \`.env\` and set \`MONGO_URI\` if you want history persistence.
3. Run \`npm run dev\` from the root folder to start both client and server.

## Features
- **Top-Down (LL1):** Left recursion removal, left factoring, FIRST/FOLLOW sets, parsing table, interactive string parsing with trace.
- **Bottom-Up (LALR):** Augmentation, canonical LR(1) items, core merging, LALR state transition table, shift/reduce interactive trace.
- **UI:** Built with React, Vite, and Mantine v7.

## Algorithms
Algorithms are cleanly separated in \`server/src/algorithms\` and comprehensively unit tested.
