// deploy.js - Helper script to prepare files for GitHub Pages

// Copy bracket.js, mermaid.js and index-bracket.html to docs/ folder
// Rename index-bracket.html to index.html for GitHub Pages

const fs = require('fs');
const path = require('path');

// Create docs directory if it doesn't exist
if (!fs.existsSync('docs')) {
  fs.mkdirSync('docs');
  console.log('Created docs directory');
}

// Copy files to docs directory
function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
  console.log(`Copied ${source} to ${destination}`);
}

// Copy each file
copyFile('bracket.js', 'docs/bracket.js');
copyFile('mermaid.js', 'docs/mermaid.js');
copyFile('index-bracket.html', 'docs/index.html');

console.log('Files prepared for GitHub Pages deployment');
console.log('Next steps:');
console.log('1. git add docs/');
console.log('2. git commit -m "Prepare GitHub Pages deployment"');
console.log('3. git push');
console.log('4. Go to your repository settings, GitHub Pages section, and set the source to the "docs" folder in the main branch');