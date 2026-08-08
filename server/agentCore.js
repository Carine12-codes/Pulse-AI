import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { inMemoryStore, isDbConnected, getPool } from './db.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || '';
let genAI = null;
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn('Google Generative AI client initialization notice:', err.message);
  }
}

/**
 * Parses unstructured announcements using Antigravity NLP / Gemini logic with heuristic fallback.
 */
export async function parseAnnouncementWithAgent(rawText) {
  const logEntry = {
    id: `log-${Date.now()}`,
    action_type: 'PARSER',
    message: `Inbound announcement ingestion: "${rawText.substring(0, 45)}..."`,
    timestamp: new Date().toISOString()
  };
  inMemoryStore.agent_logs.unshift(logEntry);

  let parsed = null;

  // Try Gemini API if key is present
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      const prompt = `You are an academic NLP parser inside Pulse AI. Extract JSON metadata from this announcement text:
Text: "${rawText}"

Return JSON matching:
{
  "courseCode": "CS 182",
  "title": "Assignment Title",
  "dueDateDays": 3,
  "effortHours": 9.5,
  "gradeWeight": 10.0,
  "hardDeadline": true,
  "deliverableType": "Coding Lab"
}`;

      const response = await model.generateContent(prompt);
      const textRes = response.response.text();
      const jsonMatch = textRes.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const json = JSON.parse(jsonMatch[0]);
        const d = new Date();
        d.setDate(d.getDate() + (json.dueDateDays || 3));
        parsed = {
          id: `task-${Date.now()}`,
          course_id: json.courseCode ? json.courseCode.toLowerCase().replace(/\s+/g, '') : 'cs182',
          course_code: json.courseCode || 'CS 182',
          title: json.title || 'Parsed Assignment',
          deliverable_type: json.deliverableType || 'Assignment',
          due_date: d.toISOString().split('T')[0],
          effort_hours: parseFloat(json.effortHours) || 8.0,
          grade_weight: parseFloat(json.gradeWeight) || 10.0,
          hard_deadline: !!json.hardDeadline,
          status: 'Pending',
          priority_score: 85,
          parsed_from: rawText.substring(0, 100) + '...',
          description: rawText.substring(0, 150)
        };
      }
    } catch (e) {
      console.warn('Agent API fallback to heuristic parser:', e.message);
    }
  }

  // Heuristic Fallback Parser if API is offline or returns empty
  if (!parsed) {
    const courseMatch = rawText.match(/(?:CS|MATH|ECON|PHYS|ENG|CHEM|BIO|STAT)\s?\d{2,3}[A-Z]?/i);
    const courseCode = courseMatch ? courseMatch[0].toUpperCase() : 'CS 182';

    let effort = 7.5;
    const effortMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(?:hours|hrs|hr)/i);
    if (effortMatch) effort = parseFloat(effortMatch[1]);
    else if (/heavy|diffusion|kernel|project|lab/i.test(rawText)) effort = 11.0;

    let weight = 10.0;
    const weightMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)/i);
    if (weightMatch) weight = parseFloat(weightMatch[1]);

    const isHard = /hard deadline|strict|no extensions|penalty|midnight/i.test(rawText);

    let days = 3;
    if (/tomorrow/i.test(rawText)) days = 1;
    else if (/friday/i.test(rawText)) days = 4;
    else if (/next week/i.test(rawText)) days = 6;

    const d = new Date();
    d.setDate(d.getDate() + days);

    parsed = {
      id: `task-${Date.now()}`,
      course_id: courseCode.toLowerCase().replace(/\s+/g, ''),
      course_code: courseCode,
      title: `${courseCode} Deliverable: ${rawText.split('\n')[0].substring(0, 35)}...`,
      deliverable_type: /coding|pytorch|code/i.test(rawText) ? 'Coding Lab' : 'Math/Report',
      due_date: d.toISOString().split('T')[0],
      effort_hours: effort,
      grade_weight: weight,
      hard_deadline: isHard,
      status: 'Pending',
      priority_score: 82,
      parsed_from: rawText.substring(0, 100) + '...',
      description: rawText
    };
  }

  const successLog = {
    id: `log-${Date.now() + 1}`,
    action_type: 'PARSER',
    message: `[EXTRACTED] ${parsed.course_code}: "${parsed.title}" (${parsed.effort_hours}h, ${parsed.grade_weight}% weight, Due: ${parsed.due_date})`,
    timestamp: new Date().toISOString()
  };
  inMemoryStore.agent_logs.unshift(successLog);

  return parsed;
}

/**
 * Calculates Workload Density and identifies schedule bottlenecks.
 */
