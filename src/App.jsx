import { useEffect, useState } from 'react';
import './App.css';

function Square({ value, onClick, highlight }) {
  return (
    <button className={`square ${highlight ? 'highlight' : ''}`} onClick={onClick}>
      {value}
    </button>
  );
}

function Board({ squares, onClick, winningLine }) {
  return (
    <div>
      {[0, 3, 6].map((row) => (
        <div className="board-row" key={row}>
          {[0, 1, 2].map((col) => {
            const i = row + col;
            return (
              <Square
                key={i}
                value={squares[i]}
                onClick={() => onClick(i)}
                highlight={winningLine?.includes(i)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

function getRandomMove(squares) {
  const empty = squares
    .map((val, idx) => (val === null ? idx : null))
    .filter((v) => v !== null);
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

function App() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [mode, setMode] = useState(() => localStorage.getItem('ticTacToeMode') || 'PvP');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ticTacToeDark') === 'true');

  const current = history[step];
  const winnerInfo = calculateWinner(current);
  const winner = winnerInfo?.winner;
  const winningLine = winnerInfo?.line;
  const isDraw = !winner && current.every(val => val === 'X' || val === 'O');
  const currentPlayer = xIsNext ? 'X' : 'O';

  useEffect(() => {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) setScores(JSON.parse(savedScores));
  }, []);

  useEffect(() => {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem('ticTacToeMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('ticTacToeDark', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    resetGame();
  }, [mode]);

  useEffect(() => {
    if (mode === 'PvC' && !winner && !isDraw && !xIsNext) {
      const timer = setTimeout(() => {
        const move = getRandomMove(current);
        if (move !== null && move !== undefined) {
          handlePlay(move, true);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [step, xIsNext, mode, current, winner, isDraw]);

  useEffect(() => {
    if (mode === 'PvC' && !xIsNext && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const move = getRandomMove(current);
        if (move !== null && move !== undefined) {
          handlePlay(move, true);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handlePlay = (i, byAI = false) => {
    if (current[i] || winner || (mode === 'PvC' && !xIsNext && !byAI)) return;

    const next = current.slice();
    next[i] = currentPlayer;
    const newHistory = [...history.slice(0, step + 1), next];

    setHistory(newHistory);
    setStep(newHistory.length - 1);
    setXIsNext(!xIsNext);

    const result = calculateWinner(next);
    if (result) {
      setScores((prev) => ({
        ...prev,
        [result.winner]: prev[result.winner] + 1,
      }));
    }
  };

  const jumpTo = (move) => {
    setStep(move);
    setXIsNext(move % 2 === 0);
  };

  const resetGame = () => {
    setHistory([Array(9).fill(null)]);
    setStep(0);
    setXIsNext(true);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0 });
    localStorage.removeItem('ticTacToeScores');
  };

  const status = winner
    ? `🎉 Winner: ${winner}`
    : isDraw
    ? "🤝 It's a draw!"
    : `Next Player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className={`game ${darkMode ? 'dark' : ''}`}>
      <div className="dark-toggle">
        <label className="switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <h1>Tic Tac Toe</h1>

      <div className="mode-selector">
        <label>
          Mode:
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="PvP">👥 Player vs Player</option>
            <option value="PvC">🤖 Player vs Computer</option>
          </select>
        </label>
      </div>

      <div className="status">{status}</div>

      <Board squares={current} onClick={(i) => handlePlay(i)} winningLine={winningLine} />

      <div className="controls">
        <button onClick={resetGame}>Reset</button>
        <button onClick={() => step > 0 && jumpTo(step - 1)} disabled={step === 0}>
          Undo
        </button>
        <button
          onClick={() => step < history.length - 1 && jumpTo(step + 1)}
          disabled={step === history.length - 1}
        >
          Redo
        </button>
        <button onClick={resetScores}>Reset Score</button>
      </div>

      <div className="scoreboard">
        <p>Score</p>
        <p>X: {scores.X} | O: {scores.O}</p>
      </div>
    </div>
  );
}

export default App;