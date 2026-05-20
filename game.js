// 遊戲常數
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const GAME_SPEED = 100; // 毫秒

// 十種水果配置
const FRUITS = [
    { name: '蘋果', color: '#ff0000', borderColor: '#cc0000', bgColor: '#ffe6e6', expression: 'happy' },
    { name: '香蕉', color: '#ffff00', borderColor: '#cccc00', bgColor: '#ffffcc', expression: 'cool' },
    { name: '橙子', color: '#ff8800', borderColor: '#cc6600', bgColor: '#ffe6cc', expression: 'excited' },
    { name: '西瓜', color: '#00ff00', borderColor: '#00cc00', bgColor: '#e6ffe6', expression: 'silly' },
    { name: '葡萄', color: '#9933ff', borderColor: '#7722cc', bgColor: '#f0e6ff', expression: 'sleepy' },
    { name: '草莓', color: '#ff3366', borderColor: '#cc2255', bgColor: '#ffe6f0', expression: 'love' },
    { name: '檸檬', color: '#ffff33', borderColor: '#cccc22', bgColor: '#fffff0', expression: 'sour' },
    { name: '櫻桃', color: '#ff1111', borderColor: '#cc0000', bgColor: '#ffe0e0', expression: 'wink' },
    { name: '桃子', color: '#ffaa66', borderColor: '#dd8844', bgColor: '#ffe6d9', expression: 'peaceful' },
    { name: '梨', color: '#ccdd66', borderColor: '#aaaa44', bgColor: '#f0f5cc', expression: 'tired' }
];

// 遊戲狀態
const gameState = {
    snake: [{ x: 10, y: 10 }],
    food: null,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    score: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0,
    isRunning: false,
    isPaused: false,
    gameOver: false,
    currentFruitIndex: 0,
    fruitsEaten: [],
};

// DOM 元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const gameStatus = document.getElementById('gameStatus');
const fruitsEatenList = document.getElementById('fruitsEatenList');

// 初始化
highScoreDisplay.textContent = gameState.highScore;

// 事件監聽
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

/**
 * 開始遊戲
 */
function startGame() {
    if (gameState.isRunning) return;
    
    gameState.isRunning = true;
    gameState.gameOver = false;
    gameState.isPaused = false;
    gameStatus.style.display = 'none';
    
    // 隨機選擇初始水果
    gameState.currentFruitIndex = Math.floor(Math.random() * FRUITS.length);
    gameState.fruitsEaten = [];
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    gameState.food = generateFood();
    gameLoop();
}

/**
 * 遊戲主迴圈
 */
function gameLoop() {
    if (!gameState.isRunning) return;
    
    if (!gameState.isPaused) {
        update();
        draw();
    }
    
    setTimeout(gameLoop, GAME_SPEED);
}

/**
 * 更新遊戲狀態
 */
function update() {
    // 更新方向
    gameState.direction = gameState.nextDirection;
    
    // 計算新的蛇頭位置
    const head = gameState.snake[0];
    const newHead = {
        x: head.x + gameState.direction.x,
        y: head.y + gameState.direction.y,
    };
    
    // 邊界檢測 (遊戲結束)
    if (newHead.x < 0 || newHead.x >= CANVAS_SIZE / GRID_SIZE ||
        newHead.y < 0 || newHead.y >= CANVAS_SIZE / GRID_SIZE) {
        endGame();
        return;
    }
    
    // 自我碰撞檢測
    if (checkSelfCollision(newHead)) {
        endGame();
        return;
    }
    
    // 添加新頭部
    gameState.snake.unshift(newHead);
    
    // 檢查是否吃到食物
    if (newHead.x === gameState.food.x && newHead.y === gameState.food.y) {
        gameState.score += 10;
        scoreDisplay.textContent = gameState.score;
        switchToNextFruit();
        gameState.food = generateFood();
    } else {
        // 移除尾部 (蛇不變長)
        gameState.snake.pop();
    }
}

