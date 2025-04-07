class DotsAndBoxes {
    constructor(canvasId, size = 4) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.size = size;
        this.dotRadius = 4;
        this.lineWidth = 2;
        this.boxSize = 60;
        this.margin = 40;
        this.currentPlayer = 1;
        this.player1Score = 0;
        this.player2Score = 0;
        this.lines = new Set();
        this.boxes = new Array((size - 1) * (size - 1)).fill(0);
        this.isGameOver = false;

        // Initialize canvas size
        this.canvas.width = (size - 1) * this.boxSize + 2 * this.margin;
        this.canvas.height = (size - 1) * this.boxSize + 2 * this.margin;

        // Mouse event handling
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.hoveredLine = null;

        this.draw();
    }

    getLineKey(x1, y1, x2, y2) {
        return `${Math.min(x1, x2)},${Math.min(y1, y2)}-${Math.max(x1, x2)},${Math.max(y1, y2)}`;
    }

    isValidLine(x1, y1, x2, y2) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    getNearestPoints(x, y) {
        const points = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const px = j * this.boxSize + this.margin;
                const py = i * this.boxSize + this.margin;
                const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
                points.push({ x: j, y: i, distance });
            }
        }
        points.sort((a, b) => a.distance - b.distance);
        return [points[0], points[1]];
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const [p1, p2] = this.getNearestPoints(x, y);
        
        if (this.isValidLine(p1.x, p1.y, p2.x, p2.y)) {
            this.hoveredLine = { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
        } else {
            this.hoveredLine = null;
        }
        
        this.draw();
    }

    handleClick() {
        if (this.isGameOver || !this.hoveredLine) return;

        const { x1, y1, x2, y2 } = this.hoveredLine;
        const lineKey = this.getLineKey(x1, y1, x2, y2);

        if (!this.lines.has(lineKey)) {
            this.lines.add(lineKey);
            const boxesCompleted = this.checkBoxes(x1, y1, x2, y2);
            
            if (!boxesCompleted) {
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            }

            this.updateScores();
            this.updateTurnIndicator();
            this.checkGameOver();
            this.draw();
        }
    }

    checkBoxes(x1, y1, x2, y2) {
        let boxesCompleted = false;

        // Check all possible boxes that could be completed by this line
        const directions = [
            { dx: 0, dy: -1 }, // Check box above
            { dx: 0, dy: 1 },  // Check box below
            { dx: -1, dy: 0 }, // Check box to the left
            { dx: 1, dy: 0 }   // Check box to the right
        ];

        for (const { dx, dy } of directions) {
            const boxX = Math.min(x1, x2) + (dx < 0 ? dx : 0);
            const boxY = Math.min(y1, y2) + (dy < 0 ? dy : 0);

            if (boxX >= 0 && boxX < this.size - 1 && 
                boxY >= 0 && boxY < this.size - 1) {
                if (this.isBoxComplete(boxX, boxY)) {
                    const boxIndex = boxY * (this.size - 1) + boxX;
                    if (this.boxes[boxIndex] === 0) {
                        this.boxes[boxIndex] = this.currentPlayer;
                        boxesCompleted = true;
                        if (this.currentPlayer === 1) {
                            this.player1Score++;
                        } else {
                            this.player2Score++;
                        }
                    }
                }
            }
        }

        return boxesCompleted;
    }

    isBoxComplete(x, y) {
        const top = this.lines.has(this.getLineKey(x, y, x + 1, y));
        const right = this.lines.has(this.getLineKey(x + 1, y, x + 1, y + 1));
        const bottom = this.lines.has(this.getLineKey(x, y + 1, x + 1, y + 1));
        const left = this.lines.has(this.getLineKey(x, y, x, y + 1));
        return top && right && bottom && left;
    }

    updateScores() {
        document.getElementById('player1Score').textContent = this.player1Score;
        document.getElementById('player2Score').textContent = this.player2Score;
    }

    updateTurnIndicator() {
        const turnIndicator = document.getElementById('turnIndicator');
        turnIndicator.textContent = `Player ${this.currentPlayer}'s Turn`;
    }

    checkGameOver() {
        const totalBoxes = (this.size - 1) * (this.size - 1);
        if (this.player1Score + this.player2Score === totalBoxes) {
            this.isGameOver = true;
            this.showWinningBanner();
        }
    }

    showWinningBanner() {
        const banner = document.getElementById('winningBanner');
        const overlay = document.getElementById('overlay');
        const message = document.getElementById('winnerMessage');

        if (this.player1Score > this.player2Score) {
            message.textContent = '🎉 Player 1 Wins! 🎉';
        } else if (this.player2Score > this.player1Score) {
            message.textContent = '🎉 Player 2 Wins! 🎉';
        } else {
            message.textContent = "It's a Tie!";
        }

        banner.style.display = 'block';
        overlay.style.display = 'block';
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw dots
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const x = j * this.boxSize + this.margin;
                const y = i * this.boxSize + this.margin;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, this.dotRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = '#333';
                this.ctx.fill();
            }
        }

        // Draw completed lines
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.strokeStyle = '#333';
        this.lines.forEach(lineKey => {
            const [start, end] = lineKey.split('-');
            const [x1, y1] = start.split(',').map(Number);
            const [x2, y2] = end.split(',').map(Number);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1 * this.boxSize + this.margin, y1 * this.boxSize + this.margin);
            this.ctx.lineTo(x2 * this.boxSize + this.margin, y2 * this.boxSize + this.margin);
            this.ctx.stroke();
        });

        // Draw hovered line
        if (this.hoveredLine && !this.lines.has(this.getLineKey(
            this.hoveredLine.x1, this.hoveredLine.y1,
            this.hoveredLine.x2, this.hoveredLine.y2))) {
            const { x1, y1, x2, y2 } = this.hoveredLine;
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#999';
            this.ctx.moveTo(x1 * this.boxSize + this.margin, y1 * this.boxSize + this.margin);
            this.ctx.lineTo(x2 * this.boxSize + this.margin, y2 * this.boxSize + this.margin);
            this.ctx.stroke();
        }

        // Draw completed boxes
        this.boxes.forEach((player, index) => {
            if (player !== 0) {
                const x = (index % (this.size - 1)) * this.boxSize + this.margin;
                const y = Math.floor(index / (this.size - 1)) * this.boxSize + this.margin;
                
                this.ctx.fillStyle = player === 1 ? 'rgba(25, 118, 210, 0.2)' : 'rgba(194, 24, 91, 0.2)';
                this.ctx.fillRect(x, y, this.boxSize, this.boxSize);
            }
        });
    }
}

// Initialize the game
let game;

function initGame() {
    const size = parseInt(document.getElementById('boardSize').value);
    game = new DotsAndBoxes('gameBoard', size);
}

// Event listeners
document.getElementById('boardSize').addEventListener('change', initGame);
document.getElementById('restartButton').addEventListener('click', initGame);
document.getElementById('playAgainButton').addEventListener('click', () => {
    document.getElementById('winningBanner').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    initGame();
});

// Start the game
initGame(); 