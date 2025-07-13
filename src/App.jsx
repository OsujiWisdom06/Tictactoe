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

  const [round, setRound] = useState(1);
  const [roundsThisSession, setRoundsThisSession] = useState(1);

  const status = winner
    ? `🎉 Winner: ${winner}`
    : isDraw
    ? "🤝 It's a draw!"
    : `Next Player: ${xIsNext ? "X" : "O"}`;

  const getOverlayMessage = () => {
    if (showNextRoundMsg) {
      if (timeUp) return `⏰ Time's up!\nNew round starting...`;
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
      return countdown === 0 ? "GO!" : countdown?.toString();
    }
  };

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

  useEffect(() => {
    if (!timerActive || timeUp) return;

    if (gameTimeLeft <= 0) {
      setTimeUp(true);
      setTimerActive(false);
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
  }, [timerActive, gameTimeLeft, timeUp]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTimerActive(false);
      } else if (!timeUp && gameTimeLeft > 0) {
        setTimerActive(true);
        localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [timeUp, gameTimeLeft]);

  // Handle win/draw
  useEffect(() => {
    if ((winner || isDraw) && countdown === null && !showNextRoundMsg && !timeUp) {
      if (winner) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      setShowNextRoundMsg(true);
      const timeout = setTimeout(() => {
        setShowNextRoundMsg(false);
        setCountdown(3);
        setRoundsThisSession((prev) => prev + 1); // ✅ increase session count
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [winner, isDraw, timeUp]);

  // Handle time up
  useEffect(() => {
    if (timeUp) {
      setShowNextRoundMsg(true);
      const delay = setTimeout(() => {
        setShowNextRoundMsg(false);
        setCountdown(3);
      }, 1500);
      return () => clearTimeout(delay);
    }
  }, [timeUp]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      const timeout = setTimeout(() => {
        setCountdown(null);

        if (timeUp) {
          setGameTimeLeft(300);
          setTimeUp(false);
          setTimerActive(true);
          localStorage.removeItem(TIMER_KEY);
          localStorage.removeItem(TIMESTAMP_KEY);
          setRound((prev) => prev + 1); // ✅ main round increment here only
          setRoundsThisSession(1);
          resetScores(); // optional
        }

        resetGame();
      }, 1000);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, timeUp]);

  return (
    <div className={`game ${darkMode ? "dark" : ""}`}>
      <div className={`top-timer-bar ${gameTimeLeft <= 30 ? "warning" : ""}`}>
        ⏳ Time Left: {Math.floor(gameTimeLeft / 60).toString().padStart(2, "0")}:
        {(gameTimeLeft % 60).toString().padStart(2, "0")}
      </div>

      <InstallPrompt />
      <ThemeMode darkMode={darkMode} setDarkMode={setDarkMode} />
     <h1 className="game-title">TicTac War</h1>

<div className="round-ui">
  <div className="round-box">
    🏁 <strong>Round:</strong> {round}
  </div>
  <div className="round-box secondary">
    🎮 <strong>Games this round:</strong> {roundsThisSession}
  </div>
</div>

<div className={`mode-container ${darkMode ? "dark" : ""}`}>
  <div className="mode-group">
    <label>🎮 Mode:</label>
    <select value={mode} onChange={(e) => setMode(e.target.value)}>
      <option value="PvP">👥 Player vs Player</option>
      <option value="PvC">🤖 Player vs Computer</option>
    </select>
  </div>
  {mode === "PvC" && (
    <div className="mode-group">
      <label>🧠 Difficulty:</label>
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option value="easy">😊 Easy</option>
        <option value="medium">😐 Medium</option>
        <option value="hard">😈 Hard</option>
        <option value="boss">👑 Boss Level (AI)</option>
      </select>
    </div>
  )}
</div>

      <div className="status">{status}</div>

      {(showNextRoundMsg || countdown !== null) && (
        <div className="countdown-overlay">
          <div className={`countdown-number ${showNextRoundMsg ? "fade-slow" : "zoomFade"}`}>
            {getOverlayMessage().split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}

      <Board
        squares={current}
        onClick={(i) =>
          countdown === null && !showNextRoundMsg && !timeUp && handlePlay(i)
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
      </div>

      <div className="scoreboard">
  <h2>🏆 Scoreboard</h2>
  <div className="score-items">
    <div className="score-box x-score">
      <span>❌ X</span>
      <strong>{scores.X}</strong>
    </div>
    <div className="score-box o-score">
      <span>⭕ O</span>
      <strong>{scores.O}</strong>
    </div>
  </div>
</div>

    </div>
  );
}

export default App;
