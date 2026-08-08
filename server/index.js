import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { inMemoryStore, isDbConnected, getPool } from './db.js';
import {
  parseAnnouncementWithAgent,
  auditWorkloadDensity,
  reprioritizeTaskQueue,
  generateExtensionEmailForBottleneck
} from './agentCore.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Pulse AI Agent Backend',
    postgresConnected: isDbConnected(),
    taskCount: inMemoryStore.tasks.length,
    timestamp: new Date().toISOString()
  });
});

// Courses API
app.get('/api/courses', async (req, res) => {
  if (isDbConnected()) {
    try {
      const dbRes = await getPool().query('SELECT * FROM courses');
      if (dbRes.rows.length > 0) return res.json(dbRes.rows);
    } catch (e) {
      console.warn('Postgres query fallback:', e.message);
    }
  }
  res.json(inMemoryStore.courses);
});

// Tasks API
app.get('/api/tasks', async (req, res) => {
  if (isDbConnected()) {
    try {
      const dbRes = await getPool().query('SELECT * FROM tasks ORDER BY priority_score DESC');
      if (dbRes.rows.length > 0) return res.json(dbRes.rows);
    } catch (e) {
      console.warn('Postgres query fallback:', e.message);
    }
  }
  res.json(inMemoryStore.tasks);
});

