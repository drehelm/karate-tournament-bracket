import React, { useState, useRef, useEffect } from 'react';
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "./components/ui/dialog";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import mermaid from 'mermaid';

export default function KarateTournamentBracket() {
  const [competitorCount, setCompetitorCount] = useState(8);
  const [showSettings, setShowSettings] = useState(false);
  const [bracketGenerated, setBracketGenerated] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [paperSize, setPaperSize] = useState('letter'); // 'letter' or 'a4'
  const [bracketOrientation, setBracketOrientation] = useState('landscape'); // 'portrait' or 'landscape'
  const bracketRef = useRef(null);
  const mermaidRef = useRef(null);

  // Initialize mermaid when component mounts
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'linear', // Use straight lines
      },
      securityLevel: 'loose',
    });
  }, []);

  // Render mermaid diagram when bracket is generated
  useEffect(() => {
    if (bracketGenerated && mermaidRef.current) {
      const mermaidDiagram = generateMermaidDiagram();
      mermaidRef.current.innerHTML = mermaidDiagram;
      mermaid.init(undefined, mermaidRef.current);
    }
  }, [bracketGenerated, competitorCount]);

  // Calculate the total slots needed (next power of 2)
  const calculateTotalSlots = (count) => {
    let power = 1;
    while (power < count) {
      power *= 2;
    }
    return power;
  };

  // Calculate the number of rounds in the tournament
  const calculateRounds = (totalSlots) => {
    return Math.log2(totalSlots);
  };

  // Generate the bracket structure with byes
  const generateBracket = () => {
    const totalSlots = calculateTotalSlots(competitorCount);
    const byeCount = totalSlots - competitorCount;
    const rounds = calculateRounds(totalSlots);

    // Initial round
    let matches = [];
    let activeCompetitors = competitorCount;
    let activeByes = byeCount;

    // Distribute byes across the bracket
    for (let i = 0; i < totalSlots / 2; i++) {
      // Determine if this match has a bye
      if (activeByes > 0 && (i % 2 === 0 || activeCompetitors <= 1)) {
        // One competitor gets a bye
        matches.push({ hasBye: true, position: i });
        activeByes--;
        activeCompetitors--;
      } else {
        // Regular match with two competitors
        matches.push({ hasBye: false, position: i });
        activeCompetitors -= 2;
      }
    }

    return { rounds, totalSlots, matches };
  };

  // Generate Mermaid diagram syntax for tournament bracket
  const generateMermaidDiagram = () => {
    const { rounds, totalSlots, matches } = generateBracket();
    let diagram = 'graph LR\n';
    
    // Define a function to generate a unique ID for each match
    const matchId = (round, match) => `R${round}M${match}`;
    
    // Define style for matches
    diagram += 'classDef match fill:#f9f9f9,stroke:#333,stroke-width:1px,rx:4px,ry:4px\n';
    diagram += 'classDef bye fill:#f0f0f0,stroke:#999,stroke-width:1px,rx:4px,ry:4px,font-style:italic\n';
    
    // First round - initial matches
    for (let i = 0; i < totalSlots / 2; i++) {
      const hasBye = matches[i]?.hasBye;
      if (hasBye) {
        diagram += `${matchId(0, i)}["BYE"]\n`;
        diagram += `${matchId(0, i)}:::bye\n`;
      } else {
        diagram += `${matchId(0, i)}["Competitor ${i*2+1}<hr/>Competitor ${i*2+2}"]\n`;
        diagram += `${matchId(0, i)}:::match\n`;
      }
    }
    
    // Generate subsequent rounds
    for (let r = 1; r < rounds; r++) {
      const matchesInRound = totalSlots / Math.pow(2, r + 1);
      
      for (let m = 0; m < matchesInRound; m++) {
        // Create match box for this round
        diagram += `${matchId(r, m)}["Winner ${m*2+1}<hr/>Winner ${m*2+2}"]\n`;
        diagram += `${matchId(r, m)}:::match\n`;
        
        // Connect to previous round matches
        diagram += `${matchId(r-1, m*2)} --> ${matchId(r, m)}\n`;
        diagram += `${matchId(r-1, m*2+1)} --> ${matchId(r, m)}\n`;
      }
    }
    
    // Set orientation to left-to-right and use straight lines with 90-degree angles
    return diagram;
  };

  // Print bracket
  const printBracket = () => {
    window.print();
  };

  // Export as PDF (optimized for smaller file size)
  const exportPDF = async () => {
    if (!bracketRef.current) return;
    
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(bracketRef.current, {
        scale: 1.5, // Reduced from 2 to 1.5 for better file size
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff' // Ensure white background for better compression
      });
      
      // Use JPEG instead of PNG with quality setting for smaller file size
      const imgData = canvas.toDataURL('image/jpeg', 0.8); // 80% quality JPEG
      
      // Determine page dimensions based on selected paper size and orientation
      let pageWidth, pageHeight;
      if (paperSize === 'letter') {
        pageWidth = bracketOrientation === 'landscape' ? 11 : 8.5;
        pageHeight = bracketOrientation === 'landscape' ? 8.5 : 11;
      } else { // a4
        pageWidth = bracketOrientation === 'landscape' ? 11.7 : 8.3;
        pageHeight = bracketOrientation === 'landscape' ? 8.3 : 11.7;
      }
      
      const pdf = new jsPDF({
        orientation: bracketOrientation,
        unit: 'in',
        format: paperSize,
        compress: true // Enable PDF compression
      });
      
      // Calculate the ratio to fit the image to page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(
        (pageWidth - 1) / imgWidth,
        (pageHeight - 1) / imgHeight
      );
      
      // Center the image on the page
      const x = (pageWidth - imgWidth * ratio) / 2;
      const y = (pageHeight - imgHeight * ratio) / 2;
      
      // Add image to PDF with compression
      pdf.addImage(
        imgData,
        'JPEG',
        x,
        y,
        imgWidth * ratio,
        imgHeight * ratio,
        undefined, // No alias
        'FAST' // Use fast compression
      );
      
      // Save PDF with smaller file size
      pdf.save('karate-tournament-bracket.pdf');
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-full mx-auto print:p-0">
      <h1 className="text-2xl font-bold text-center print:text-3xl">
        Karate Tournament Bracket Generator
      </h1>
      
      {!bracketGenerated ? (
        <Card className="p-6 shadow-md max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Generate Tournament Bracket</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium" htmlFor="competitorCount">
                Number of Competitors:
              </label>
              <input
                id="competitorCount"
                type="number"
                min="2"
                max="64"
                value={competitorCount}
                onChange={(e) => setCompetitorCount(parseInt(e.target.value) || 2)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowSettings(true)}
                className="bg-gray-500 text-white"
              >
                Print Settings
              </Button>
              
              <Button
                onClick={() => setBracketGenerated(true)}
                className="bg-blue-500 text-white"
              >
                Generate Bracket
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-4 print:hidden">
            <Button
              onClick={() => setBracketGenerated(false)}
              className="bg-gray-500 text-white"
            >
              Back
            </Button>
            
            <Button
              onClick={() => setShowSettings(true)}
              className="bg-blue-500 text-white"
            >
              Print Settings
            </Button>
            
            <Button
              onClick={printBracket}
              className="bg-green-500 text-white"
            >
              Print
            </Button>
            
            <Button
              onClick={exportPDF}
              className="bg-purple-500 text-white"
              disabled={isExporting}
            >
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
          
          {/* Tournament Bracket Display using Mermaid */}
          <div
            ref={bracketRef}
            className="bg-white rounded-lg shadow-md print:shadow-none p-4 overflow-auto"
          >
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold">Single Elimination Tournament</h2>
              <p className="text-sm text-gray-600 print:text-gray-800 mb-4">
                {competitorCount} Competitors • {calculateTotalSlots(competitorCount) - competitorCount} Byes • {calculateRounds(calculateTotalSlots(competitorCount))} Rounds
              </p>
            </div>
            
            {/* Mermaid diagram container */}
            <div 
              ref={mermaidRef} 
              className="mermaid tournament-bracket" 
              style={{ 
                width: '100%',
                minHeight: '300px',
                overflowX: 'auto'
              }}
            >
              {/* Mermaid diagram will be rendered here */}
            </div>
            
            <div className="mt-8 border-t pt-4">
              <p className="text-xs text-gray-500 print:text-gray-700">
                Tournament Director: ______________________ Date: ____________
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Dialog */}
      <Dialog
        open={showSettings}
        onOpenChange={setShowSettings}
      >
        <DialogTitle>Print Settings</DialogTitle>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Paper Size:</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paperSize"
                    value="letter"
                    checked={paperSize === 'letter'}
                    onChange={() => setPaperSize('letter')}
                    className="mr-2"
                  />
                  Letter (8.5" x 11")
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paperSize"
                    value="a4"
                    checked={paperSize === 'a4'}
                    onChange={() => setPaperSize('a4')}
                    className="mr-2"
                  />
                  A4 (8.3" x 11.7")
                </label>
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Orientation:</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orientation"
                    value="portrait"
                    checked={bracketOrientation === 'portrait'}
                    onChange={() => setBracketOrientation('portrait')}
                    className="mr-2"
                  />
                  Portrait
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orientation"
                    value="landscape"
                    checked={bracketOrientation === 'landscape'}
                    onChange={() => setBracketOrientation('landscape')}
                    className="mr-2"
                  />
                  Landscape
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                onClick={() => setShowSettings(false)}
                className="bg-gray-500 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowSettings(false);
                }}
                className="bg-blue-500 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}