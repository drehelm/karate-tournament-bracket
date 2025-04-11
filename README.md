# Karate Tournament Bracket Generator

A simple web application for generating printable karate tournament brackets with support for byes. This tool creates clean, visual bracket templates that can be printed and filled in manually.

## 🚀 Features

- Generate tournament brackets based solely on the number of competitors
- Automatic calculation of byes when the number of competitors is not a power of 2
- Clear visual representation of brackets with blank spaces for competitor names
- Support for different paper sizes (Letter, A4)
- Portrait and landscape orientation options
- Export to PDF functionality
- Print-optimized layout

## 🛠️ Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/drehelm/karate-tournament-bracket.git
   cd karate-tournament-bracket
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run start
   ```

## 💻 Usage

1. **Enter the number of competitors**: Input the total number of competitors (between 2 and 64).
2. **Generate the bracket**: Click the "Generate Bracket" button to create the bracket.
3. **Print or export**: Use the Print button to print directly or Export PDF to save a PDF file.
4. **Customize print settings**: Adjust paper size and orientation through the Print Settings dialog.
5. **Fill in manually**: Write competitors' names and match results by hand on the printed bracket.

## 📋 Print Settings

- **Paper Size**: Choose between Letter (8.5" x 11") or A4 (8.3" x 11.7")
- **Orientation**: Select Portrait or Landscape (Landscape recommended for larger tournaments)
- **Export to PDF**: Creates a high-quality PDF that can be saved and printed later

## 🧩 Technology Stack

- **Framework**: React (with React Scripts)
- **Styling**: Tailwind CSS v3
- **PDF Export**: jsPDF and html2canvas
- **Deployment**: GitHub Pages (https://drehelm.github.io/karate-tournament-bracket/)

## 📜 Scripts Overview

- `npm run start`: Start the development server
- `npm run build`: Build the production version
- `npm run build:css`: Build Tailwind styles
- `npm run deploy`: Deploy to GitHub Pages

## 🤝 Contribution Guidelines

- Fork the repository
- Create a feature branch
- Submit a pull request

---
**Maintainer:** drehelm
**Maintainer:** herrkutt