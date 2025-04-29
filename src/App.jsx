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
  
  return (
    <div className="bracket-wrapper">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-bold">Single Elimination Tournament</h2>
        <p className="text-sm text-gray-600 print:text-gray-800">
          {competitorCount} Competitors • {totalSlots - competitorCount} Byes • {rounds} Rounds
        </p>
      </div>
      
      {/* Tournament bracket with proper spacing and alignment */}
      <div className="tournament-bracket-container">
        <style jsx>{`
          .tournament-bracket-container {
            display: flex;
            flex-direction: column;
            align-items: stretch;
          }
          
          .bracket-rounds {
            display: flex;
            flex-direction: row;
            justify-content: center;
            flex: 1;
            overflow-x: auto;
            padding-bottom: 20px;
          }
          
          .round-column {
            display: flex;
            flex-direction: column;
            min-width: 200px;
            flex-shrink: 0;
            position: relative;
            margin: 0 10px;
          }
          
          .round-title {
            text-align: center;
            font-weight: 600;
            margin-bottom: 20px;
            padding: 10px;
            background-color: #2d3748;
            color: white;
            border-radius: 4px;
          }
          
          .match-container {
            display: flex;
            flex-direction: column;
            flex: 1;
            position: relative;
          }
          
          .match-box {
            border: 1px solid #cbd5e0;
            border-radius: 4px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
            margin-bottom: 2px;
            width: 180px;
          }
          
          .competitor {
            padding: 8px 10px;
            height: 40px;
            display: flex;
            align-items: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .competitor-top {
            border-bottom: 1px solid #e2e8f0;
          }
          
          .match-wrapper {
            position: relative;
          }
          
          .connector {
            position: absolute;
            background-color: #888;
          }
          
          .connector-horizontal {
            height: 2px;
            z-index: 1;
          }
          
          .connector-vertical {
            width: 2px;
            z-index: 1;
          }
          
          @media (max-width: 640px) {
            .round-column {
              min-width: 160px;
            }
            
            .match-box {
              width: 150px;
            }
            
            .competitor {
              font-size: 12px;
              padding: 6px 8px;
              height: 32px;
            }
          }
        `}</style>
        
        <div className="bracket-rounds">
          {/* Render each round */}
          {Array.from({ length: rounds }, (_, roundIndex) => {
            const matchesInRound = totalSlots / Math.pow(2, roundIndex + 1);
            
            // Calculate spacing factor that doubles with each round
            // This ensures proper vertical alignment between rounds
            const spacingFactor = Math.pow(2, roundIndex);
            
            return (
              <div className="round-column" key={`round-${roundIndex}`}>
                <div className="round-title">
                  {roundIndex === 0 ? "First Round" : 
                   roundIndex === rounds - 1 ? "Final" : 
                   `Round ${roundIndex + 1}`}
                </div>
                
                <div className="match-container">
                  {/* Render matches for this round */}
                  {Array.from({ length: matchesInRound }, (_, matchIndex) => {
                    // For first round, check if match has a bye
                    const hasBye = roundIndex === 0 && matches[matchIndex]?.hasBye;
                    
                    // Calculate vertical position with exponential spacing
                    const baseSpacing = 80; // Base unit of spacing
                    
                    // Calculate position to align with "parent" matches
                    // This ensures boxes in each round align with their source matches
                    let matchPosition;
                    
                    if (roundIndex === 0) {
                      // First round has regular spacing
                      matchPosition = matchIndex * baseSpacing;
                    } else {
                      // Later rounds have exponentially increasing spacing
                      matchPosition = matchIndex * baseSpacing * spacingFactor;
                    }
                    
                    // Calculate connector positions
                    const hasNextRound = roundIndex < rounds - 1;
                    const hasPrevRound = roundIndex > 0;
                    
                    // For matches other than first round,
                    // calculate "parent" match indices from previous round
                    const prevRoundMatchIndex1 = matchIndex * 2;
                    const prevRoundMatchIndex2 = matchIndex * 2 + 1;
                    
                    return (
                      <div 
                        className="match-wrapper" 
                        key={`match-${roundIndex}-${matchIndex}`}
                        style={{
                          position: 'absolute',
                          top: `${matchPosition}px`,
                          left: 0
                        }}
                      >
                        <div className="match-box">
                          <div className="competitor competitor-top">
                            {hasBye ? "BYE" : "_________________"}
                          </div>
                          <div className="competitor">
                            {"_________________"}
                          </div>
                        </div>
                        
                        {/* Horizontal connector to next round */}
                        {hasNextRound && (
                          <div 
                            className="connector connector-horizontal"
                            style={{
                              right: -10,
                              left: 180,
                              top: 40,
                              width: 20
                            }}
                          />
                        )}
                        
                        {/* Vertical connector to match below (if not last in pair) */}
                        {hasNextRound && matchIndex % 2 === 0 && (
                          <div 
                            className="connector connector-vertical"
                            style={{
                              top: 40,
                              left: 200,
                              height: baseSpacing * spacingFactor
                            }}
                          />
                        )}
                        
                        {/* Horizontal connector from previous round */}
                        {hasPrevRound && (
                          <div 
                            className="connector connector-horizontal"
                            style={{
                              left: -20,
                              width: 20,
                              top: 40
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 print:mt-8">
        <p className="text-xs text-gray-500 print:text-gray-700">
          Tournament Director: ______________________ Date: ____________
        </p>
      </div>
    </div>
  );
}