export function auditWorkloadDensity(tasks, capacityLimit = 7.0) {
  const density = {};
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    density[dateStr] = { date: dateStr, dayLabel, totalHours: 0, capacityLimit, tasks: [], isBottleneck: false };
  }

  tasks.forEach(task => {
    if (task.status === 'Completed') return;
    if (density[task.due_date]) {
      density[task.due_date].totalHours += parseFloat(task.effort_hours || 0);
      density[task.due_date].tasks.push(task);
    }
  });

  const bottlenecks = [];
  Object.values(density).forEach(day => {
    if (day.totalHours > capacityLimit) {
      day.isBottleneck = true;
      day.overloadAmount = parseFloat((day.totalHours - capacityLimit).toFixed(1));
      bottlenecks.push(day);
    }
  });

  return { dailyDensity: Object.values(density), bottlenecks };
}

/**
 * Re-prioritizes task queue topologically.
 */
export function reprioritizeTaskQueue(tasks) {
  const sorted = [...tasks].map(task => {
    const today = new Date();
    const due = new Date(task.due_date);
    const diffDays = Math.max(0, Math.ceil((due - today) / (1000 * 60 * 60 * 24)));
    
    let urgency = Math.max(5, 40 - diffDays * 6);
    let weight = Math.min(35, (task.grade_weight || 5) * 2.2);
    let effort = Math.min(15, (task.effort_hours || 4) * 1.0);
    let hard = task.hard_deadline ? 10 : 0;

    const priorityScore = Math.min(100, Math.round(urgency + weight + effort + hard));
    return { ...task, priority_score: priorityScore };
  }).sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

  const log = {
    id: `log-${Date.now()}`,
    action_type: 'REPRIORITIZE',
    message: `[QUEUE_SORTER] Topological re-sorting complete. Top priority: ${sorted[0]?.title || 'None'} (Score: ${sorted[0]?.priority_score})`,
    timestamp: new Date().toISOString()
  };
  inMemoryStore.agent_logs.unshift(log);

  return sorted;
}

/**
 * Auto-generates extension request email when bottleneck is detected.
 */
export function generateExtensionEmailForBottleneck(bottleneck, primaryTask, course, studentName = "Alex Rivera") {
  const instructor = course ? course.instructor : 'Professor';
  const courseCode = course ? course.code : (primaryTask ? primaryTask.course_code : 'Course');
  const taskTitle = primaryTask ? primaryTask.title : 'Deliverable';

  const dateStr = bottleneck && bottleneck.date ? bottleneck.date : new Date().toISOString().split('T')[0];
  const totalHrs = bottleneck && typeof bottleneck.totalHours === 'number' ? bottleneck.totalHours : (bottleneck && typeof bottleneck.total_hours === 'number' ? bottleneck.total_hours : 14.5);
  const safeLimit = bottleneck && typeof bottleneck.capacityLimit === 'number' ? bottleneck.capacityLimit : 7.0;

  const extDate = new Date(dateStr);
  extDate.setDate(extDate.getDate() + 2);
  const proposedDateStr = extDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const subject = `Extension Request: ${courseCode} - ${taskTitle} [${studentName}]`;

  const body = `Dear ${instructor},

I hope this message finds you well.

I am reaching out to request a 48-hour extension for ${taskTitle}, currently scheduled for submission on ${dateStr}.

My autonomous workload density auditor detected a critical schedule bottleneck on ${dateStr}, where my combined core engineering workload reaches ${totalHrs.toFixed(1)} hours of intensive effort across concurrent deliverables—exceeding my safe daily capacity limit of ${safeLimit.toFixed(1)} hours.

Current Progress Summary:
• Core research & algorithm specification finalized
• 65% of implementation & PyTorch codebase completed
• Model evaluation and test suites currently executing

A brief extension to ${proposedDateStr} would allow me to thoroughly refine performance benchmarks and deliver work adhering to the highest standards of ${courseCode}.

Thank you for your time and guidance.

Best regards,
${studentName}
Department of Electrical Engineering & Computer Sciences
UC Berkeley | Student ID: #30358912`;

  const emailObj = {
    id: `email-${Date.now()}`,
    task_id: primaryTask ? primaryTask.id : null,
    recipient_email: course ? course.email : 'instructor@berkeley.edu',
    instructor_name: instructor,
    course_code: courseCode,
    subject,
    body,
    status: 'Drafted',
    created_at: new Date().toISOString()
  };

  inMemoryStore.extension_emails.unshift(emailObj);

  const log = {
    id: `log-${Date.now()}`,
    action_type: 'EMAILER',
    message: `[EMAIL_AUTO_GEN] Auto-drafted extension request for ${instructor} (${courseCode}) due to ${totalHrs}h bottleneck on ${dateStr}`,
    timestamp: new Date().toISOString()
  };
  inMemoryStore.agent_logs.unshift(log);

  return emailObj;
}
