import "./App.css";
import InstallPrompt from "./components/InstallPrompt";
import Board from "./components/Board";
import ThemeMode from "./components/ThemeMode";
import { useGameHook } from "./hooks/gameHooks";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

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

  const [countdown, setCountdown] = useState(null);
  const [showNextRoundMsg, setShowNextRoundMsg] = useState(false);

  const status = winner
    ? `🎉 Winner: ${winner}`
    : isDraw
    ? "🤝 It's a draw!"
    : `Next Player: ${xIsNext ? "X" : "O"}`;

  // Show "Next round starting..." message before countdown
  useEffect(() => {
    if ((winner || isDraw) && countdown === null && !showNextRoundMsg) {
      if (winner) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      setShowNextRoundMsg(true);

      const msgTimeout = setTimeout(() => {
        setShowNextRoundMsg(false);
        setCountdown(3);
      }, 1500); // Show message for 1.5 seconds

      return () => clearTimeout(msgTimeout);
    }
  }, [winner, isDraw]);

  // Countdown logic with "GO!" and reset
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      const timeout = setTimeout(() => {
        resetGame();
        setCountdown(null);
      }, 1000); // Show "GO!" for 1 second
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

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

      {/* Countdown Overlay */}
      {(showNextRoundMsg || countdown !== null) && (
        <div className="countdown-overlay">
          <div
            className={`countdown-number ${
              showNextRoundMsg ? "fade-slow" : "zoomFade"
            }`}
          >
            {showNextRoundMsg
              ? "Next round starting..."
              : countdown === 0
              ? "GO!"
              : countdown}
          </div>
        </div>
      )}

      <Board
        squares={current}
        onClick={(i) =>
          countdown === null && !showNextRoundMsg && handlePlay(i)
        }
        winningLine={winningLine}
      />

      <div className={`controls ${darkMode ? "dark" : ""}`}>
        <button
          onClick={resetGame}
          disabled={step === 0 || countdown !== null || showNextRoundMsg}
        >
          Reset
        </button>
        <button
          onClick={resetScores}
          disabled={
            (scores.X === 0 && scores.O === 0) ||
            countdown !== null ||
            showNextRoundMsg
          }
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