/**
 * 繪製遊戲畫面
 */
function draw() {
    // 取得當前水果配置
    const currentFruit = FRUITS[gameState.currentFruitIndex];
    
    // 清空畫布 - 使用當前水果的背景色
    ctx.fillStyle = currentFruit.bgColor;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // 繪製網格 (可選)
    drawGrid();
    
    // 繪製蛇
    drawSnake();
    
    // 繪製食物
    drawFood();
    
    // 繪製水果名稱
    drawFruitName();
}

/**
 * 繪製網格
 */
function drawGrid() {
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
    }
}

/**
 * 繪製蛇
 */
function drawSnake() {
    const currentFruit = FRUITS[gameState.currentFruitIndex];
    
    gameState.snake.forEach((segment, index) => {
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        
        if (index === 0) {
            // 蛇頭 (亮綠色)
            ctx.fillStyle = '#00ff00';
        } else {
            // 蛇身 (暗綠色)
            ctx.fillStyle = '#00aa00';
        }
        
        ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        
        // 繪製邊框
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        
        // 如果是蛇頭，繪製表情
        if (index === 0) {
            drawSnakeExpression(x, y, currentFruit.expression);
        }
    });
}

/**
 * 根據表情類型繪製蛇的表情
 */
function drawSnakeExpression(x, y, expression) {
    const centerX = x + GRID_SIZE / 2;
    const centerY = y + GRID_SIZE / 2;
    const eyeSize = 2;
    const eyeOffsetX = 5;
    const eyeOffsetY = 3;
    
    ctx.fillStyle = '#000';
    
    switch (expression) {
        case 'happy': // 蘋果 - 開心笑臉
            // 左眼
            ctx.fillRect(centerX - eyeOffsetX - eyeSize, centerY - eyeOffsetY, eyeSize * 2, eyeSize * 2);
            // 右眼
            ctx.fillRect(centerX + eyeOffsetX - eyeSize, centerY - eyeOffsetY, eyeSize * 2, eyeSize * 2);
            // 嘴巴 - 彎曲的笑容
            ctx.beginPath();
            ctx.arc(centerX, centerY + 3, 3, 0, Math.PI);
            ctx.stroke();
            break;
            
        case 'cool': // 香蕉 - 酷表情
            // 太陽眼鏡
            ctx.beginPath();
            ctx.rect(centerX - eyeOffsetX - 3, centerY - eyeOffsetY - 2, 4, 4);
            ctx.fill();
            ctx.beginPath();
            ctx.rect(centerX + eyeOffsetX - 1, centerY - eyeOffsetY - 2, 4, 4);
            ctx.fill();
            // 連接線
            ctx.beginPath();
            ctx.moveTo(centerX - eyeOffsetX + 1, centerY - eyeOffsetY);
            ctx.lineTo(centerX + eyeOffsetX - 1, centerY - eyeOffsetY);
            ctx.stroke();
            break;
            
        case 'excited': // 橙子 - 興奮
            // 大眼睛
            ctx.beginPath();
            ctx.arc(centerX - eyeOffsetX, centerY - eyeOffsetY, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + eyeOffsetX, centerY - eyeOffsetY, 2, 0, Math.PI * 2);
            ctx.fill();
            // 嘴巴 - O 形
            ctx.beginPath();
            ctx.arc(centerX, centerY + 4, 2, 0, Math.PI * 2);
            ctx.stroke();
            break;
            
        case 'silly': // 西瓜 - 傻笑
            // 眼睛 - 斜視
            ctx.fillRect(centerX - eyeOffsetX - 1, centerY - eyeOffsetY, 2, 2);
            ctx.fillRect(centerX + eyeOffsetX, centerY - eyeOffsetY + 2, 2, 2);
            // 嘴巴 - 大開
            ctx.beginPath();
            ctx.arc(centerX, centerY + 3, 4, 0.3, Math.PI - 0.3);
            ctx.stroke();
            break;
            
        case 'sleepy': // 葡萄 - 睏
            // 眼睛 - 橫線
            ctx.fillRect(centerX - eyeOffsetX - 2, centerY - eyeOffsetY, 4, 1);
            ctx.fillRect(centerX + eyeOffsetX - 2, centerY - eyeOffsetY, 4, 1);
            // 嘴巴 - 平線
            ctx.beginPath();
            ctx.moveTo(centerX - 3, centerY + 4);
            ctx.lineTo(centerX + 3, centerY + 4);
            ctx.stroke();
            break;
            
        case 'love': // 草莓 - 愛心眼
            // 心形眼睛（簡化為圓形 + 標記）
            ctx.beginPath();
            ctx.arc(centerX - eyeOffsetX, centerY - eyeOffsetY, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + eyeOffsetX, centerY - eyeOffsetY, 2, 0, Math.PI * 2);
            ctx.fill();
            // 心形下面的標記
            ctx.beginPath();
            ctx.moveTo(centerX - 4, centerY + 4);
            ctx.lineTo(centerX, centerY + 1);
            ctx.lineTo(centerX + 4, centerY + 4);
            ctx.stroke();
            break;
            
        case 'sour': // 檸檬 - 酸臉
            // 眼睛 - 皺著
            ctx.fillRect(centerX - eyeOffsetX - 1, centerY - eyeOffsetY, 2, 3);
            ctx.fillRect(centerX + eyeOffsetX - 1, centerY - eyeOffsetY, 2, 3);
            // 嘴巴 - 向下
            ctx.beginPath();
            ctx.arc(centerX, centerY + 3, 3, -Math.PI, 0);
            ctx.stroke();
            break;
            
        case 'wink': // 櫻桃 - 眨眼
            // 左眼 - 眨著
            ctx.beginPath();
            ctx.moveTo(centerX - eyeOffsetX - 2, centerY - eyeOffsetY);
            ctx.lineTo(centerX - eyeOffsetX + 2, centerY - eyeOffsetY);
            ctx.stroke();
            // 右眼 - 開著
            ctx.beginPath();
            ctx.arc(centerX + eyeOffsetX, centerY - eyeOffsetY, 2, 0, Math.PI * 2);
            ctx.fill();
            // 嘴巴 - 調皮
            ctx.beginPath();
            ctx.arc(centerX, centerY + 3, 2, 0, Math.PI);
            ctx.stroke();
            break;
            
        case 'peaceful': // 桃子 - 寧靜
            // 眼睛 - 彎彎的
            ctx.beginPath();
            ctx.arc(centerX - eyeOffsetX, centerY - eyeOffsetY, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + eyeOffsetX, centerY - eyeOffsetY, 1.5, 0, Math.PI * 2);
            ctx.fill();
            // 嘴巴 - 平靜的微笑
            ctx.beginPath();
            ctx.arc(centerX, centerY + 3, 2, 0.2, Math.PI - 0.2);
            ctx.stroke();
            break;
            
        case 'tired': // 梨 - 疲勞
            // 眼睛 - 垂下
            ctx.fillRect(centerX - eyeOffsetX - 1, centerY - eyeOffsetY - 1, 2, 3);
            ctx.fillRect(centerX + eyeOffsetX - 1, centerY - eyeOffsetY - 1, 2, 3);
            // 嘴巴 - 無力的笑
            ctx.beginPath();
            ctx.arc(centerX, centerY + 2, 2, 0.4, Math.PI - 0.4);
            ctx.stroke();
            break;
    }
}

