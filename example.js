import { generateBracket } from './mermaid.js';

/**
 * Example usage of the Tournament Bracket Generator
 */

// Create a list of competitors (up to 20)
const entrants = [
  { seed: 1, name: 'Alex' },
  { seed: 2, name: 'Bailey' },
  { seed: 3, name: 'Casey' },
  { seed: 4, name: 'Dana' },
  { seed: 5, name: 'Eli' },
  { seed: 6, name: 'Finn' },
  { seed: 7, name: 'Gray' },
  { seed: 8, name: 'Harper' },
  { seed: 9, name: 'Indigo' },
  { seed: 10, name: 'Jordan' }
  // Reduced to 10 entries to demonstrate a mix of real matches and BYEs
];

// Generate the bracket with seeds shown
const { slots, mermaid } = generateBracket(entrants, { showSeeds: true });

// Print the Mermaid diagram (ready to paste into Markdown)
console.log(mermaid);

// Example of how to use the slots data for custom rendering
console.log('\nFirst round matchups:');
for (let i = 0; i < 16; i++) {
  const top = slots[i * 2];
  const bottom = slots[i * 2 + 1];
  
  const topName = top.seed !== null ? `[${top.seed}] ${top.name}` : 'BYE';
  const bottomName = bottom.seed !== null ? `[${bottom.seed}] ${bottom.name}` : 'BYE';
  
  console.log(`Match ${i + 1}: ${topName} vs ${bottomName}`);
}

/**
 * To run this example:
 * 1. Make sure Node.js is installed
 * 2. Run: node example.js
 * 
 * You'll see the Mermaid diagram string which can be pasted directly
 * into any Markdown editor that supports Mermaid, as well as
 * a simple console output of first round matchups.
 */