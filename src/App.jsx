import { useEffect, useMemo, useRef, useState } from "react";

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const emptyBoard = () => Array(9).fill(null);

const getWinner = (board) => {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const getStatus = (board, nextPlayer) => {
  const winner = getWinner(board);
  if (winner) {
    return `Winner: ${winner}`;
  }
  if (board.every(Boolean)) {
    return "Draw!";
  }
  return `Next player: ${nextPlayer}`;
};

const Square = ({ value, onClick, disabled, highlight, id, tabIndex, inputRef }) => (
  <button
    id={id}
    className={`square${highlight ? " highlight" : ""}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={value ? `Square ${value}` : "Empty square"}
    tabIndex={tabIndex}
    ref={inputRef}
  >
    {value}
  </button>
);

const defaultNames = { X: "Player 1", O: "Player 2" };

export default function App() {
  const [board, setBoard] = useState(emptyBoard);
  const [nextPlayer, setNextPlayer] = useState("X");
  const [isStarted, setIsStarted] = useState(false);
  const [players, setPlayers] = useState(defaultNames);
  const [nameInputs, setNameInputs] = useState({
    X: defaultNames.X,
    O: defaultNames.O,
  });
  const [isNameEditorOpen, setIsNameEditorOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const squareRefs = useRef([]);

  const winner = useMemo(() => getWinner(board), [board]);
  const isDraw = useMemo(() => board.every(Boolean) && !winner, [board, winner]);

  const winningLine = useMemo(() => {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return line;
      }
    }
    return null;
  }, [board]);

  const status = useMemo(() => {
    const displayNext = players[nextPlayer] || nextPlayer;
    return getStatus(board, displayNext);
  }, [board, nextPlayer, players]);

  const handleSquareClick = (index) => {
    if (board[index] || winner) return;
    const updatedBoard = [...board];
    updatedBoard[index] = nextPlayer;
    setBoard(updatedBoard);
    setNextPlayer((current) => (current === "X" ? "O" : "X"));
  };

  const handleReset = () => {
    setBoard(emptyBoard());
    setNextPlayer("X");
    setSelectedIndex(0);
  };

  const handleStartDefault = () => {
    setPlayers(defaultNames);
    setNameInputs(defaultNames);
    setIsStarted(true);
    setIsNameEditorOpen(false);
  };

  const handleStartWithNames = (event) => {
    event.preventDefault();
    const trimmed = {
      X: nameInputs.X.trim() || defaultNames.X,
      O: nameInputs.O.trim() || defaultNames.O,
    };
    setPlayers(trimmed);
    setIsStarted(true);
    setIsNameEditorOpen(false);
  };

  const handleEndGame = () => {
    setIsStarted(false);
    setBoard(emptyBoard());
    setNextPlayer("X");
    setIsNameEditorOpen(false);
    setSelectedIndex(0);
  };

  useEffect(() => {
    if (!isStarted) return;
    const target = squareRefs.current[selectedIndex];
    if (target) target.focus();
  }, [isStarted, selectedIndex, board]);

  const moveSelection = (delta) => {
    setSelectedIndex((current) => (current + delta + 9) % 9);
  };

  const handleBoardKeyDown = (event) => {
    if (!isStarted) return;
    const activeTag = document.activeElement?.tagName?.toLowerCase();
    if (activeTag === "input" || activeTag === "textarea") return;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        moveSelection(-3);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveSelection(3);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveSelection(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        moveSelection(1);
        break;
      case "Home":
        event.preventDefault();
        setSelectedIndex(0);
        break;
      case "End":
        event.preventDefault();
        setSelectedIndex(8);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleSquareClick(selectedIndex);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!isStarted) return;
    const onKeyDown = (event) => handleBoardKeyDown(event);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isStarted, selectedIndex, board, winner, nextPlayer]);

  return (
    <div className={`app${isStarted ? "" : " start-view"}`}>
      <header className="header">
        <h1>Tic-Tac-Toe</h1>
        <p>2 players on the same device</p>
      </header>

      {!isStarted ? (
        <div className="card">
          <h2>Start a new game</h2>
          <p>Quick start or customize player names.</p>
          <div className="start-actions">
            <button className="primary" onClick={handleStartDefault}>
              Start game
            </button>
            <button
              className="ghost"
              onClick={() => setIsNameEditorOpen((open) => !open)}
              aria-expanded={isNameEditorOpen}
              aria-controls="name-editor"
            >
              {isNameEditorOpen ? "Hide name options" : "Change names"}
            </button>
          </div>
          <div
            id="name-editor"
            className={`name-editor${isNameEditorOpen ? " open" : ""}`}
          >
            <form className="names-form" onSubmit={handleStartWithNames}>
              <label>
                Player X
                <input
                  type="text"
                  value={nameInputs.X}
                  onChange={(event) =>
                    setNameInputs((current) => ({
                      ...current,
                      X: event.target.value,
                    }))
                  }
                  placeholder="Player 1"
                  maxLength={20}
                />
              </label>
              <label>
                Player O
                <input
                  type="text"
                  value={nameInputs.O}
                  onChange={(event) =>
                    setNameInputs((current) => ({
                      ...current,
                      O: event.target.value,
                    }))
                  }
                  placeholder="Player 2"
                  maxLength={20}
                />
              </label>
              <button className="secondary" type="submit">
                Start with names
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="game">
          <div className="players">
            <span>
              X: <strong>{players.X}</strong>
            </span>
            <span>
              O: <strong>{players.O}</strong>
            </span>
          </div>
          <div className="status" role="status" aria-live="polite">
            {status}
          </div>
          <div
            className="board"
            role="grid"
            aria-label="Tic-Tac-Toe board"
            tabIndex={0}
            aria-activedescendant={`square-${selectedIndex}`}
          >
            {board.map((value, index) => (
              <Square
                key={index}
                value={value}
                onClick={() => handleSquareClick(index)}
                disabled={Boolean(value) || Boolean(winner)}
                highlight={winningLine?.includes(index)}
                id={`square-${index}`}
                tabIndex={selectedIndex === index ? 0 : -1}
                inputRef={(node) => {
                  squareRefs.current[index] = node;
                }}
              />
            ))}
          </div>
          <div className="game-actions">
            <button className="reset" onClick={handleReset}>
              {winner || isDraw ? "Play again" : "Restart"}
            </button>
            <button className="ghost" onClick={handleEndGame}>
              Exit to home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
