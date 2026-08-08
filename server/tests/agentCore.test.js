import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  auditWorkloadDensity,
  reprioritizeTaskQueue,
  generateExtensionEmailForBottleneck,
  parseAnnouncementWithAgent
} from '../agentCore.js';

import { INITIAL_TASKS, INITIAL_COURSES } from '../../client/src/data/initialData.js';

describe('Pulse AI Agent Core - Unit & Integration Test Suite', () => {

  it('1. auditWorkloadDensity: accurately calculates daily density and detects bottlenecks', () => {
    const tasks = [
      {
        id: 't1',
        title: 'Pintos OS Kernel Project',
        due_date: '2026-08-11',
        effort_hours: 14.5,
        grade_weight: 15.0,
        status: 'Pending'
      },
      {
        id: 't2',
        title: 'Deep Learning Transformer Lab',
        due_date: '2026-08-11',
        effort_hours: 9.0,
        grade_weight: 10.0,
        status: 'Pending'
      }
    ];

    const audit = auditWorkloadDensity(tasks, 7.0);

    assert.ok(Array.isArray(audit.dailyDensity), 'dailyDensity should be an array');
    assert.ok(audit.bottlenecks.length > 0, 'Should detect bottleneck when total hours (23.5h) exceed 7.0h limit');
    
    const peakBottleneck = audit.bottlenecks[0];
    assert.equal(peakBottleneck.date, '2026-08-11');
    assert.equal(peakBottleneck.totalHours, 23.5);
    assert.equal(peakBottleneck.overloadAmount, 16.5);
  });

  it('2. reprioritizeTaskQueue: topologically sorts tasks by urgency, weight, and effort', () => {
    const rawTasks = [
      { id: 'low', title: 'Minor Homework', grade_weight: 2.0, due_date: '2026-08-20', effort_hours: 2.0 },
      { id: 'high', title: 'Final Project', grade_weight: 25.0, due_date: '2026-08-10', effort_hours: 15.0, hard_deadline: true }
    ];

    const sorted = reprioritizeTaskQueue(rawTasks);

    assert.equal(sorted[0].id, 'high', 'Highest weight and urgent task should be ranked #1');
    assert.ok(sorted[0].priority_score > sorted[1].priority_score, 'Rank #1 task should have higher priority score');
  });

  it('3. generateExtensionEmailForBottleneck: drafts polite, formal email with workload evidence', () => {
    const bottleneck = {
      date: '2026-08-11',
      dayLabel: 'Tue, Aug 11',
      totalHours: 23.5,
      overloadAmount: 16.5,
      tasks: INITIAL_TASKS
    };

    const targetTask = INITIAL_TASKS[0];
    const course = INITIAL_COURSES[0];

    const email = generateExtensionEmailForBottleneck(bottleneck, targetTask, course, 'Alex Rivera');

    assert.ok(email.subject.includes('CS 162'), 'Subject should contain course code');
    assert.ok(email.body.includes('Alex Rivera'), 'Body should contain student name');
    assert.ok(email.body.includes('23.5'), 'Body should contain evidence of total effort hours');
    assert.equal(email.status, 'Drafted');
  });

  it('4. parseAnnouncementWithAgent: extracts metadata from unstructured announcement text', async () => {
    const sampleAnnouncement = 'CS 182 Announcement: Transformer Architecture lab is due in 3 days. Estimated 9 hours of PyTorch coding, counts for 10% of final grade.';
    
    const parsed = await parseAnnouncementWithAgent(sampleAnnouncement);

    assert.ok(parsed.title, 'Parsed task should have a title');
    assert.equal(parsed.course_code, 'CS 182', 'Should extract course code CS 182');
    assert.ok(parsed.effort_hours >= 8.0, 'Should estimate effort hours');
    assert.equal(parsed.status, 'Pending');
  });

});
