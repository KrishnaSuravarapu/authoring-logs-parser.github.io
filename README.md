# AI Authoring Logs Parser 🤖

A beautiful static web application for parsing and visualizing AI_AUTHORING logs from BrowserStack sessions.

## Features

- 📊 Parse AI_AUTHORING log entries from raw logs
- 🎨 Beautiful, responsive UI with gradient design
- 🖼️ Display and preview screenshots from log entries
- 📝 Show objectives, sub-objectives, actions, and timing information
- 🔍 Modal view for full-size image inspection
- 🌐 Fully static - no server required!

## Usage

### Option 1: Local Usage

Simply open `index.html` in your web browser!

### Option 2: GitHub Pages (Recommended for Teams)

1. Push this code to a GitHub repository
2. Go to Repository Settings → Pages
3. Select the branch to deploy (e.g., `main` or `master`)
4. Your app will be available at: `https://[username].github.io/[repo-name]/`

### How to Use

1. Open the application in your browser
2. Paste your raw logs into the text area
3. Click "Parse Logs" to visualize the AI_AUTHORING entries

## Log Format

The parser specifically handles `AI_AUTHORING` log entries with the format:
```
YYYY-MM-DD HH:MM:SS:MS AI_AUTHORING {JSON_DATA}
```

## Features Breakdown

- **Timestamp Display**: Shows when each action occurred
- **Status Indicators**: Visual badges for success/failure
- **Objectives**: Displays the main goal of the AI action
- **Sub-objectives**: Step-by-step breakdown of actions taken
- **Actions**: Detailed action information (clicks, typing, etc.)
- **Screenshots**: Embedded images with modal preview on click
- **Duration**: Timing information for each step

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **Hosting**: GitHub Pages (recommended)

## Project Structure

```
raw_logs_parser/
├── index.html         # Main HTML page
├── style.css          # Styling
├── script.js          # Log parsing logic
├── package.json       # Project metadata
└── README.md          # Documentation
```

## Screenshots

The application displays screenshots from AI Authoring sessions and allows you to click on them for a full-size view.
