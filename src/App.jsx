
import React, { useState, useEffect, useRef } from 'react';

const INITIAL_SCORE = 100;
const TURN_TIME = 15;
function App() {

  const [players, setPlayers] = useState([
    { name: 'Player 1', score: INITIAL_SCORE, words: [] },
    { name: 'Player 2', score: INITIAL_SCORE, words: [] },
  ]);
  const [currentTurn, setCurrentTurn] = useState(0); // 0 or 1
  const [wordInput, setWordInput] = useState('');
  const [lastWord, setLastWord] = useState('');
  const [timer, setTimer] = useState(TURN_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [checking, setChecking] = useState(false);
  const timerRef = useRef();
  const inputRefs = [useRef(), useRef()];

  // Swap turn and reset timer
  const swapTurn = React.useCallback(() => {
    setCurrentTurn(prev => (prev === 0 ? 1 : 0));
    setTimer(TURN_TIME);
  }, []);

  // Handle timeout
  const handleTimeout = React.useCallback(() => {
    setMessage('Time up! +2 points added.');
    setPlayers(prev => prev.map((p, idx) =>
      idx === currentTurn
        ? { ...p, score: p.score + 2 }
        : p
    ));
    setWordInput('');
    swapTurn();
  }, [currentTurn, swapTurn]);

  // Timer logic
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    if (timer === 0) {
      handleTimeout();
      // Focus next player's input
      setTimeout(() => {
        if (inputRefs[(currentTurn + 1) % 2].current) {
          inputRefs[(currentTurn + 1) % 2].current.focus();
        }
      }, 100);
      return;
    }
    timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timer, gameOver, handleTimeout, gameStarted, currentTurn]);

  // Check for game over
  useEffect(() => {
    if (players[0].score <= 0 || players[1].score <= 0) {
      setGameOver(true);
    }
  }, [players]);

  // Handle word submission
  async function handleSubmit(e) {
    e.preventDefault();
    if (gameOver || !gameStarted) return;
    const word = wordInput.trim().toLowerCase();
    setMessage('');

    // Gather all words from both players for repetition check
    const allWords = [...players[0].words, ...players[1].words];

    // Validation
    if (word.length < 4) {
      setMessage('Word must be at least 4 letters.');
      return;
    }
    if (allWords.includes(word)) {
      setMessage('Word already used.');
      return;
    }
    if (lastWord && word[0] !== lastWord[lastWord.length - 1]) {
      setMessage(`Word must start with '${lastWord[lastWord.length - 1]}'.`);
      return;
    }

    // Dictionary API validation
    setChecking(true);
    setMessage('Checking word...');
    const valid = await validateWord(word);
    setChecking(false);
    if (!valid) {
      setMessage('Not a valid English word. Try again!');
      updateScoreOnError();
      // Do NOT swap turn, allow retry until timer ends
      return;
    }

    setMessage('');
    // Valid word: update state
    setPlayers(prev => prev.map((p, idx) =>
      idx === currentTurn
        ? { ...p, words: [...p.words, word], score: p.score - (word.length + (TURN_TIME - timer)) }
        : p
    ));
    setLastWord(word);
    setWordInput('');
    swapTurn();
    // Focus next player's input
    setTimeout(() => {
      if (inputRefs[(currentTurn + 1) % 2].current) {
        inputRefs[(currentTurn + 1) % 2].current.focus();
      }
    }, 100);
  }

  // Validate word using DictionaryAPI
  async function validateWord(word) {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!res.ok) return false;
      const data = await res.json();
      return Array.isArray(data) && data.length > 0;
    } catch {
      return false;
    }
  }

  // Update score for valid word (now handled in handleSubmit)

  // Update score for error
  function updateScoreOnError() {
    setPlayers(prev => prev.map((p, idx) =>
      idx === currentTurn
        ? { ...p, score: p.score - 1 }
        : p
    ));
  }

  // ...existing code...

  // Restart game
  function restartGame() {
    setPlayers([
      { name: 'Player 1', score: INITIAL_SCORE, words: [] },
      { name: 'Player 2', score: INITIAL_SCORE, words: [] },
    ]);
    setCurrentTurn(0);
    setWordInput('');
    setLastWord('');
    setTimer(TURN_TIME);
    setGameOver(false);
    setMessage('');
    setGameStarted(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <h1 className="text-3xl font-bold mb-8 text-white">Shiritori Game</h1>
      {!gameStarted && !gameOver && (
        <button
          className="mb-6 bg-blue-500 text-white px-6 py-3 rounded text-lg font-semibold"
          onClick={() => {
            setGameStarted(true);
            setTimer(TURN_TIME);
            setTimeout(() => {
              if (inputRefs[currentTurn].current) inputRefs[currentTurn].current.focus();
            }, 100);
          }}
        >Start Game</button>
      )}
      <div className="flex gap-8 mb-4">
        {players.map((p, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center p-6 rounded-lg shadow-lg w-72 min-h-[400px] bg-gray-800 ${currentTurn === idx ? 'ring-4 ring-blue-400' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-8 h-8 bg-gray-700 rounded-full" />
              <span className="font-semibold text-white text-lg">{p.name}</span>
            </div>
            <div className="text-3xl text-white mb-2">{p.score}</div>
            {gameOver && p.score <= 0 && <div className="text-red-400 font-bold">Win</div>}
            {currentTurn === idx && !gameOver && gameStarted && (
              <form onSubmit={handleSubmit} className="w-full flex gap-2 mb-4">
                <input
                  type="text"
                  ref={inputRefs[idx]}
                  className="border border-gray-600 bg-gray-900 text-white p-2 rounded w-full"
                  value={wordInput}
                  onChange={e => setWordInput(e.target.value)}
                  disabled={gameOver || !gameStarted}
                  placeholder={lastWord ? `Start with '${lastWord[lastWord.length - 1]}'` : 'Enter first word'}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  disabled={gameOver || wordInput.length < 4 || !gameStarted}
                >↵</button>
              </form>
            )}
            <div className="w-full">
              <div className="font-semibold text-gray-300 mb-1">History:</div>
              <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '240px', minHeight: '240px' }}>
                {p.words.map((w, widx) => (
                  <div key={widx} className="bg-gray-700 text-gray-200 px-3 py-2 rounded flex justify-between items-center">
                    <span>{w}</span>
                    <span className="text-xs text-blue-300">{w.length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-8 mb-4">
        <div className="text-white">Current Turn: <span className="font-bold">{players[currentTurn].name}</span></div>
        <div className="text-white">Timer: <span className="font-bold">{timer}s</span></div>
      </div>
      {checking && <div className="mb-2 text-red-400 text-lg font-semibold">Checking word...</div>}
      {!checking && message && <div className="mb-2 text-red-400 text-lg font-semibold">{message}</div>}
      {gameOver && (
        <div className="mt-4 text-xl font-bold text-red-400">
          Game Over! {players[0].score <= 0 ? players[0].name : players[1].name} Wins!
          <button className="ml-4 bg-green-500 text-white px-4 py-2 rounded" onClick={restartGame}>Restart</button>
        </div>
      )}
    </div>
  );
}

export default App
