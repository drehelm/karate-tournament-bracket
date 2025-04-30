import { generateSlots, validateCompetitors } from './bracket.js';

/**
 * Generates a Mermaid diagram string for a tournament bracket.
 * 
 * @param {Array<{seed: number, name: string}>} competitors - Array of competitors
 * @param {Object} options - Optional configuration
 * @param {boolean} options.showSeeds - Whether to show seed numbers in labels (default: true)
 * @returns {string} - Mermaid diagram string for the tournament bracket
 */
export function generateMermaidBracket(competitors, options = { showSeeds: true }) {
  validateCompetitors(competitors);
  const slots = generateSlots(competitors);
  
  let diagramStr = "```mermaid\nflowchart LR\n";
  
  // Add styles for different node types
  diagramStr += "classDef competitor fill:#f9f9f9,stroke:#333,stroke-width:1px,rx:4px,ry:4px\n";
  diagramStr += "classDef bye fill:#f0f0f0,stroke:#999,stroke-width:1px,rx:4px,ry:4px,font-style:italic\n";
  diagramStr += "classDef full-bye fill:#f0f0f0,stroke:#999,stroke-width:1px,rx:4px,ry:4px,font-style:italic,stroke-dasharray:5,5\n";
  diagramStr += "classDef winner fill:#e6f7ff,stroke:#0066cc,stroke-width:2px,rx:4px,ry:4px,font-weight:bold\n";
  
  // Generate first round matches (16 matches, 32 slots)
  const matchCount = 16;
  const roundCount = 5; // log2(32) = 5 rounds
  
  // Create first round matches (R1)
  for (let i = 0; i < matchCount; i++) {
    const topSlot = slots[2 * i];
    const bottomSlot = slots[2 * i + 1];
    const matchId = `M${i + 1}`;
    
    // Format player labels with optional seeds
    const formatPlayer = (slot) => {
      if (slot.seed === null) return "BYE";
      return options.showSeeds ? `[${slot.seed}] ${slot.name}` : slot.name;
    };
    
    // Create match node - always create nodes for all matches
    diagramStr += `${matchId}["${formatPlayer(topSlot)}<hr/>${formatPlayer(bottomSlot)}"]\n`;
    
    // Apply style based on content
    if (topSlot.seed === null && bottomSlot.seed === null) {
      // Full BYE match (both sides are BYEs)
      diagramStr += `${matchId}:::full-bye\n`;
    } else if (topSlot.seed === null || bottomSlot.seed === null) {
      // Partial BYE (one side is a BYE)
      diagramStr += `${matchId}:::bye\n`;
    } else {
      // Regular match (both competitors)
      diagramStr += `${matchId}:::competitor\n`;
    }
  }
  
  // Create subsequent rounds (R2 to finals)
  // Each round has half the matches of the previous round
  for (let round = 2; round <= roundCount; round++) {
    const matchesInRound = matchCount / Math.pow(2, round - 1);
    
    for (let i = 0; i < matchesInRound; i++) {
      const matchId = `R${round}M${i + 1}`;
      const roundName = round === roundCount ? "Final" : `Round ${round}`;
      
      // Create match node for this round
      diagramStr += `${matchId}["${roundName}<hr/>Match ${i + 1}"]\n`;
      diagramStr += `${matchId}:::competitor\n`;
      
      // Connect to previous round matches
      const prevMatch1 = round === 2 ? `M${i*2 + 1}` : `R${round-1}M${i*2 + 1}`;
      const prevMatch2 = round === 2 ? `M${i*2 + 2}` : `R${round-1}M${i*2 + 2}`;
      
      // Connect all matches, regardless of bye status
      diagramStr += `${prevMatch1} --> ${matchId}\n`;
      diagramStr += `${prevMatch2} --> ${matchId}\n`;
    }
  }
  
  // Close the mermaid syntax
  diagramStr += "```";
  
  return diagramStr;
}

/**
 * Complete bracket generator that returns both slots and mermaid diagram.
 * 
 * @param {Array<{seed: number, name: string}>} competitors - Array of competitors
 * @param {Object} options - Optional configuration
 * @param {boolean} options.showSeeds - Whether to show seed numbers in labels
 * @returns {Object} - Object containing slots and mermaid diagram
 */
export function generateBracket(competitors, options = { showSeeds: true }) {
  validateCompetitors(competitors);
  const slots = generateSlots(competitors);
  const mermaid = generateMermaidBracket(competitors, options);
  
  return { slots, mermaid };
}