// モーダルを取得
var modal = document.getElementById("myModal");

// ボタンを取得
var btn = document.getElementById("openModal");

// 閉じるボタンを取得
var span = document.getElementsByClassName("close")[0];

// ボタンがクリックされたときにモーダルを表示
btn.onclick = function() {
    modal.style.display = "block";
}

// 閉じるボタンがクリックされたときにモーダルを閉じる
span.onclick = function() {
    modal.style.display = "none";
}

// モーダルの外側がクリックされたときにモーダルを閉じる
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const message = document.getElementById('message');
    const scoreDisplay = document.getElementById('score');
    const pass = document.getElementById('pass');
    const reset = document.getElementById('reset');
    const difficultySelect = document.getElementById('difficulty');
    let aiDifficulty = "easy";
    document.getElementById('difficulty').addEventListener('change', (event) => {
        aiDifficulty = event.target.value;
    });

    // 探索深さ
    const defaultDepth = 6;

    // オセロ盤の作成
    const boardSize = 8;
    const boardArray = new Array(boardSize);
    for (let i = 0; i < boardSize; i++) {
        boardArray[i] = new Array(boardSize).fill(null);
    }

    // 探索などに使う8方向
    const directions = [
        { dx: -1, dy: -1 },
        { dx: -1, dy: 0 },
        { dx: -1, dy: 1 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: -1 },
        { dx: 1, dy: 0 },
        { dx:1, dy: 1 }
    ]

    const initialPositions = [
        { row: 3, col: 3, color: 'white' },
        { row: 3, col: 4, color: 'black' },
        { row: 4, col: 3, color: 'black' },
        { row: 4, col: 4, color: 'white' }
    ];

    initialPositions.forEach(position => {
        boardArray[position.row][position.col] = position.color;
    });

    // 現在のプレイヤーの色
    let playerColor = 'black';
    // AIの色
    let aiColor = 'white';

    // パスボタンが押された
    pass.addEventListener('click', () => {
        if (get_valid_moves(playerColor, boardArray).length === 0) {
            message.textContent = 'ゲーム終了';
            return;
        }
        else {
            message.textContent = '置けます';
        }
    });

    // リセットボタンが押された
    reset.addEventListener('click', () => {
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                boardArray[i][j] = null;
            }
        }
        initialPositions.forEach(position => {
            boardArray[position.row][position.col] = position.color;
        });
        drawBoard();
        difficultySelect.disabled = false; // リセット時に難易度選択を有効にする
    });

    // 描画
    function drawBoard() {
        board.innerHTML = '';

        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                if (boardArray[i][j]) {
                    const disc = document.createElement('div');
                    disc.classList.add('disc', boardArray[i][j]);
                    cell.appendChild(disc);
                }
                cell.addEventListener('click', () => handleCellClick(i, j));
                board.appendChild(cell);
            }
        }
        // 黒:0 - 白:0
        scoreDisplay.textContent = `黒: ${boardArray.flat().filter(color => color === 'black').length} - 白: ${boardArray.flat().filter(color => color === 'white').length}`;
    }
    
    function handleCellClick(row, col) {
        // playerColorの手を置く
        if (is_valid_move(row, col, playerColor, boardArray)) {
            // 石をひっくり返す
            make_move(row, col, playerColor, boardArray);
            // 反映させる
            drawBoard();

            difficultySelect.disabled = true; // ゲーム開始後に難易度選択を無効にする
    
            // ゲーム終了判定
            if (is_game_over(boardArray)) {
                message.textContent = 'ゲーム終了';
                return;
            }
            // AIの手を置く
            setTimeout(() => {
                let validMoves = get_valid_moves(aiColor, boardArray);
                let aiMove;
                if (aiDifficulty === 'easy') {
                    aiMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                } else if (aiDifficulty === 'medium') {
                    aiMove = get_best_move_mcts(validMoves, aiColor, 100); // 100回のシミュレーション
                } else if (aiDifficulty === 'hard') {
                    aiMove = get_best_move_mcts(validMoves, aiColor, 10000); // 10000回のシミュレーション
                }
                make_move(aiMove.row, aiMove.col, aiColor, boardArray);
                drawBoard();
            }, 500); // 0.5秒待つ
        }
    }

    
    // MCTSを使用して最善手を取得する関数を追加
    function get_best_move_mcts(validMoves, color, simulations) {
        let bestMove = null;
        let bestWinRate = -Infinity;
        for (let move of validMoves) {
            let wins = 0;
            for (let i = 0; i < simulations; i++) {
                let boardCopy = structuredClone(boardArray);
                make_move(move.row, move.col, color, boardCopy);
                if (simulate_game(boardCopy, color)) {
                    wins++;
                }
            }
            let winRate = wins / simulations;
            if (winRate > bestWinRate) {
                bestWinRate = winRate;
                bestMove = move;
            }
        }
        return bestMove;
    }
    
    // ゲームをシミュレートする関数を追加
    function simulate_game(board, color) {
        let currentColor = color;
        while (!is_game_over(board)) {
            let validMoves = get_valid_moves(currentColor, board);
            if (validMoves.length === 0) {
                currentColor = (currentColor === 'black') ? 'white' : 'black';
                continue;
            }
            let move = validMoves[Math.floor(Math.random() * validMoves.length)];
            make_move(move.row, move.col, currentColor, board);
            currentColor = (currentColor === 'black') ? 'white' : 'black';
        }
        return evaluate_board(board, color) > 0;
    }
    
    // 相手の色を取得する関数を追加
    function get_opponent_color(color) {
        return color === 'black' ? 'white' : 'black';
    }
    
    // ボードの評価関数を追加
    function evaluate_board(board, color) {
        let score = 0;
        for (let row of board) {
            for (let cell of row) {
                if (cell === color) {
                    score++;
                } else if (cell === get_opponent_color(color)) {
                    score--;
                }
            }
        }
        return score;
    }

    // 有効な手かどうか
    // 実際のboardに変更を加えない
    function is_valid_move(row, col, nowColor, board) {
        // 埋まってたらNG
        if (board[row][col]) {
            return false;
        }

        // 探索
        for (let i = 0; i < directions.length; i++) {
            const dx = directions[i].dx;
            const dy = directions[i].dy;
            if (flip_in_direction(row, col, dx, dy, nowColor).length > 0) {
                return true;
            }
        }
        return false;
    }

    // dx, dyで指定された方向に関して、石に当たるか、盤外に出るまで探索
    // ひっくり返す石のリストを返す
    // 実際のボードに変更を加えない
    function flip_in_direction(row, col, dx, dy, nowColor) {
        let x = col + dx;
        let y = row + dy;
        let flip_list = [];
        const opponentColor = get_opponent_color(nowColor);
        while (0 <= x && x < boardSize && 0 <= y && y < boardSize) {
            // 空白マスはNG
            if (boardArray[y][x] === null) {
                break;
            }
            // 相手の色の石があればリストに追加
            if (boardArray[y][x] === opponentColor) {
                flip_list.push({ x: x, y: y });
            }
            // 自分と同じ色の石があればリストを返す
            else if (boardArray[y][x] === nowColor) {
                if (flip_list.length > 0) {
                    return flip_list;
                } else {
                    break;
                }
            }
            // それ以外はリセット
            else {
                break;
            }
            x += dx;
            y += dy;
        }
        return [];
    }

    // オセロひっくり返す
    function make_move(row, col, nowColor, board) {
        let flipped = false;
        for (let i = 0; i < directions.length; i++) {
            const dx = directions[i].dx;
            const dy = directions[i].dy;
            const flip_list = flip_in_direction(row, col, dx, dy, nowColor);
            if (flip_list.length > 0) {
                flip_list.forEach(position => {
                    board[position.y][position.x] = nowColor;
                });
                flipped = true;
            }
        }
        if (flipped) {
            board[row][col] = nowColor;
            return true;
        } else {
            message.textContent = '無効な手です';
            return false;
        }
    }

    // 可能な手を列挙
    function get_valid_moves(nowColor, board) {
        let validMoves = [];
        let size = board.length;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (is_valid_move(i, j, nowColor, board)) {
                    validMoves.push({ row: i, col: j });
                }
            }
        }
        return validMoves;
    }

    // ゲーム終了判定
    function is_game_over(board) {
        return get_valid_moves(playerColor, board).length === 0 && get_valid_moves(aiColor, board).length === 0;

    }

    drawBoard();
});