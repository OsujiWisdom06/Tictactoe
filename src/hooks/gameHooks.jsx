import { useState, useEffect } from "react";
import { calculateWinner, getEasyMove, getMediumMove, getHardMove, getBossMove } from "../utils/gameUtils";

export function useGameHook() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [mode, setMode] = useState(() => localStorage.getItem("ticTacToeMode") || "PvP");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("ticTacToeDark") === "true");
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem("ticTacToeDifficulty") || "easy");

  const current = history[step];
  const winnerInfo = calculateWinner(current);
  const winner = winnerInfo?.winner;
  const winningLine = winnerInfo?.line;
  const isDraw = !winner && current.every((val) => val === "X" || val === "O");
  const currentPlayer = xIsNext ? "X" : "O";

  useEffect(() => {
    const savedScores = localStorage.getItem("ticTacToeScores");
    if (savedScores) setScores(JSON.parse(savedScores));
  }, []);

  useEffect(() => {
    localStorage.setItem("ticTacToeScores", JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem("ticTacToeMode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("ticTacToeDifficulty", difficulty);
  }, [difficulty]);

  useEffect(() => {
    resetGame();
  }, [mode, difficulty]);

  useEffect(() => {
    if (mode === "PvC" && !winner && !isDraw && !xIsNext) {
      const timer = setTimeout(async () => {
        let move;
        switch (difficulty) {
          case "easy":
            move = getEasyMove(current);
            break;
          case "medium":
            move = getMediumMove(current);
            break;
          case "hard":
            move = getHardMove(current);
            break;
          case "boss":
            move = await getBossMove(current);
            break;
          default:
            move = getEasyMove(current);
        }
        
        if (move !== null && move !== undefined) {
          handlePlay(move, true);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [step, xIsNext, mode, difficulty, current, winner, isDraw]);

  const handlePlay = (i, byAI = false) => {
    if (current[i] || winner || (mode === "PvC" && !xIsNext && !byAI)) return;

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
    localStorage.removeItem("ticTacToeScores");
  };

  return {
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
  };
}