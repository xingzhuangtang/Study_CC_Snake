/**
 * 简易测试工具 - 不依赖外部框架
 * 支持 Node.js 原生 ESM 运行
 */

let passed = 0;
let failed = 0;
let currentSuite = '';

export function describe(name, fn) {
    currentSuite = name;
    fn();
}

export function it(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (error) {
        failed++;
        console.log(`  ✗ ${name}`);
        console.log(`    Error: ${error.message}`);
    }
}

export function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${expected} but got ${actual}`);
            }
        },
        toEqual(expected) {
            const actualStr = JSON.stringify(actual);
            const expectedStr = JSON.stringify(expected);
            if (actualStr !== expectedStr) {
                throw new Error(`Expected ${expectedStr} but got ${actualStr}`);
            }
        },
        toBeNull() {
            if (actual !== null) {
                throw new Error(`Expected null but got ${actual}`);
            }
        },
        toBeTruthy() {
            if (!actual) {
                throw new Error(`Expected truthy value but got ${actual}`);
            }
        },
        toBeFalse() {
            if (actual !== false) {
                throw new Error(`Expected false but got ${actual}`);
            }
        },
        toBeGreaterThan(expected) {
            if (actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        }
    };
}

export function runTests() {
    console.log('\n=== Test Results ===');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total:  ${passed + failed}\n`);
    process.exit(failed > 0 ? 1 : 0);
}
