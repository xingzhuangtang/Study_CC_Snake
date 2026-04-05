# API 文档 - 贪吃蛇游戏 (Snake Game)

> 项目：首钢园贪吃蛇游戏
> 文件：`snake/game.js`
> 最后更新：2026-04-05

---

## 目录

1. [全局配置对象](#全局配置对象)
2. [游戏状态变量](#游戏状态变量)
3. [核心函数](#核心函数)
4. [事件处理](#事件处理)
5. [渲染函数](#渲染函数)

---

## 全局配置对象

### `CONFIG`

游戏核心配置参数

```javascript
const CONFIG = {
    gridSize: 20,        // 网格大小（像素）
    canvasSize: 400,     // 画布大小（像素）
    speeds: {
        easy: 200,       // 简单难度速度（毫秒/帧）
        medium: 150,     // 中等难度速度
        hard: 100        // 困难难度速度
    }
};
```

### `COLORS`

像素复古风格颜色配置

```javascript
const COLORS = {
    snakeHead: '#4ecca3',    // 蛇头颜色
    snakeBody: '#3db892',    // 蛇身颜色
    food: '#ff6b6b',         // 食物颜色
    grid: '#1a1a2e'          // 网格背景色
};
```

---

## 游戏状态变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `snake` | `Array<{x, y}>` | 蛇身坐标数组 |
| `direction` | `{x, y}` | 当前移动方向 |
| `nextDirection` | `{x, y}` | 下一步移动方向（缓冲） |
| `food` | `{x, y}` | 食物坐标 |
| `score` | `number` | 当前得分 |
| `highScore` | `number` | 最高分（localStorage 持久化） |
| `gameLoop` | `Interval` | 游戏循环定时器 |
| `isPaused` | `boolean` | 是否暂停 |
| `isGameOver` | `boolean` | 是否游戏结束 |
| `currentSpeed` | `number` | 当前游戏速度（ms） |

---

## 核心函数

### `init()`

初始化游戏，绑定事件监听器并绘制初始网格。

**调用时机**: 页面加载完成后自动调用

```javascript
function init() {
    highScoreEl.textContent = highScore;
    drawGrid();
    setupEventListeners();
}
```

---

### `startGame()`

开始新游戏，重置所有状态。

**调用方式**: 点击开始按钮触发

```javascript
function startGame() {
    // 重置蛇、方向、分数等状态
    // 启动游戏循环
    gameLoop = setInterval(update, currentSpeed);
}
```

**副作用**:
- 重置 `snake`, `direction`, `score`, `isPaused`, `isGameOver`
- 禁用开始按钮和难度选择器
- 启用暂停按钮

---

### `update()`

游戏主循环，每帧调用一次。

**调用频率**: 根据难度设定（100-200ms）

**逻辑流程**:
1. 检查暂停/游戏结束状态
2. 更新蛇的方向
3. 计算新头部位置
4. 碰撞检测（墙壁、自身）
5. 移动蛇（头部入栈，尾部出栈）
6. 检测是否吃到食物
7. 更新分数和最高分
8. 重绘画面

**错误返回**: 无返回值，碰撞时调用 `gameOver()`

---

### `gameOver()`

处理游戏结束逻辑。

```javascript
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    // 绘制游戏结束画面
    // 重置按钮状态
}
```

**副作用**:
- 停止游戏循环
- 绘制结束画面
- 恢复按钮可点击状态

---

### `spawnFood()`

在随机位置生成食物，确保不会生成在蛇身上。

```javascript
function spawnFood() {
    do {
        food.x = Math.floor(Math.random() * gridWidth);
        food.y = Math.floor(Math.random() * gridHeight);
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}
```

**返回**: 无（直接修改 `food` 状态）

---

### `changeDifficulty()`

改变游戏难度（速度）。

```javascript
function changeDifficulty() {
    currentSpeed = CONFIG.speeds[difficulty];
    // 如果游戏进行中，重新设置循环速度
}
```

---

### `togglePause()`

切换暂停状态。

```javascript
function togglePause() {
    isPaused = !isPaused;
    // 绘制/清除暂停覆盖层
}
```

---

## 事件处理

### `handleKeyPress(e)`

处理键盘输入。

**支持的按键**:

| 按键 | 方向 |
|------|------|
| `ArrowUp` / `W` | 向上 |
| `ArrowDown` / `S` | 向下 |
| `ArrowLeft` / `A` | 向左 |
| `ArrowRight` / `D` | 向右 |
| `Space` | 暂停/继续 |

**防反向转向逻辑**:
```javascript
if (newDir.x !== -direction.x || newDir.y !== -direction.y) {
    nextDirection = newDir;
}
```

---

### `setupEventListeners()`

绑定所有事件监听器。

**绑定的事件**:
- `keydown` → `handleKeyPress`
- `startBtn.click` → `startGame`
- `pauseBtn.click` → `togglePause`
- `difficulty.change` → `changeDifficulty`

---

## 渲染函数

### `draw()`

绘制完整游戏画面。

**绘制内容**:
1. 清空画布（背景色）
2. 绘制网格
3. 绘制蛇（头部和身体不同颜色）
4. 绘制蛇头眼睛（根据方向定位）
5. 绘制食物（像素风格苹果）

---

### `drawGrid()`

绘制网格背景线。

```javascript
function drawGrid() {
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CONFIG.canvasSize; i += CONFIG.gridSize) {
        // 绘制垂直线和水平线
    }
}
```

---

## DOM 元素引用

| 元素 ID | 用途 |
|---------|------|
| `gameCanvas` | 游戏画布 |
| `score` | 当前分数显示 |
| `highScore` | 最高分显示 |
| `startBtn` | 开始按钮 |
| `pauseBtn` | 暂停按钮 |
| `difficulty` | 难度选择下拉框 |

---

## 本地存储

| Key | 类型 | 说明 |
|-----|------|------|
| `snakeHighScore` | `number` | 最高分持久化 |

---

## 使用示例

### HTML 结构

```html
<canvas id="gameCanvas" width="400" height="400"></canvas>
<div>
    <span>分数：<span id="score">0</span></span>
    <span>最高分：<span id="highScore">0</span></span>
</div>
<div>
    <button id="startBtn">开始</button>
    <button id="pauseBtn" disabled>暂停</button>
    <select id="difficulty">
        <option value="easy">简单</option>
        <option value="medium" selected>中等</option>
        <option value="hard">困难</option>
    </select>
</div>
```

### 初始化

```html
<script src="snake/game.js"></script>
<!-- 脚本加载后自动调用 init() -->
```

---

## 版本历史

- v1.0 (2026-04-03) - 初始版本，包含完整游戏逻辑
