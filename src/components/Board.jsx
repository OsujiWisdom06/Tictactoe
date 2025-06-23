/* eslint-disable react/prop-types */
import Square from "./Square";

export default function Board({ squares, onClick, winningLine }) {
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