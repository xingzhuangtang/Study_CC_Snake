// 贪吃蛇游戏核心逻辑 - 可测试版本
// 将纯逻辑与 DOM 操作分离，便于单元测试

// ==================== 配置常量 ====================

export const CONFIG = {
    gridSize: 20,
    canvasSize: 400,
    speeds: {
        easy: 200,
        medium: 150,
        hard: 100
    },
    get gridCount() { return this.canvasSize / this.gridSize; }
};

export const COLORS = {
    snakeHead: '#4ecca3',
    snakeBody: '#3db892',
    food: '#ff6b6b',
    grid: '#1a1a2e'
};

export const DIRECTION_MAP = {
    'arrowup': { x: 0, y: -1 },
    'arrowdown': { x: 0, y: 1 },
    'arrowleft': { x: -1, y: 0 },
    'arrowright': { x: 1, y: 0 },
    'w': { x: 0, y: -1 },
    's': { x: 0, y: 1 },
    'a': { x: -1, y: 0 },
    'd': { x: 1, y: 0 }
};

export const EYE_OFFSETS = {
    '1,0':  [{x: 12, y: 5}, {x: 12, y: 12}],
    '-1,0': [{x: 5, y: 5}, {x: 5, y: 12}],
    '0,-1': [{x: 5, y: 5}, {x: 12, y: 5}],
    '0,1':  [{x: 5, y: 12}, {x: 12, y: 12}]
};

// ==================== 游戏状态类 ====================

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.snake = [
            { x: 5, y: 10 },
            { x: 4, y: 10 },
            { x: 3, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = { x: 0, y: 0 };
        this.score = 0;
        this.highScore = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.currentSpeed = CONFIG.speeds.medium;
        this.snakeSet = new Set();
        this.updateSnakeSet();
    }

    updateSnakeSet() {
        this.snakeSet = new Set(this.snake.map(pos => `${pos.x},${pos.y}`));
    }

    setInitialFood(food) {
        this.food = food;
    }
}

// ==================== 纯逻辑函数 ====================

/**
 * 处理方向输入
 * @param {Object} currentDir - 当前方向
 * @param {Object} newDir - 新方向
 * @returns {Object} - 更新后的方向
 */
export function handleDirection(currentDir, newDir) {
    // 防止 180 度转向
    if (newDir.x === -currentDir.x && newDir.y === -currentDir.y) {
        return currentDir;
    }
    return newDir;
}

/**
 * 处理键盘输入
 * @param {string} key - 按键
 * @returns {Object|null} - 方向对象或 null
 */
export function parseKeyInput(key) {
    return DIRECTION_MAP[key.toLowerCase()] || null;
}

/**
 * 计算蛇的新头部位置
 * @param {Object} head - 当前头部坐标
 * @param {Object} direction - 移动方向
 * @returns {Object} - 新头部坐标
 */
export function calculateNewHead(head, direction) {
    return {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
}

/**
 * 检测墙壁碰撞
 * @param {Object} pos - 位置坐标
 * @param {number} gridSize - 网格数量
 * @returns {boolean} - 是否碰撞
 */
export function checkWallCollision(pos, gridSize = CONFIG.gridCount) {
    return pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize;
}

/**
 * 检测蛇身碰撞
 * @param {Object} pos - 位置坐标
 * @param {Set} snakeSet - 蛇身位置集合
 * @returns {boolean} - 是否碰撞
 */
export function checkSelfCollision(pos, snakeSet) {
    return snakeSet.has(`${pos.x},${pos.y}`);
}

/**
 * 检测是否吃到食物
 * @param {Object} head - 蛇头坐标
 * @param {Object} food - 食物坐标
 * @returns {boolean} - 是否吃到食物
 */
export function checkFoodCollision(head, food) {
    return head.x === food.x && head.y === food.y;
}

/**
 * 移动蛇
 * @param {Array} snake - 蛇身数组
 * @param {Object} newHead - 新头部位置
 * @param {boolean} grow - 是否增长
 * @returns {Array} - 移动后的蛇身
 */
export function moveSnake(snake, newHead, grow = false) {
    const newSnake = [newHead, ...snake];
    if (!grow) {
        newSnake.pop();
    }
    return newSnake;
}

/**
 * 生成食物位置
 * @param {Set} snakeSet - 蛇身位置集合
 * @param {number} gridSize - 网格数量
 * @param {Function} randomFn - 随机数生成器（用于测试）
 * @returns {Object} - 食物坐标
 */
export function spawnFood(snakeSet, gridSize = CONFIG.gridCount, randomFn = Math.random) {
    let food;
    do {
        food = {
            x: Math.floor(randomFn() * gridSize),
            y: Math.floor(randomFn() * gridSize)
        };
    } while (snakeSet.has(`${food.x},${food.y}`));
    return food;
}

/**
 * 计算得分
 * @param {number} currentScore - 当前分数
 * @param {number} points - 增加的分数
 * @returns {number} - 新分数
 */
export function calculateScore(currentScore, points = 10) {
    return currentScore + points;
}

/**
 * 检查是否打破记录
 * @param {number} score - 当前分数
 * @param {number} highScore - 最高分
 * @returns {boolean} - 是否打破记录
 */
export function isNewHighScore(score, highScore) {
    return score > highScore;
}

/**
 * 获取蛇眼偏移量
 * @param {Object} direction - 方向
 * @returns {Array} - 眼睛偏移量数组
 */
export function getEyeOffsets(direction) {
    const key = `${direction.x},${direction.y}`;
    return EYE_OFFSETS[key] || [];
}

// ==================== 游戏逻辑主函数 ====================

/**
 * 执行游戏更新
 * @param {GameState} state - 游戏状态
 * @returns {Object} - 更新结果 { moved: boolean, ate: boolean, collision: boolean }
 */
export function gameUpdate(state) {
    if (state.isPaused || state.isGameOver) {
        return { moved: false, ate: false, collision: false };
    }

    // 更新方向
    state.direction = handleDirection(state.direction, state.nextDirection);

    // 计算新头部
    const head = calculateNewHead(state.snake[0], state.direction);

    // 检测碰撞
    if (checkWallCollision(head)) {
        state.isGameOver = true;
        return { moved: false, ate: false, collision: true, type: 'wall' };
    }

    if (checkSelfCollision(head, state.snakeSet)) {
        state.isGameOver = true;
        return { moved: false, ate: false, collision: true, type: 'self' };
    }

    // 移动蛇
    const ateFood = checkFoodCollision(head, state.food);
    state.snake = moveSnake(state.snake, head, ateFood);
    state.updateSnakeSet();

    // 处理得分
    if (ateFood) {
        state.score = calculateScore(state.score);
        state.food = spawnFood(state.snakeSet);
        return { moved: true, ate: true, collision: false };
    }

    return { moved: true, ate: false, collision: false };
}

/**
 * 切换暂停状态
 * @param {GameState} state - 游戏状态
 * @returns {boolean} - 新的暂停状态
 */
export function togglePause(state) {
    state.isPaused = !state.isPaused;
    return state.isPaused;
}

/**
 * 改变难度
 * @param {GameState} state - 游戏状态
 * @param {string} difficulty - 难度级别
 * @returns {number} - 新的速度
 */
export function changeDifficulty(state, difficulty) {
    if (CONFIG.speeds[difficulty]) {
        state.currentSpeed = CONFIG.speeds[difficulty];
        return state.currentSpeed;
    }
    return state.currentSpeed;
}