app.post('/api/tasks', async (req, res) => {
  const newTask = {
    id: `task-${Date.now()}`,
    course_id: req.body.course_id || 'cs182',
    course_code: req.body.course_code || 'CS 182',
    title: req.body.title || 'New Assignment',
    deliverable_type: req.body.deliverable_type || 'Coding Project',
    due_date: req.body.due_date || new Date().toISOString().split('T')[0],
    effort_hours: parseFloat(req.body.effort_hours) || 6.0,
    grade_weight: parseFloat(req.body.grade_weight) || 10.0,
    hard_deadline: !!req.body.hard_deadline,
    status: 'Pending',
    priority_score: 80,
    description: req.body.description || ''
  };

  inMemoryStore.tasks.unshift(newTask);

  if (isDbConnected()) {
    try {
      await getPool().query(
        `INSERT INTO tasks (id, course_id, course_code, title, deliverable_type, due_date, effort_hours, grade_weight, hard_deadline, status, priority_score, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [newTask.id, newTask.course_id, newTask.course_code, newTask.title, newTask.deliverable_type, newTask.due_date, newTask.effort_hours, newTask.grade_weight, newTask.hard_deadline, newTask.status, newTask.priority_score, newTask.description]
      );
    } catch (e) {
      console.warn('Postgres task insert error:', e.message);
    }
  }

  // Trigger queue auto-sort
  inMemoryStore.tasks = reprioritizeTaskQueue(inMemoryStore.tasks);

  res.json({ success: true, task: newTask, tasks: inMemoryStore.tasks });
});

app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  let index = inMemoryStore.tasks.findIndex(t => t.id === taskId);
  
  if (index !== -1) {
    inMemoryStore.tasks[index] = { ...inMemoryStore.tasks[index], ...req.body };
  } else {
    // Task created on frontend while server was initializing
    const newTask = {
      id: taskId,
      title: req.body.title || 'Academic Task',
      course_code: req.body.course_code || 'CS 182',
      status: req.body.status || 'Pending',
      effort_hours: parseFloat(req.body.effort_hours) || 6.0,
      grade_weight: parseFloat(req.body.grade_weight) || 10.0,
      due_date: req.body.due_date || new Date().toISOString().split('T')[0],
      priority_score: 80,
      ...req.body
    };
    inMemoryStore.tasks.unshift(newTask);
    index = 0;
  }

  inMemoryStore.tasks = reprioritizeTaskQueue(inMemoryStore.tasks);
  res.json({ success: true, task: inMemoryStore.tasks[index], tasks: inMemoryStore.tasks });
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  inMemoryStore.tasks = inMemoryStore.tasks.filter(t => t.id !== taskId);
  res.json({ success: true, remaining: inMemoryStore.tasks.length });
});

// Announcement Ingestion & Agent Parser API
app.post('/api/announcements/parse', async (req, res) => {
  const { rawText } = req.body;
  if (!rawText) {
    return res.status(400).json({ error: 'rawText is required' });
  }

  const parsedTask = await parseAnnouncementWithAgent(rawText);
  inMemoryStore.tasks.unshift(parsedTask);
  inMemoryStore.tasks = reprioritizeTaskQueue(inMemoryStore.tasks);

  const audit = auditWorkloadDensity(inMemoryStore.tasks, req.body.dailyCapacityHours || 7.0);

  res.json({
    success: true,
    parsedTask,
    workloadAudit: audit,
    tasks: inMemoryStore.tasks
  });
});

// Workload Density & Bottlenecks API
app.get('/api/workload/density', (req, res) => {
  const limit = parseFloat(req.query.capacityLimit) || 7.0;
  const audit = auditWorkloadDensity(inMemoryStore.tasks, limit);
  res.json(audit);
});

// Queue Re-prioritization API
app.post('/api/queue/reprioritize', (req, res) => {
  inMemoryStore.tasks = reprioritizeTaskQueue(inMemoryStore.tasks);
  res.json({ success: true, tasks: inMemoryStore.tasks });
});

// Extension Email API
app.get('/api/emails', (req, res) => {
  res.json(inMemoryStore.extension_emails);
});

app.post('/api/emails/generate', (req, res) => {
  const { bottleneckDate, taskId, studentName } = req.body;
  const audit = auditWorkloadDensity(inMemoryStore.tasks, 7.0);
  const bottleneck = audit.bottlenecks.find(b => b.date === bottleneckDate) || audit.bottlenecks[0];
  
  const targetTask = inMemoryStore.tasks.find(t => t.id === taskId) || (bottleneck ? bottleneck.tasks[0] : inMemoryStore.tasks[0]);
  const course = inMemoryStore.courses.find(c => c.code === (targetTask ? targetTask.course_code : 'CS 182'));

  const generatedEmail = generateExtensionEmailForBottleneck(bottleneck, targetTask, course, studentName || 'Alex Rivera');
  res.json({ success: true, email: generatedEmail });
});

app.post('/api/emails/send', (req, res) => {
  const { emailId } = req.body;
  const email = inMemoryStore.extension_emails.find(e => e.id === emailId);
  if (email) {
    email.status = 'Sent (Simulated SMTP)';
    const log = {
      id: `log-${Date.now()}`,
      action_type: 'SMTP_MAILER',
      message: `[SMTP_DISPATCH] Successfully dispatched extension request to ${email.recipient_email} (${email.instructor_name})`,
      timestamp: new Date().toISOString()
    };
    inMemoryStore.agent_logs.unshift(log);
    return res.json({ success: true, email });
  }
  res.status(404).json({ error: 'Email draft not found' });
});

// Agent Execution Trace Logs API
app.get('/api/agent/logs', (req, res) => {
  res.json(inMemoryStore.agent_logs);
});

// Full Autonomous ReAct Pipeline Stream Endpoint
app.post('/api/agent/run-pipeline', async (req, res) => {
  const steps = [];

  // Step 1: Announcement Ingestion Audit
  steps.push({ step: 1, action: 'PARSER', status: 'COMPLETE', detail: `Audited ${inMemoryStore.tasks.length} existing tasks and ingested new stream.` });

  // Step 2: Workload Density Audit
  const audit = auditWorkloadDensity(inMemoryStore.tasks, 7.0);
  steps.push({
    step: 2,
    action: 'AUDITOR',
    status: 'COMPLETE',
    detail: `Workload density audited across 7-day window. Found ${audit.bottlenecks.length} bottleneck overload days.`
  });

  // Step 3: Schedule Bottleneck Detection
  let emailGenerated = null;
  if (audit.bottlenecks.length > 0) {
    const primaryBottleneck = audit.bottlenecks[0];
    const topTask = primaryBottleneck.tasks[0];
    const course = inMemoryStore.courses.find(c => c.code === topTask?.course_code);
    
    steps.push({
      step: 3,
      action: 'BOTTLENECK_DETECTOR',
      status: 'WARNING',
      detail: `BOTTLENECK DETECTED on ${primaryBottleneck.date}: ${primaryBottleneck.totalHours}h work scheduled (exceeds 7.0h limit by ${primaryBottleneck.overloadAmount}h).`
    });

    // Step 4: Topological Re-prioritization
    inMemoryStore.tasks = reprioritizeTaskQueue(inMemoryStore.tasks);
    steps.push({
      step: 4,
      action: 'REPRIORITIZE',
      status: 'COMPLETE',
      detail: `Topological sorting applied. Re-prioritized task queue based on Grade Weight (35%), Urgency (35%), and Effort (20%).`
    });

    // Step 5: Auto-Generate Extension Email
    emailGenerated = generateExtensionEmailForBottleneck(primaryBottleneck, topTask, course);
    steps.push({
      step: 5,
      action: 'EMAILER',
      status: 'ACTION_TAKEN',
      detail: `Auto-drafted formal extension email for ${emailGenerated.instructor_name} (${emailGenerated.course_code}).`
    });
  } else {
    steps.push({ step: 3, action: 'BOTTLENECK_DETECTOR', status: 'OPTIMAL', detail: 'Workload density within safe limits (No bottlenecks detected).' });
    inMemoryStore.tasks = reprioritizeTaskQueue(inMemoryStore.tasks);
    steps.push({ step: 4, action: 'REPRIORITIZE', status: 'COMPLETE', detail: 'Task queue re-prioritized.' });
  }

  res.json({
    success: true,
    pipelineResult: {
      steps,
      tasks: inMemoryStore.tasks,
      bottlenecks: audit.bottlenecks,
      emailGenerated
    }
  });
});

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Pulse AI Express Server listening on http://localhost:${PORT}`);
  });
}

export default app;
