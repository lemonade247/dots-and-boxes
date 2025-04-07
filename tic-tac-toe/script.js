const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const status = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const winningBanner = document.getElementById('winningBanner');
const overlay = document.getElementById('overlay');
const winnerMessage = document.getElementById('winnerMessage');
const playAgainButton = document.getElementById('playAgainButton');
let isXTurn = true;
let gameActive = true;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function handleCellClick(e) {
    const cell = e.target;
    const currentClass = isXTurn ? 'x' : 'o';

    if (!gameActive || cell.textContent !== '') return;

    placeMark(cell, currentClass);
    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        updateStatus();
    }
}

function placeMark(cell, currentClass) {
    cell.textContent = currentClass.toUpperCase();
    cell.classList.add(currentClass);
}

function swapTurns() {
    isXTurn = !isXTurn;
}

function updateStatus() {
    status.textContent = `Player ${isXTurn ? 'X' : 'O'}'s turn`;
}

function checkWin(currentClass) {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(currentClass);
        });
    });
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.textContent !== '';
    });
}

function endGame(draw) {
    gameActive = false;
    if (draw) {
        status.textContent = 'Game ended in a draw!';
        showWinningBanner('Game ended in a draw!');
    } else {
        const winner = isXTurn ? 'X' : 'O';
        status.textContent = `Player ${winner} wins!`;
        showWinningBanner(`Player ${winner} wins! 🎉`);
    }
}

function showWinningBanner(message) {
    winnerMessage.textContent = message;
    winningBanner.style.display = 'block';
    overlay.style.display = 'block';
}

function hideWinningBanner() {
    winningBanner.style.display = 'none';
    overlay.style.display = 'none';
}

function restartGame() {
    isXTurn = true;
    gameActive = true;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    updateStatus();
    hideWinningBanner();
}

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', restartGame);
playAgainButton.addEventListener('click', restartGame); 