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

  // 👑 Message builder for overlay
  const getOverlayMessage = () => {
    if (showNextRoundMsg) {
      if (mode === "PvP") {
        return winner
          ? `🎉 Winner: ${winner}\nNext round starting...`
          : `🤝 It's a draw!\nNext round starting...`;
      } else {
        if (winner === "X") {
          switch (difficulty) {
            case "easy":
              return `😊 You beat Easy mode!\nNext round starting...`;
            case "medium":
              return `😐 Nice! You won Medium.\nNext round starting...`;
            case "hard":
              return `😈 Tough match! You won.\nNext round starting...`;
            case "boss":
              return `👑 You defeated the Boss!\nNext round starting...`;
            default:
              return `🔥 You win!\nNext round starting...`;
          }
        } else if (winner === "O") {
          return `💀 The AI won!\nNext round starting...`;
        } else {
          return `🤝 It's a draw!\nNext round starting...`;
        }
      }
    } else {
      return countdown === 0 ? "GO!" : countdown.toString();
    }
  };

  // 🧨 Trigger countdown after win/draw
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
      }, 2000);

      return () => clearTimeout(msgTimeout);
    }
  }, [winner, isDraw]);

  // ⏱️ Countdown + GO + Reset
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      const timeout = setTimeout(() => {
        resetGame();
        setCountdown(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 2000);

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

      {(showNextRoundMsg || countdown !== null) && (
        <div className="countdown-overlay">
          <div
            className={`countdown-number ${
              showNextRoundMsg ? "fade-slow" : "zoomFade"
            }`}
          >
            {getOverlayMessage().split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
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