/**
 * 繪製食物
 */
function drawFood() {
    const currentFruit = FRUITS[gameState.currentFruitIndex];
    const x = gameState.food.x * GRID_SIZE;
    const y = gameState.food.y * GRID_SIZE;
    const centerX = x + GRID_SIZE / 2;
    const centerY = y + GRID_SIZE / 2;
    
    ctx.fillStyle = currentFruit.color;
    ctx.strokeStyle = currentFruit.borderColor;
    ctx.lineWidth = 1;
    
    switch (gameState.currentFruitIndex) {
        case 0: // 蘋果 - 圓形
            ctx.beginPath();
            ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // 莖
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 7);
            ctx.lineTo(centerX, centerY - 10);
            ctx.stroke();
            // 葉子
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.ellipse(centerX + 4, centerY - 9, 3, 2, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 1: // 香蕉 - 彎曲形
            ctx.beginPath();
            ctx.moveTo(x + 3, y + 14);
            ctx.quadraticCurveTo(centerX, y - 2, x + 16, y + 3);
            ctx.lineWidth = 8;
            ctx.stroke();
            break;
            
        case 2: // 橙子 - 分段的圓
            ctx.beginPath();
            ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // 分段線
            ctx.strokeStyle = currentFruit.borderColor;
            ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + Math.cos(angle) * 7, centerY + Math.sin(angle) * 7);
                ctx.stroke();
            }
            break;
            
        case 3: // 西瓜 - 綠色圓 + 紅色
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // 紅色內部
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
            ctx.fill();
            // 種子
            ctx.fillStyle = '#000';
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const sx = centerX + Math.cos(angle) * 3;
                const sy = centerY + Math.sin(angle) * 3;
                ctx.fillRect(sx - 1, sy - 1, 2, 2);
            }
            break;
            
        case 4: // 葡萄 - 多個圓形
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const gx = centerX - 4 + i * 4;
                    const gy = centerY - 4 + j * 4;
                    ctx.fillStyle = currentFruit.color;
                    ctx.beginPath();
                    ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            }
            // 莖
            ctx.strokeStyle = '#228B22';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 6);
            ctx.lineTo(centerX, centerY - 10);
            ctx.stroke();
            break;
            
        case 5: // 草莓 - 心形 + 種子
            ctx.fillStyle = currentFruit.color;
            // 簡化的心形
            ctx.beginPath();
            ctx.moveTo(centerX, centerY + 4);
            ctx.quadraticCurveTo(centerX - 5, centerY - 2, centerX - 5, centerY - 3);
            ctx.quadraticCurveTo(centerX - 5, centerY - 6, centerX, centerY - 5);
            ctx.quadraticCurveTo(centerX + 5, centerY - 6, centerX + 5, centerY - 3);
            ctx.quadraticCurveTo(centerX + 5, centerY - 2, centerX, centerY + 4);
            ctx.fill();
            ctx.stroke();
            // 種子
            ctx.fillStyle = '#FFD700';
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 5; j++) {
                    if ((i + j) % 2 === 0) {
                        const sx = centerX - 4 + i * 1.5;
                        const sy = centerY - 2 + j * 1.5;
                        ctx.fillRect(sx, sy, 1, 1);
                    }
                }
            }
            break;
            
        case 6: // 檸檬 - 橢圓形
            ctx.fillStyle = currentFruit.color;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // 乳頭
            ctx.beginPath();
            ctx.arc(centerX + 7, centerY - 4, 1.5, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 7: // 櫻桃 - 雙圓 + 莖
            ctx.fillStyle = currentFruit.color;
            ctx.beginPath();
            ctx.arc(centerX - 3, centerY + 2, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX + 3, centerY + 2, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // 莖
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX - 3, centerY - 2);
            ctx.quadraticCurveTo(centerX, centerY - 8, centerX + 3, centerY - 2);
            ctx.stroke();
            break;
            
        case 8: // 桃子 - 圓形 + 溝槽
            ctx.fillStyle = currentFruit.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // 溝槽
            ctx.strokeStyle = currentFruit.borderColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 7);
            ctx.quadraticCurveTo(centerX + 2, centerY, centerX, centerY + 7);
            ctx.stroke();
            break;
            
        case 9: // 梨 - 鐘形
            ctx.fillStyle = currentFruit.color;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 2, 5, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // 上部更小
            ctx.beginPath();
            ctx.ellipse(centerX, centerY - 4, 4, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // 莖
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 6);
            ctx.lineTo(centerX, centerY - 10);
            ctx.stroke();
            break;
    }
}

