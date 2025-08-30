
# Shiritori Game

A two-player Shiritori word game built with React and Vite.

## Game Rules
- Two players play on the same screen.
- Each player starts with 100 points.
- Players take turns entering words.
- Each new word must start with the last letter of the previous word.
- Words must be valid English words (checked via DictionaryAPI).
- Words must be at least 4 letters long and cannot be repeated.
- Each turn lasts 15 seconds. If a player fails to enter a valid word in time, their score increases by 2 points and the turn swaps.
- If a player enters a wrong word, they can keep trying until time runs out.
- Score deduction for valid word: `word length + (15 - time remaining)`.
- The first player whose score reaches 0 or less wins; the other player losses.

## Features
- Turn-based gameplay with automatic turn swap.
- Word validation using DictionaryAPI.
- Separate word history for each player.
- Countdown timer for each turn.
- Score tracking and display.
- Start button to begin the game.

## Setup & Usage
1. **Install dependencies:**
	```bash
	npm install
	```
2. **Start the development server:**
	```bash
	npm run dev
	```
3. **Open your browser:**
	Visit `http://localhost:5173` (or the port shown in your terminal).

## Deployment
You can deploy this app to Netlify, Vercel, or any static hosting platform. Build with:
```bash
npm run build
```
The output will be in the `dist` folder.

## API Used
- [DictionaryAPI](https://dictionaryapi.dev/)

## Folder Structure
```
shiritori/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── ...
├── package.json
├── vite.config.js
└── README.md
```


Enjoy playing Shiritori!
