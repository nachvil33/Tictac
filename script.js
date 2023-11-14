// Gameboard module
const Gameboard = (() => {
    const board = ["", "", "", "", "", "", "", "", ""];
    
    const setCell = (index, marker) => {
        if (index < board.length) {
            board[index] = marker;
        }
    };

    const getCell = (index) => {
        if (index < board.length) {
            return board[index];
        }
    };

    const resetBoard = () => {
        for (let i = 0; i < board.length; i++) {
            board[i] = "";
        }
    };

    const getBoard = () => board;

    return { setCell, getCell, resetBoard, getBoard };
})();

// Player factory
const Player = (name, marker) => {
    return { name, marker };
};

// Display controller module
const DisplayController = (() => {
    const options = document.getElementById('game-options');
    const onePlayerBtn = document.getElementById('one-player-btn');
    const twoPlayersBtn = document.getElementById('two-players-btn');
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('game-status');
    const scores = document.getElementById('scores');
    const restartBtn = document.getElementById('restart-btn');

    const updateBoard = () => {
        Gameboard.getBoard().forEach((marker, index) => {
            cells[index].textContent = marker;
        });
    };

    const updateStatus = (message) => {
        status.textContent = message;
    };

    const updateScores = (wins, losses) => {
        scores.textContent = `Wins: ${wins} | Losses: ${losses}`;
    };

    const enableCells = () => {
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => {
                if (Gameboard.getCell(index) === "" && !Game.isGameOver()) {
                    Game.playTurn(index);
                }
            });
        });
    };

    const disableCells = () => {
        cells.forEach((cell) => {
            cell.removeEventListener('click', () => {});
        });
    };

    const enableOptions = () => {
        onePlayerBtn.addEventListener('click', () => {
            Game.setSinglePlayerMode(true);
            options.style.display = 'none';
            enableCells();
        });

        twoPlayersBtn.addEventListener('click', () => {
            Game.setSinglePlayerMode(false);
            options.style.display = 'none';
            enableCells();
        });
    };

    const resetBoard = () => {
        Gameboard.resetBoard();
        updateBoard();
        updateStatus("Player 1's turn");
        enableCells();
    };

    restartBtn.addEventListener('click', () => {
        Game.resetGame();
    });

    return {
        updateBoard,
        updateStatus,
        updateScores,
        enableCells,
        disableCells,
        resetBoard,
        enableOptions,
    };
})();

// Game controller module
const Game = (() => {
    let currentPlayer = Player("Player 1", "X");
    let secondPlayer = Player("Player 2", "O");
    let playerWins = 0;
    let playerLosses = 0;
    let isSinglePlayerMode = false;

    const checkForWin = () => {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (Gameboard.getCell(a) && (Gameboard.getCell(a) === Gameboard.getCell(b) && Gameboard.getCell(a) === Gameboard.getCell(c))) {
                return true;
            }
        }

        if (!Gameboard.getBoard().includes("")) {
            return true;
        }

        return false;
    };

    const playTurn = (index) => {
        if (Gameboard.getCell(index) === "" && !Game.isGameOver()) {
            Gameboard.setCell(index, currentPlayer.marker);
            DisplayController.updateBoard();

            if (checkForWin()) {
                endGame();
            } else if (isBoardFull()) {
                DisplayController.updateStatus(`It's a tie!`);
                DisplayController.disableCells();
            } else {
                togglePlayer();
            }
        }
    };

    const togglePlayer = () => {
        currentPlayer = currentPlayer === secondPlayer ? Player("Player 1", "X") : secondPlayer;
        DisplayController.updateStatus(`${currentPlayer.name}'s turn`);
        if (isSinglePlayerMode && currentPlayer.name === "CPU") {
            makeCPUMove();
        }
    };

    const makeCPUMove = () => {
        if (!Game.isGameOver()) {
            const availableCells = Gameboard.getBoard().reduce((acc, marker, index) => {
                if (marker === "") {
                    acc.push(index);
                }
                return acc;
            }, []);

            if (availableCells.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableCells.length);
                const cpuMove = availableCells[randomIndex];
                setTimeout(() => Game.playTurn(cpuMove), 500);
            }
        }
    };

    const endGame = () => {
        DisplayController.disableCells();

        if (checkForWin()) {
            if (currentPlayer.name === "Player 1") {
                playerWins++;
            } else if (currentPlayer.name === "Player 2" || currentPlayer.name === "CPU") {
                playerLosses++;
            }
        } else {
            // It's a tie
        }

        DisplayController.updateStatus(`${currentPlayer.name} wins!`);
        DisplayController.updateScores(playerWins, playerLosses);
    };

    const isBoardFull = () => {
        return !Gameboard.getBoard().includes("");
    };

    const resetGame = () => {
        currentPlayer = Player("Player 1", "X");
        secondPlayer = Player("Player 2", "O");
        Gameboard.resetBoard();
        DisplayController.resetBoard();
        DisplayController.enableOptions();
        if (isSinglePlayerMode && currentPlayer.name === "CPU") {
            setTimeout(makeCPUMove, 500);
        }
    };

    const isGameOver = () => {
        return checkForWin() || isBoardFull();
    };

    const setSinglePlayerMode = (singlePlayerMode) => {
        isSinglePlayerMode = singlePlayerMode;
        if (isSinglePlayerMode) {
            secondPlayer = Player("CPU", "O");
            currentPlayer = Math.random() < 0.5 ? Player("Player 1", "X") : secondPlayer;
            DisplayController.updateStatus(`${currentPlayer.name}'s turn`);
            if (currentPlayer.name === "CPU") {
                setTimeout(makeCPUMove, 500);
            }
        } else {
            secondPlayer = Player("Player 2", "O");
        }
    };

    return {
        playTurn,
        resetGame,
        isGameOver,
        setSinglePlayerMode,
    };
})();

// Initial setup
DisplayController.enableOptions();