/**
 * 繪製水果名稱
 */
function drawFruitName() {
    const currentFruit = FRUITS[gameState.currentFruitIndex];
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentFruit.name, CANVAS_SIZE / 2, 20);
}

/**
 * 生成隨機食物位置
 */
function generateFood() {
    let food;
    let isValid = false;
    
    while (!isValid) {
        food = {
            x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        };
        
        // 確保食物不會生成在蛇身上
        isValid = !gameState.snake.some(
            segment => segment.x === food.x && segment.y === food.y
        );
    }
    
    return food;
}

/**
 * 檢測蛇是否碰撞自己
 */
function checkSelfCollision(head) {
    return gameState.snake.some(
        segment => segment.x === head.x && segment.y === head.y
    );
}

/**
 * 切換到下一個水果
 */
function switchToNextFruit() {
    gameState.fruitsEaten.push(gameState.currentFruitIndex);
    gameState.currentFruitIndex = (gameState.currentFruitIndex + 1) % FRUITS.length;
    updateFruitsEatenDisplay();
}

/**
 * 更新已吃過的水果顯示
 */
function updateFruitsEatenDisplay() {
    fruitsEatenList.innerHTML = '';
    gameState.fruitsEaten.forEach(fruitIndex => {
        const badge = document.createElement('div');
        badge.className = 'fruit-badge';
        badge.textContent = FRUITS[fruitIndex].name;
        fruitsEatenList.appendChild(badge);
    });
}

