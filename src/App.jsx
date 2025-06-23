import "./App.css";
import InstallPrompt from "./components/InstallPrompt";
import Board from "./components/Board";
import ThemeMode from "./components/ThemeMode";
import { useGameHook } from "./hooks/gameHooks";
import { useEffect, useState } from "react";

function App() {
  const {
    history,
    step,
    xIsNext,
    scores,
    mode,
    difficulty,
    darkMode,
    current,
    winner,
    winningLine,
    isDraw,
    setMode,
    setDifficulty,
    setDarkMode,
    handlePlay,
    jumpTo,
    resetGame,
    resetScores,
  } = useGameHook();

  const [showNextRoundMsg, setShowNextRoundMsg] = useState(false);

  const status = winner
    ? `🎉 Winner: ${winner}`
    : isDraw
    ? "🤝 It's a draw!"
    : `Next Player: ${xIsNext ? "X" : "O"}`;

  // Auto-reset game after win/draw with message
  useEffect(() => {
    if (winner || isDraw) {
      setShowNextRoundMsg(true);

      const timeout = setTimeout(() => {
        setShowNextRoundMsg(false);
        resetGame();
      }, 2000); // 2 seconds

      return () => clearTimeout(timeout);
    }
  }, [winner, isDraw, resetGame]);

  return (
    <div className={`game ${darkMode ? "dark" : ""}`}>
      <InstallPrompt />
      <ThemeMode darkMode={darkMode} setDarkMode={setDarkMode} />

      <h1>TicTac War</h1>

      <div className={`mode-selector ${darkMode ? "dark" : ""}`}>
        <label>
          Mode:
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="PvP">👥 Player vs Player</option>
            <option value="PvC">🤖 Player vs Computer</option>
          </select>
        </label>
        {mode === "PvC" && (
          <label style={{ marginLeft: "15px" }}>
            Difficulty:
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">😊 Easy</option>
              <option value="medium">😐 Medium</option>
              <option value="hard">😈 Hard</option>
              <option value="boss">👑 Boss Level(AI)</option>
            </select>
          </label>
        )}
      </div>

      <div className="status">{status}</div>

      {showNextRoundMsg && (
        <div className="next-round-msg">⏳ Next round starting...</div>
      )}

      <Board
        squares={current}
        onClick={(i) => handlePlay(i)}
        winningLine={winningLine}
      />

      <div className={`controls ${darkMode ? "dark" : ""}`}>
        <button onClick={resetGame} disabled={step === 0}>
          Reset
        </button>
        <button
          onClick={resetScores}
          disabled={scores.X === 0 && scores.O === 0}
        >
          Reset Score
        </button>
      </div>

      <div className="scoreboard">
        <p>Score</p>
        <p>
          X: {scores.X} | O: {scores.O}
        </p>
      </div>
    </div>
  );
}

export default App;
