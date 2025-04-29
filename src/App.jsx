import React, { useState, useRef } from 'react';
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "./components/ui/dialog";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function KarateTournamentBracket() {
  const [competitorCount, setCompetitorCount] = useState(8);
  const [showSettings, setShowSettings] = useState(false);
  const [bracketGenerated, setBracketGenerated] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [paperSize, setPaperSize] = useState('letter'); // 'letter' or 'a4'
  const [bracketOrientation, setBracketOrientation] = useState('landscape'); // 'portrait' or 'landscape'
  const bracketRef = useRef(null);

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
    <div className="p-4 space-y-4 max-w-7xl mx-auto print:p-0">
      <h1 className="text-2xl font-bold text-center print:text-3xl">
        Karate Tournament Bracket Generator
      </h1>
      
      {!bracketGenerated ? (
        <Card className="p-6 shadow-md">
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
          
          {/* Tournament Bracket Display */}
          <div 
            ref={bracketRef}
            className="tournament-bracket p-4 overflow-auto bg-white rounded-lg shadow-md print:shadow-none print:p-0"
          >
            <BracketDisplay
              competitorCount={competitorCount}
              bracketData={generateBracket()}
            />
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
                  if (bracketGenerated) {
                    // Apply settings immediately if the bracket is generated
                    setTimeout(() => {
                      if (document.querySelector('.tournament-bracket')) {
                        document.querySelector('.tournament-bracket').style.pageBreakInside = 'avoid';
                      }
                    }, 100);
                  }
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

function BracketDisplay({ competitorCount, bracketData }) {
  const { rounds, totalSlots, matches } = bracketData;
  
  const renderBracket = () => {
    // Standard sizes for consistent rendering
    const columnWidth = 200;
    const matchHeight = 60;
    const matchWidth = 180;
    const hSpacing = 40;
    
    // Collection of JSX elements for each round
    const bracketColumns = [];
    
    // Prepare data structure for the entire bracket
    const bracketData = [];
    
    // Initialize structure with empty slots
    for (let r = 0; r < rounds; r++) {
      const matchesInRound = totalSlots / Math.pow(2, r + 1);
      const roundMatches = [];
      
      for (let m = 0; m < matchesInRound; m++) {
        roundMatches.push({
          round: r,
          position: m,
          competitors: r === 0 
            ? [(matches[m]?.hasBye ? "BYE" : "_________________"), "_________________"] 
            : ["_________________", "_________________"]
        });
      }
      
      bracketData.push(roundMatches);
    }
    
    // Calculate maximum height needed (based on first round which has most matches)
    const firstRoundHeight = bracketData[0].length * (matchHeight + 20);
    
    // Render each round
    for (let r = 0; r < rounds; r++) {
      const roundMatches = [];
      const matchesInThisRound = bracketData[r];
      
      // Calculate the space multiplier for this round
      // This ensures proper alignment of matches as rounds progress
      const spacingMultiplier = Math.pow(2, r);
      
      // Calculate spacing between matches in this round
      const verticalSpacing = 20 * spacingMultiplier;
      
      for (let m = 0; m < matchesInThisRound.length; m++) {
        const match = matchesInThisRound[m];
        const isFirstRound = r === 0;
        
        // For non-first rounds, calculate vertical position to align with parent matches
        const topPosition = isFirstRound 
          ? m * (matchHeight + verticalSpacing)
          : m * (matchHeight + verticalSpacing) * 2;
        
        roundMatches.push(
          <div 
            key={`match-${r}-${m}`} 
            className="match-wrapper" 
            style={{
              position: 'absolute',
              top: topPosition,
              left: 0,
              width: matchWidth,
              height: matchHeight
            }}
          >
            {/* Match box */}
            <div 
              className="match-box border border-gray-300 rounded shadow-sm bg-white"
              style={{
                width: matchWidth,
                height: matchHeight,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div className="competitor-top border-b border-gray-300 h-1/2 p-1 flex items-center">
                <span className="text-sm truncate">{match.competitors[0]}</span>
              </div>
              <div className="competitor-bottom h-1/2 p-1 flex items-center">
                <span className="text-sm truncate">{match.competitors[1]}</span>
              </div>
            </div>
            
            {/* Horizontal connector to next round (except for final round) */}
            {r < rounds - 1 && (
              <div 
                className="connector-horizontal" 
                style={{
                  position: 'absolute',
                  left: matchWidth,
                  top: matchHeight / 2,
                  width: hSpacing,
                  height: 2,
                  backgroundColor: '#888'
                }}
              />
            )}
            
            {/* Vertical connector to parent match (except for first round) */}
            {r > 0 && (
              <>
                <div 
                  className="connector-vertical" 
                  style={{
                    position: 'absolute',
                    left: -hSpacing / 2,
                    top: -verticalSpacing,
                    width: 2,
                    height: verticalSpacing + matchHeight / 2,
                    backgroundColor: '#888'
                  }}
                />
                <div 
                  className="connector-vertical-bottom" 
                  style={{
                    position: 'absolute',
                    left: -hSpacing / 2,
                    top: matchHeight / 2,
                    width: 2,
                    height: verticalSpacing,
                    backgroundColor: '#888'
                  }}
                />
                <div 
                  className="connector-horizontal-left" 
                  style={{
                    position: 'absolute',
                    left: -hSpacing / 2,
                    top: matchHeight / 2,
                    width: hSpacing / 2,
                    height: 2,
                    backgroundColor: '#888'
                  }}
                />
              </>
            )}
          </div>
        );
      }
      
      const heightForThisRound = Math.max(
        firstRoundHeight,
        matchesInThisRound.length * (matchHeight + verticalSpacing) * (r > 0 ? 2 : 1)
      );
      
      // Create column for this round
      bracketColumns.push(
        <div 
          key={`round-${r}`} 
          className="round-column relative"
          style={{
            width: columnWidth,
            height: heightForThisRound,
            flexShrink: 0
          }}
        >
          <div className="round-title text-center font-semibold mb-6 mt-2">
            {r === 0 ? "First Round" : r === rounds - 1 ? "Final" : `Round ${r + 1}`}
          </div>
          <div className="matches-container relative" style={{ height: 'calc(100% - 40px)' }}>
            {roundMatches}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bracket-container flex justify-start overflow-x-auto">
        {bracketColumns}
      </div>
    );
  };
  
  return (
    <div className="bracket-wrapper">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-bold">Single Elimination Tournament</h2>
        <p className="text-sm text-gray-600 print:text-gray-800">
          {competitorCount} Competitors • {totalSlots - competitorCount} Byes • {rounds} Rounds
        </p>
      </div>
      
      {renderBracket()}
      
      <div className="mt-6 print:mt-8">
        <p className="text-xs text-gray-500 print:text-gray-700">
          Tournament Director: ______________________ Date: ____________
        </p>
      </div>
    </div>
  );
}