/**
 * 鍵盤控制
 */
function handleKeyPress(event) {
    const key = event.key.toLowerCase();
    
    // 防止方向反向 (180 度轉向)
    if (key === 'arrowup' || key === 'w') {
        if (gameState.direction.y === 0) {
            gameState.nextDirection = { x: 0, y: -1 };
        }
    } else if (key === 'arrowdown' || key === 's') {
        if (gameState.direction.y === 0) {
            gameState.nextDirection = { x: 0, y: 1 };
        }
    } else if (key === 'arrowleft' || key === 'a') {
        if (gameState.direction.x === 0) {
            gameState.nextDirection = { x: -1, y: 0 };
        }
    } else if (key === 'arrowright' || key === 'd') {
        if (gameState.direction.x === 0) {
            gameState.nextDirection = { x: 1, y: 0 };
        }
    }
}

/**
 * 暫停/恢復遊戲
 */
function togglePause() {
    if (!gameState.isRunning) return;
    
    gameState.isPaused = !gameState.isPaused;
    pauseBtn.textContent = gameState.isPaused ? '恢復' : '暫停';
}

/**
 * 結束遊戲
 */
function endGame() {
    gameState.isRunning = false;
    gameState.gameOver = true;
    gameStatus.style.display = 'flex';
    
    // 更新最高分
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        highScoreDisplay.textContent = gameState.highScore;
        localStorage.setItem('snakeHighScore', gameState.highScore);
    }
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '暫停';
}

/**
 * 重新開始遊戲
 */
function resetGame() {
    gameState.snake = [{ x: 10, y: 10 }];
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.score = 0;
    gameState.isRunning = false;
    gameState.isPaused = false;
    gameState.gameOver = false;
    gameState.food = null;
    gameState.currentFruitIndex = 0;
    gameState.fruitsEaten = [];
    
    scoreDisplay.textContent = gameState.score;
    gameStatus.style.display = 'none';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '暫停';
    
    draw();
}

// 初始化畫布
draw();
