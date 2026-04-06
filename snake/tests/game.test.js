/**
 * 贪吃蛇游戏核心逻辑测试
 * 运行：node --experimental-vm-modules tests/game.test.js
 */

import { describe, it, expect } from './test-utils.js';
import {
    CONFIG,
    DIRECTION_MAP,
    EYE_OFFSETS,
    GameState,
    handleDirection,
    parseKeyInput,
    calculateNewHead,
    checkWallCollision,
    checkSelfCollision,
    checkFoodCollision,
    moveSnake,
    spawnFood,
    calculateScore,
    isNewHighScore,
    getEyeOffsets,
    gameUpdate,
    togglePause,
    changeDifficulty
} from '../game-core.js';

// ==================== 配置测试 ====================

describe('CONFIG', () => {
    it('应该有正确的网格数量', () => {
        expect(CONFIG.gridCount).toBe(20);
    });

    it('应该有三种难度速度', () => {
        expect(CONFIG.speeds.easy).toBe(200);
        expect(CONFIG.speeds.medium).toBe(150);
        expect(CONFIG.speeds.hard).toBe(100);
    });
});

describe('DIRECTION_MAP', () => {
    it('应该包含所有方向键映射', () => {
        expect(DIRECTION_MAP.arrowup).toEqual({ x: 0, y: -1 });
        expect(DIRECTION_MAP.arrowdown).toEqual({ x: 0, y: 1 });
        expect(DIRECTION_MAP.arrowleft).toEqual({ x: -1, y: 0 });
        expect(DIRECTION_MAP.arrowright).toEqual({ x: 1, y: 0 });
    });

    it('应该包含 WASD 映射', () => {
        expect(DIRECTION_MAP.w).toEqual({ x: 0, y: -1 });
        expect(DIRECTION_MAP.s).toEqual({ x: 0, y: 1 });
        expect(DIRECTION_MAP.a).toEqual({ x: -1, y: 0 });
        expect(DIRECTION_MAP.d).toEqual({ x: 1, y: 0 });
    });
});

// ==================== 方向处理测试 ====================

describe('handleDirection', () => {
    it('应该允许同方向移动', () => {
        const current = { x: 1, y: 0 };
        const newDir = { x: 1, y: 0 };
        expect(handleDirection(current, newDir)).toEqual({ x: 1, y: 0 });
    });

    it('应该允许 90 度转向', () => {
        const current = { x: 1, y: 0 };
        const newDir = { x: 0, y: 1 };
        expect(handleDirection(current, newDir)).toEqual({ x: 0, y: 1 });
    });

    it('应该阻止 180 度反向转向 - 左右', () => {
        const current = { x: 1, y: 0 };
        const newDir = { x: -1, y: 0 };
        expect(handleDirection(current, newDir)).toEqual({ x: 1, y: 0 });
    });

    it('应该阻止 180 度反向转向 - 上下', () => {
        const current = { x: 0, y: -1 };
        const newDir = { x: 0, y: 1 };
        expect(handleDirection(current, newDir)).toEqual({ x: 0, y: -1 });
    });
});

describe('parseKeyInput', () => {
    it('应该识别大写键', () => {
        expect(parseKeyInput('W')).toEqual({ x: 0, y: -1 });
        expect(parseKeyInput('S')).toEqual({ x: 0, y: 1 });
        expect(parseKeyInput('A')).toEqual({ x: -1, y: 0 });
        expect(parseKeyInput('D')).toEqual({ x: 1, y: 0 });
    });

    it('应该识别小写键', () => {
        expect(parseKeyInput('w')).toEqual({ x: 0, y: -1 });
        expect(parseKeyInput('s')).toEqual({ x: 0, y: 1 });
        expect(parseKeyInput('a')).toEqual({ x: -1, y: 0 });
        expect(parseKeyInput('d')).toEqual({ x: 1, y: 0 });
    });

    it('应该识别方向键', () => {
        expect(parseKeyInput('ArrowUp')).toEqual({ x: 0, y: -1 });
        expect(parseKeyInput('ArrowDown')).toEqual({ x: 0, y: 1 });
        expect(parseKeyInput('ArrowLeft')).toEqual({ x: -1, y: 0 });
        expect(parseKeyInput('ArrowRight')).toEqual({ x: 1, y: 0 });
    });

    it('无效键应该返回 null', () => {
        expect(parseKeyInput('x')).toBeNull();
        expect(parseKeyInput('1')).toBeNull();
        expect(parseKeyInput('')).toBeNull();
    });
});

// ==================== 位置计算测试 ====================

