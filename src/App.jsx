import "./App.css";
import InstallPrompt from "./components/InstallPrompt";
import Board from "./components/Board";
import ThemeMode from "./components/ThemeMode";
import { useGameHook } from "./hooks/gameHooks";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

const TIMER_KEY = "tic_tac_timer";
const TIMESTAMP_KEY = "tic_tac_timestamp";

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
  const [gameTimeLeft, setGameTimeLeft] = useState(300); // 5 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const status = winner
    ? `🎉 Winner: ${winner}`
    : isDraw
    ? "🤝 It's a draw!"
    : `Next Player: ${xIsNext ? "X" : "O"}`;

  const getOverlayMessage = () => {
    if (showNextRoundMsg) {
      return `⏰ Time's up!\nNext round starting...`;
    } else {
      return countdown === 0 ? "GO!" : countdown.toString();
    }
  };

  // Load saved timer
  useEffect(() => {
    const savedTime = localStorage.getItem(TIMER_KEY);
    const savedTimestamp = localStorage.getItem(TIMESTAMP_KEY);

    if (savedTime && savedTimestamp) {
      const timePassed = Math.floor((Date.now() - Number(savedTimestamp)) / 1000);
      const timeLeft = Math.max(Number(savedTime) - timePassed, 0);
      setGameTimeLeft(timeLeft);
      setTimerActive(timeLeft > 0);
      setTimeUp(timeLeft <= 0);
    } else {
      setGameTimeLeft(300);
      setTimerActive(true);
    }
  }, []);

  // Timer countdown (respects pause)
  useEffect(() => {
    if (!timerActive || timeUp || isPaused) return;

    if (gameTimeLeft <= 0) {
      setTimeUp(true);
      setTimerActive(false);
      setShowNextRoundMsg(true);
      setCountdown(3);
    }

    const interval = setInterval(() => {
      setGameTimeLeft((prev) => {
        const next = prev - 1;
        localStorage.setItem(TIMER_KEY, next.toString());
        localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, gameTimeLeft, timeUp, isPaused]);

  // Pause/resume on visibility
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTimerActive(false);
      } else if (!timeUp && gameTimeLeft > 0 && !isPaused) {
        setTimerActive(true);
        localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [timeUp, gameTimeLeft, isPaused]);

  // Confetti on win (optional)
  useEffect(() => {
    if (winner && (mode === "PvP" || (mode === "PvC" && winner === "X"))) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [winner]);

  // Countdown after time up
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      const timeout = setTimeout(() => {
        resetGame();
        resetScores();
        setCountdown(null);
        setShowNextRoundMsg(false);
        setTimeUp(false);
        setTimerActive(true);
        setGameTimeLeft(300);
        localStorage.removeItem(TIMER_KEY);
        localStorage.removeItem(TIMESTAMP_KEY);
      }, 2000);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  return (
    <div className={`game ${darkMode ? "dark" : ""}`}>
      <div className={`top-timer-bar ${gameTimeLeft <= 30 ? "warning" : ""}`}>
        ⏳ Time Left: {Math.floor(gameTimeLeft / 60).toString().padStart(2, "0")}:
        {(gameTimeLeft % 60).toString().padStart(2, "0")}
      </div>

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
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
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
              countdown !== null ? "zoomFade" : "fade-slow"
            }`}
          >
            {getOverlayMessage().split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {isPaused && !timeUp && (
        <div className="pause-overlay">
          <div className="pause-text">⏸ Paused</div>
        </div>
      )}

      <Board
        squares={current}
        onClick={(i) =>
          countdown === null && !showNextRoundMsg && !timeUp && !isPaused && handlePlay(i)
        }
        winningLine={winningLine}
      />

      <div className={`controls ${darkMode ? "dark" : ""}`}>
        <button onClick={resetGame} disabled={step === 0 || countdown !== null || showNextRoundMsg || timeUp}>
          Reset
        </button>
        <button
          onClick={resetScores}
          disabled={(scores.X === 0 && scores.O === 0) || countdown !== null || showNextRoundMsg || timeUp}
        >
          Reset Score
        </button>
        <button
          onClick={() => setIsPaused((prev) => !prev)}
          disabled={countdown !== null || showNextRoundMsg || timeUp}
        >
          {isPaused ? "▶️ Resume Timer" : "⏸ Pause Timer"}
        </button>
      </div>

      <div className="scoreboard">
        <p>Score</p>
        <p>X: {scores.X} | O: {scores.O}</p>
      </div>
    </div>
  );
}

export default App;
