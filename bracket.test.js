import { generateSlots, validateCompetitors } from './bracket.js';
import { generateMermaidBracket } from './mermaid.js';

// Mock competitors
const makeCompetitors = (n) => {
  return Array.from({ length: n }, (_, i) => ({ 
    seed: i + 1, 
    name: `Player ${i + 1}` 
  }));
};

describe('Tournament Bracket Generation', () => {
  describe('validateCompetitors', () => {
    test('should throw RangeError if more than 20 competitors', () => {
      const competitors = makeCompetitors(21);
      expect(() => validateCompetitors(competitors)).toThrow(RangeError);
      expect(() => validateCompetitors(competitors)).toThrow('Division cap exceeded');
    });

    test('should throw TypeError if seeds are not unique', () => {
      const competitors = [
        { seed: 1, name: 'Player 1' },
        { seed: 1, name: 'Player 2' },
        { seed: 3, name: 'Player 3' }
      ];
      expect(() => validateCompetitors(competitors)).toThrow(TypeError);
      expect(() => validateCompetitors(competitors)).toThrow('Seeds must be unique');
    });

    test('should throw TypeError if seeds are out of range', () => {
      const competitors = [
        { seed: 1, name: 'Player 1' },
        { seed: 2, name: 'Player 2' },
        { seed: 4, name: 'Player 3' } // Seed 4 out of range for 3 competitors
      ];
      expect(() => validateCompetitors(competitors)).toThrow(TypeError);
      expect(() => validateCompetitors(competitors)).toThrow('Seeds must be integers from 1 to 3');
    });

    test('should not throw when competitors are valid', () => {
      const competitors = makeCompetitors(20);
      expect(() => validateCompetitors(competitors)).not.toThrow();
    });
  });

  describe('generateSlots', () => {
    test('should always return 32 slots', () => {
      for (const n of [8, 17, 20]) {
        const competitors = makeCompetitors(n);
        const slots = generateSlots(competitors);
        expect(slots.length).toBe(32);
      }
    });

    test('should have correct BYE count for N = 20', () => {
      const competitors = makeCompetitors(20);
      const slots = generateSlots(competitors);
      const byeCount = slots.filter(slot => slot.seed === null).length;
      expect(byeCount).toBe(32 - 20);
    });

    test('should have correct BYE count for N = 17', () => {
      const competitors = makeCompetitors(17);
      const slots = generateSlots(competitors);
      const byeCount = slots.filter(slot => slot.seed === null).length;
      expect(byeCount).toBe(32 - 17);
    });

    test('should have correct BYE count for N = 8', () => {
      const competitors = makeCompetitors(8);
      const slots = generateSlots(competitors);
      const byeCount = slots.filter(slot => slot.seed === null).length;
      expect(byeCount).toBe(32 - 8);
    });

    test('seed 1 should never fight another live competitor before R16 when BYEs exist', () => {
      // This test verifies that seed 1 is paired with a BYE in the first round
      // when N < 32, meaning they don't face a competitor until R16
      for (const n of [8, 17, 20]) {
        const competitors = makeCompetitors(n);
        const slots = generateSlots(competitors);
        
        // Find seed 1 position
        const seed1Index = slots.findIndex(slot => slot.seed === 1);
        
        // Check if the opponent is a BYE
        // Seed 1 is either at an even position facing the next odd position,
        // or at an odd position facing the previous even position
        let opponentIndex;
        if (seed1Index % 2 === 0) {
          opponentIndex = seed1Index + 1;
        } else {
          opponentIndex = seed1Index - 1;
        }
        
        expect(slots[opponentIndex].seed).toBeNull();
      }
    });
  });

  describe('generateMermaidBracket', () => {
    test('should return a string starting with ```mermaid\\nflowchart', () => {
      const competitors = makeCompetitors(16);
      const mermaid = generateMermaidBracket(competitors);
      expect(mermaid).toMatch(/^```mermaid\nflowchart LR/);
    });

    test('should contain 32 leaf nodes', () => {
      const competitors = makeCompetitors(16);
      const mermaid = generateMermaidBracket(competitors);
      
      // Count match nodes in the first round, which should be 16 matches (32 slots)
      const firstRoundMatchRegex = /M\d+\["/g;
      const matches = mermaid.match(firstRoundMatchRegex) || [];
      expect(matches.length).toBe(16);
    });

    test('should include BYE slots with correct styling', () => {
      const competitors = makeCompetitors(8); // 24 BYEs
      const mermaid = generateMermaidBracket(competitors);
      
      // Check for BYE label
      expect(mermaid).toContain('BYE');
      
      // Check for BYE styling
      expect(mermaid).toContain(':::bye');
    });

    test('should correctly include seeds when showSeeds is true', () => {
      const competitors = makeCompetitors(8);
      const mermaid = generateMermaidBracket(competitors, { showSeeds: true });
      expect(mermaid).toContain('[1] Player 1');
    });

    test('should not include seeds when showSeeds is false', () => {
      const competitors = makeCompetitors(8);
      const mermaid = generateMermaidBracket(competitors, { showSeeds: false });
      expect(mermaid).not.toContain('[1]');
    });
  });
});