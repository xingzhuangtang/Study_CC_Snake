// 贪吃蛇游戏主逻辑 - 像素复古版

// 游戏配置
const CONFIG = {
    gridSize: 20,
    canvasSize: 400,
    speeds: {
        easy: 200,
        medium: 150,
        hard: 100
    },
    get gridCount() { return this.canvasSize / this.gridSize; }
};

// 颜色配置 - 像素复古风格
const COLORS = {
    snakeHead: '#4ecca3',
    snakeBody: '#3db892',
    food: '#ff6b6b',
    grid: '#1a1a2e'
};

// 方向映射常量 - 避免重复创建
const DIRECTION_MAP = {
    'arrowup': { x: 0, y: -1 },
    'arrowdown': { x: 0, y: 1 },
    'arrowleft': { x: -1, y: 0 },
    'arrowright': { x: 1, y: 0 },
    'w': { x: 0, y: -1 },
    's': { x: 0, y: 1 },
    'a': { x: -1, y: 0 },
    'd': { x: 1, y: 0 }
};

// 蛇眼偏移量 - 按方向映射
const EYE_OFFSETS = {
    '1,0':  [{x: 12, y: 5}, {x: 12, y: 12}],   // 右
    '-1,0': [{x: 5, y: 5}, {x: 5, y: 12}],     // 左
    '0,-1': [{x: 5, y: 5}, {x: 12, y: 5}],     // 上
    '0,1':  [{x: 5, y: 12}, {x: 12, y: 12}]    // 下
};

// 蛇身位置 Set - O(1) 碰撞检测
let snakeSet = new Set();

// 防抖标记
let scoreUpdatePending = false;

// 游戏状态
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;
let currentSpeed = CONFIG.speeds.medium;

// DOM 元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const difficultySelect = document.getElementById('difficulty');

// 初始化
function init() {
    highScoreEl.textContent = highScore;
    drawGrid();
    setupEventListeners();
}

// 设置事件监听
function setupEventListeners() {
    // 键盘控制
    document.addEventListener('keydown', handleKeyPress);

    // 按钮控制
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    difficultySelect.addEventListener('change', changeDifficulty);
}

// 处理键盘输入
function handleKeyPress(e) {
    const key = e.key.toLowerCase();

    // 暂停控制
    if (e.code === 'Space') {
        e.preventDefault();
        if (!isGameOver && snake.length > 0) {
            togglePause();
        }
        return;
    }

    // 方向控制 - 防止反向转向
    const newDir = DIRECTION_MAP[key];

    if (newDir) {
        e.preventDefault();
        // 防止 180 度转向
        if (newDir.x !== -direction.x || newDir.y !== -direction.y) {
            nextDirection = newDir;
        }
    }
}

// 开始游戏
function startGame() {
    // 确保清理旧定时器，防止内存泄漏
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }

    // 重置状态
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    isPaused = false;
    isGameOver = false;
    scoreEl.textContent = score;
    scoreUpdatePending = false;

    // 更新蛇身 Set
    updateSnakeSet();

    // 更新按钮状态
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    difficultySelect.disabled = true;

    spawnFood();
    draw();

    // 启动游戏循环
    gameLoop = setInterval(update, currentSpeed);
}

// 切换暂停状态
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';

    if (isPaused) {
        // 绘制暂停覆盖层
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4ecca3';
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('暂停', canvas.width / 2, canvas.height / 2);
    } else {
        draw();
    }
}

// 改变难度
function changeDifficulty() {
    const difficulty = difficultySelect.value;
    currentSpeed = CONFIG.speeds[difficulty];

    // 如果游戏正在进行，重新设置循环速度
    if (gameLoop && !isPaused && !isGameOver) {
        clearInterval(gameLoop);
        gameLoop = setInterval(update, currentSpeed);
    }
}

// 更新蛇身 Set - O(1) 碰撞检测
function updateSnakeSet() {
    snakeSet = new Set(snake.map(pos => `${pos.x},${pos.y}`));
}

// 生成食物
function spawnFood() {
    const gridCount = CONFIG.gridCount;

    do {
        food.x = Math.floor(Math.random() * gridCount);
        food.y = Math.floor(Math.random() * gridCount);
    } while (snakeSet.has(`${food.x},${food.y}`));
}

// 更新游戏状态
function update() {
    if (isPaused || isGameOver) return;

    direction = nextDirection;

    // 计算新头部位置
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // 碰撞检测 - 墙壁
    const gridCount = CONFIG.gridCount;

    if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount) {
        gameOver();
        return;
    }

    // 碰撞检测 - 自身 - O(1)
    if (snakeSet.has(`${head.x},${head.y}`)) {
        gameOver();
        return;
    }

    // 移动蛇
    snake.unshift(head);
    updateSnakeSet();

    // 检测是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;

        // 防抖更新分数和 localStorage
        if (!scoreUpdatePending) {
            scoreUpdatePending = true;
            requestAnimationFrame(() => {
                scoreEl.textContent = score;
                if (score > highScore) {
                    highScore = score;
                    highScoreEl.textContent = highScore;
                    localStorage.setItem('snakeHighScore', highScore);
                }
                scoreUpdatePending = false;
            });
        }

        spawnFood();
    } else {
        snake.pop();
        updateSnakeSet();
    }

    draw();
}

// 绘制游戏画面
function draw() {
    // 清空画布
    ctx.fillStyle = COLORS.grid;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格
    drawGrid();

    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snakeBody;
        ctx.fillRect(
            segment.x * CONFIG.gridSize + 1,
            segment.y * CONFIG.gridSize + 1,
            CONFIG.gridSize - 2,
            CONFIG.gridSize - 2
        );

        // 蛇头画眼睛
        if (index === 0) {
            ctx.fillStyle = '#000';
            const eyeSize = 4;
            const key = `${direction.x},${direction.y}`;
            const offsets = EYE_OFFSETS[key];

            if (offsets) {
                offsets.forEach(offset => {
                    ctx.fillRect(
                        segment.x * CONFIG.gridSize + offset.x,
                        segment.y * CONFIG.gridSize + offset.y,
                        eyeSize, eyeSize
                    );
                });
            }
        }
    });

    // 绘制食物（像素风格苹果）
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(
        food.x * CONFIG.gridSize + 2,
        food.y * CONFIG.gridSize + 2,
        CONFIG.gridSize - 4,
        CONFIG.gridSize - 4
    );
}

// 绘制网格背景
function drawGrid() {
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;

    for (let i = 0; i <= CONFIG.canvasSize; i += CONFIG.gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CONFIG.canvasSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CONFIG.canvasSize, i);
        ctx.stroke();
    }
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    gameLoop = null;

    // 绘制游戏结束画面
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff6b6b';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#eee';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(`得分：${score}`, canvas.width / 2, canvas.height / 2 + 20);

    // 重置按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '暂停';
    difficultySelect.disabled = false;
}

// 启动游戏
init();
