export function calculateWinner(squares) {
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

export function getRandomMove(squares) {
    const empty = squares
      .map((val, idx) => (val === null ? idx : null))
      .filter((v) => v !== null);
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
}

// Easy mode: Makes completely random moves
export function getEasyMove(squares) {
    return getRandomMove(squares);
}

// Medium mode: Has a 50% chance to make a smart move
export function getMediumMove(squares) {
    if (Math.random() < 0.5) {
        return getSmartMove(squares);
    }
    return getRandomMove(squares);
}

// Hard mode: Always makes smart moves
export function getHardMove(squares) {
    return getSmartMove(squares);
}

// Smart move implementation using minimax algorithm
function getSmartMove(squares) {
    const emptySquares = squares
        .map((value, index) => (value === null ? index : null))
        .filter((v) => v !== null);

    // Check for winning move
    for (const square of emptySquares) {
        const testSquares = squares.slice();
        testSquares[square] = 'O';
        if (calculateWinner(testSquares)) {
            return square;
        }
    }

    // Check for blocking move
    for (const square of emptySquares) {
        const testSquares = squares.slice();
        testSquares[square] = 'X';
        if (calculateWinner(testSquares)) {
            return square;
        }
    }

    // Take center if available
    if (squares[4] === null) {
        return 4;
    }

    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => squares[corner] === null);
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Take edges
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(edge => squares[edge] === null);
    if (availableEdges.length > 0) {
        return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }

    return getRandomMove(squares);
}


import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')

// Boss level: Uses Gemini AI for moves
export async function getBossMove(squares) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    try{
         const prompt = `Given this Tic-tac-toe board state where 'X' is the player and 'O' is the AI, suggest the best move for 'O'. 
                        Board state: ${JSON.stringify(squares)}. Try to make the best possible move for 'O' to win or block 'X'.
                        Make sure 'X' does not win in the next move.
                        Make it impossible for 'X' to win. and make 'O' win at all cost.
                        Return only {move: the index number (0-8) of the best move, win: if x will win or O will win the next move}.`
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        console.log(text)
        const move = typeof text.move == "number" ? parseInt(text.move.trim()) : text.move;
        // Validate the move
            //  console.log(move)
        if (move >= 0 && move <= 8 && squares[move] === null) {
            return move;
        }
        
        // Fallback to hard mode if AI response is invalid
        return getHardMove(squares);
    } catch(err) {
          console.error('Error getting boss move:', err);
        // Fallback to hard mode if API call fails
        return getHardMove(squares);
    }
}
// export async function getBossMove(squares) {
//     try {
//         const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${import.meta.env.VITE_GEMINI_API_KEY}`
//             },
//             body: JSON.stringify({
//                 contents: [{
//                     parts: [{
//                         text: `Given this Tic-tac-toe board state where 'X' is the player and 'O' is the AI, suggest the best move for 'O'. 
//                         Board state: ${JSON.stringify(squares)}. 
//                         Return only the index number (0-8) of the best move.`
//                     }]
//                 }]
//             })
//         });

//         const data = await response.json();
//         const move = parseInt(data.candidates[0].content.parts[0].text);
        
//         // Validate the move
//         if (move >= 0 && move <= 8 && squares[move] === null) {
//             return move;
//         }
        
//         // Fallback to hard mode if AI response is invalid
//         return getHardMove(squares);
//     } catch (error) {
//         console.error('Error getting boss move:', error);
//         // Fallback to hard mode if API call fails
//         return getHardMove(squares);
//     }
// }