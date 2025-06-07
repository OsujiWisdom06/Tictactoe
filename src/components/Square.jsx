/* eslint-disable react/prop-types */

export default function Square({ value, onClick, highlight }) {
    return (
      <button className={`square ${highlight ? 'highlight' : ''}`} onClick={onClick}>
        {value}
      </button>
    );
}