describe('calculateNewHead', () => {
    it('应该正确计算向右移动', () => {
        expect(calculateNewHead({ x: 5, y: 10 }, { x: 1, y: 0 }))
            .toEqual({ x: 6, y: 10 });
    });

    it('应该正确计算向左移动', () => {
        expect(calculateNewHead({ x: 5, y: 10 }, { x: -1, y: 0 }))
            .toEqual({ x: 4, y: 10 });
    });

    it('应该正确计算向上移动', () => {
        expect(calculateNewHead({ x: 5, y: 10 }, { x: 0, y: -1 }))
            .toEqual({ x: 5, y: 9 });
    });

    it('应该正确计算向下移动', () => {
        expect(calculateNewHead({ x: 5, y: 10 }, { x: 0, y: 1 }))
            .toEqual({ x: 5, y: 11 });
    });
});

// ==================== 碰撞检测测试 ====================

describe('checkWallCollision', () => {
    it('应该检测左墙碰撞', () => {
        expect(checkWallCollision({ x: -1, y: 10 })).toBe(true);
    });

    it('应该检测右墙碰撞', () => {
        expect(checkWallCollision({ x: 20, y: 10 })).toBe(true);
    });

    it('应该检测上墙碰撞', () => {
        expect(checkWallCollision({ x: 10, y: -1 })).toBe(true);
    });

    it('应该检测下墙碰撞', () => {
        expect(checkWallCollision({ x: 10, y: 20 })).toBe(true);
    });

    it('应该允许边界内的位置', () => {
        expect(checkWallCollision({ x: 0, y: 0 })).toBe(false);
        expect(checkWallCollision({ x: 19, y: 19 })).toBe(false);
    });

    it('应该检测边界位置', () => {
        expect(checkWallCollision({ x: 0, y: 10 })).toBe(false);
        expect(checkWallCollision({ x: 19, y: 10 })).toBe(false);
    });
});

describe('checkSelfCollision', () => {
    it('应该检测到蛇身上的碰撞', () => {
        const snakeSet = new Set(['5,10', '4,10', '3,10']);
        expect(checkSelfCollision({ x: 5, y: 10 }, snakeSet)).toBe(true);
    });

    it('应该允许空位置', () => {
        const snakeSet = new Set(['5,10', '4,10']);
        expect(checkSelfCollision({ x: 0, y: 0 }, snakeSet)).toBe(false);
    });

    it('空蛇身应该无碰撞', () => {
        const snakeSet = new Set();
        expect(checkSelfCollision({ x: 5, y: 10 }, snakeSet)).toBe(false);
    });
});

describe('checkFoodCollision', () => {
    it('应该检测到食物碰撞', () => {
        expect(checkFoodCollision({ x: 5, y: 10 }, { x: 5, y: 10 })).toBe(true);
    });

    it('应该允许不同位置', () => {
        expect(checkFoodCollision({ x: 5, y: 10 }, { x: 6, y: 10 })).toBe(false);
    });
});

// ==================== 蛇移动测试 ====================

describe('moveSnake', () => {
    it('应该在不吃食物时保持长度', () => {
        const snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
        const newHead = { x: 6, y: 10 };
        const result = moveSnake(snake, newHead, false);
        expect(result.length).toBe(3);
        expect(result[0]).toEqual({ x: 6, y: 10 });
    });

    it('应该在吃食物时增长', () => {
        const snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
        const newHead = { x: 6, y: 10 };
        const result = moveSnake(snake, newHead, true);
        expect(result.length).toBe(4);
        expect(result[0]).toEqual({ x: 6, y: 10 });
    });

    it('应该处理空蛇身', () => {
        const snake = [];
        const newHead = { x: 6, y: 10 };
        const result = moveSnake(snake, newHead, false);
        expect(result).toEqual([{ x: 6, y: 10 }]);
    });
});

// ==================== 食物生成测试 ====================

describe('spawnFood', () => {
    it('应该生成在蛇身外的位置', () => {
        const snakeSet = new Set(['5,10', '4,10', '3,10']);
        const food = spawnFood(snakeSet, 20, () => 0.5);
        expect(snakeSet.has(`${food.x},${food.y}`)).toBe(false);
    });

    it('应该使用可注入的随机函数', () => {
        const snakeSet = new Set();
        let callCount = 0;
        const mockRandom = () => {
            callCount++;
            return 0.5;
        };
        spawnFood(snakeSet, 20, mockRandom);
        expect(callCount).toBeGreaterThan(0);
    });
});

// ==================== 得分计算测试 ====================

describe('calculateScore', () => {
    it('应该增加 10 分', () => {
        expect(calculateScore(0)).toBe(10);
        expect(calculateScore(10)).toBe(20);
        expect(calculateScore(100)).toBe(110);
    });

    it('应该支持自定义分数', () => {
        expect(calculateScore(0, 20)).toBe(20);
        expect(calculateScore(10, 5)).toBe(15);
    });
});

