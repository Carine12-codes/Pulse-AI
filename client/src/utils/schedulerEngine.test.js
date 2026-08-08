import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateWorkloadDensity,
  detectBottlenecks,
  reprioritizeQueue
} from './schedulerEngine.js';

describe('Pulse AI Client Scheduler Engine - Unit Tests', () => {

  it('calculateWorkloadDensity: builds 7-day workload map accurately', () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', due_date: '2026-08-10', effort_hours: 5.0, grade_weight: 10 },
      { id: '2', title: 'Task 2', due_date: '2026-08-10', effort_hours: 4.0, grade_weight: 15 }
    ];

    const density = calculateWorkloadDensity(mockTasks, 7.0, 7);
    assert.equal(density.length, 7, 'Should return 7 days of audit');
    
    const dayWithTasks = density.find(d => d.date === '2026-08-10');
    if (dayWithTasks) {
      assert.equal(dayWithTasks.totalHours, 9.0, 'Total hours for Aug 10 should be 9.0');
      assert.equal(dayWithTasks.isBottleneck, true, '9.0h should trigger bottleneck flag (> 7.0h)');
    }
  });

  it('detectBottlenecks: filters only days exceeding capacity limit', () => {
    const mockTasks = [
      { id: '1', title: 'Heavy Exam', due_date: '2026-08-12', effort_hours: 12.0, grade_weight: 20 }
    ];

    const bottlenecks = detectBottlenecks(mockTasks, 7.0);
    assert.ok(bottlenecks.length > 0, 'Should return bottleneck for 12.0h task');
    assert.equal(bottlenecks[0].overloadAmount, 5.0, 'Overload amount should be 5.0h');
  });

  it('reprioritizeQueue: orders tasks by priority score descending', () => {
    const tasks = [
      { id: 'a', title: 'Task A', grade_weight: 5, due_date: '2026-08-15', effort_hours: 2 },
      { id: 'b', title: 'Task B', grade_weight: 30, due_date: '2026-08-09', effort_hours: 10 }
    ];

    const sorted = reprioritizeQueue(tasks);
    assert.equal(sorted[0].id, 'b', 'Task B with 30% weight & earlier due date should be #1');
  });

});
