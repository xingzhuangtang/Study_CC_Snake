#!/usr/bin/env node
/**
 * 测试运行脚本
 * 运行：node tests/run-tests.js
 */

import { runTests } from './test-utils.js';

// 导入所有测试文件
await import('./game.test.js');

// 输出结果
runTests();