describe('isNewHighScore', () => {
    it('应该检测到新记录', () => {
        expect(isNewHighScore(100, 50)).toBe(true);
        expect(isNewHighScore(51, 50)).toBe(true);
    });

    it('应该拒绝低于记录的分数', () => {
        expect(isNewHighScore(49, 50)).toBe(false);
        expect(isNewHighScore(0, 50)).toBe(false);
    });

    it('应该拒绝等于记录的分数', () => {
        expect(isNewHighScore(50, 50)).toBe(false);
    });
});

// ==================== 渲染辅助测试 ====================

describe('getEyeOffsets', () => {
    it('应该返回向右的眼睛偏移', () => {
        const offsets = getEyeOffsets({ x: 1, y: 0 });
        expect(offsets.length).toBe(2);
    });

    it('应该返回向左的眼睛偏移', () => {
        const offsets = getEyeOffsets({ x: -1, y: 0 });
        expect(offsets.length).toBe(2);
    });

    it('应该返回向上的眼睛偏移', () => {
        const offsets = getEyeOffsets({ x: 0, y: -1 });
        expect(offsets.length).toBe(2);
    });

    it('应该返回向下的眼睛偏移', () => {
        const offsets = getEyeOffsets({ x: 0, y: 1 });
        expect(offsets.length).toBe(2);
    });

    it('无效方向应该返回空数组', () => {
        expect(getEyeOffsets({ x: 0, y: 0 })).toEqual([]);
    });
});

// ==================== 游戏状态测试 ====================

describe('GameState', () => {
    it('应该正确初始化', () => {
        const state = new GameState();
        expect(state.snake.length).toBe(3);
        expect(state.score).toBe(0);
        expect(state.isPaused).toBe(false);
        expect(state.isGameOver).toBe(false);
    });

    it('应该正确重置', () => {
        const state = new GameState();
        state.score = 100;
        state.isGameOver = true;
        state.reset();
        expect(state.score).toBe(0);
        expect(state.isGameOver).toBe(false);
    });

    it('应该更新蛇身 Set', () => {
        const state = new GameState();
        expect(state.snakeSet.has('5,10')).toBe(true);
        expect(state.snakeSet.has('4,10')).toBe(true);
        expect(state.snakeSet.has('3,10')).toBe(true);
    });
});

// ==================== 游戏更新测试 ====================

describe('gameUpdate', () => {
    it('暂停时应该不更新', () => {
        const state = new GameState();
        state.isPaused = true;
        const result = gameUpdate(state);
        expect(result.moved).toBe(false);
    });

    it('游戏结束时应该不更新', () => {
        const state = new GameState();
        state.isGameOver = true;
        const result = gameUpdate(state);
        expect(result.moved).toBe(false);
    });

    it('应该正常移动', () => {
        const state = new GameState();
        state.food = { x: 100, y: 100 }; // 远离蛇
        const result = gameUpdate(state);
        expect(result.moved).toBe(true);
        expect(result.collision).toBe(false);
    });

    it('吃到食物应该增长', () => {
        const state = new GameState();
        state.food = { x: 6, y: 10 }; // 蛇头前方
        const result = gameUpdate(state);
        expect(result.ate).toBe(true);
        expect(state.snake.length).toBe(4);
    });

    it('撞墙应该结束游戏', () => {
        const state = new GameState();
        state.snake = [{ x: 0, y: 10 }]; // 贴近左墙
        state.direction = { x: -1, y: 0 }; // 向左
        state.nextDirection = { x: -1, y: 0 };
        state.updateSnakeSet();
        const result = gameUpdate(state);
        expect(result.collision).toBe(true);
        expect(state.isGameOver).toBe(true);
    });

    it('撞自己应该结束游戏', () => {
        const state = new GameState();
        state.snake = [
            { x: 5, y: 10 },
            { x: 5, y: 11 },
            { x: 4, y: 11 },
            { x: 4, y: 10 }
        ];
        state.direction = { x: 0, y: 1 }; // 向下，会撞到自己
        state.nextDirection = { x: 0, y: 1 };
        state.updateSnakeSet();
        const result = gameUpdate(state);
        expect(result.collision).toBe(true);
        expect(state.isGameOver).toBe(true);
    });
});

// ==================== 暂停和难度测试 ====================

describe('togglePause', () => {
    it('应该切换暂停状态', () => {
        const state = new GameState();
        expect(state.isPaused).toBe(false);
        togglePause(state);
        expect(state.isPaused).toBe(true);
        togglePause(state);
        expect(state.isPaused).toBe(false);
    });
});

describe('changeDifficulty', () => {
    it('应该改变速度', () => {
        const state = new GameState();
        expect(changeDifficulty(state, 'easy')).toBe(200);
        expect(changeDifficulty(state, 'medium')).toBe(150);
        expect(changeDifficulty(state, 'hard')).toBe(100);
    });

    it('无效难度应该保持当前速度', () => {
        const state = new GameState();
        const current = state.currentSpeed;
        expect(changeDifficulty(state, 'invalid')).toBe(current);
    });
});
