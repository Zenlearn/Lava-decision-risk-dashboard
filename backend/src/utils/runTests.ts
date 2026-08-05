import { computeScorecardMetrics } from './kpiFormulas';
import assert from 'assert';

function testCPC() {
    const mockRows = [
      { cpcPartVal: 1000, isReplacement: false, handsetVal: 15000 },
      { cpcPartVal: 0, isReplacement: true, handsetVal: 15000 },
      { cpcPartVal: 0, isReplacement: false, handsetVal: 15000 }
    ];
    const metrics = computeScorecardMetrics(mockRows);
    assert.strictEqual(metrics.cpc, 5333, `Expected CPC to be 5333, got ${metrics.cpc}`);
    console.log('✅ CPC test passed');
}

function testTAT() {
    const mockRows = [ { tat: 0 }, { tat: 1 }, { tat: 2 }, { tat: null } ];
    const metrics = computeScorecardMetrics(mockRows);
    assert.strictEqual(metrics.tatPct, 66.7, `Expected TAT to be 66.7, got ${metrics.tatPct}`);
    console.log('✅ TAT test passed');
}

function testSAH() {
    const mockRows = [ { isHome: true, tat: 1 }, { isHome: true, tat: 3 }, { isHome: true, tat: 5 }, { isHome: false, tat: 1 } ];
    const metrics = computeScorecardMetrics(mockRows);
    assert.strictEqual(metrics.sahPct, 66.7, `Expected SAH to be 66.7, got ${metrics.sahPct}`);
    console.log('✅ SAH test passed');
}

function testCAG() {
    const mockRows = [
      { processScore: 100, skillScore: 100, auditScore: 100 },
      { processScore: 85, skillScore: 100, auditScore: 65 }
    ];
    const metrics = computeScorecardMetrics(mockRows);
    assert.strictEqual(metrics.cagPct, 91.7, `Expected CAG to be 91.7, got ${metrics.cagPct}`);
    console.log('✅ CAG test passed');
}

testCPC();
testTAT();
testSAH();
testCAG();
console.log('All tests passed!');
