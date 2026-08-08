import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Check if DATABASE_URL is available
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/autostudy';

let pool = null;
let isPostgresConnected = false;

// In-Memory Fallback Store (ensures full functionality even if local Postgres is offline)
export const inMemoryStore = {
  courses: [
    { id: 'cs162', code: 'CS 162', name: 'Operating Systems & System Programming', instructor: 'Prof. Thomas Anderson', email: 'tanderson@berkeley.edu', color: '#8B5CF6' },
    { id: 'cs182', code: 'CS 182', name: 'Deep Neural Networks & Machine Learning', instructor: 'Prof. Elena Rostova', email: 'erostova@berkeley.edu', color: '#3B82F6' },
    { id: 'math104', code: 'MATH 104', name: 'Introduction to Real Analysis', instructor: 'Prof. David Hilbert', email: 'dhilbert@berkeley.edu', color: '#10B981' },
    { id: 'econ101', code: 'ECON 101', name: 'Advanced Microeconomic Theory', instructor: 'Prof. Sarah Jenkins', email: 'sjenkins@berkeley.edu', color: '#F59E0B' }
  ],
  tasks: [
    {
      id: 'task-101',
      course_id: 'cs162',
      course_code: 'CS 162',
      title: 'Pintos Project 2: User Programs & Syscalls',
      deliverable_type: 'Coding Project',
      due_date: getRelativeDate(3),
      effort_hours: 14.5,
      grade_weight: 15.0,
      hard_deadline: true,
      status: 'In Progress',
      priority_score: 94,
      parsed_from: 'Canvas Announcement: Pintos Project 2 hard deadline in 3 days.',
      description: 'Implement exec, wait, read, write syscalls and argument passing in Pintos kernel.'
    },
    {
      id: 'task-102',
      course_id: 'cs182',
      course_code: 'CS 182',
      title: 'Transformer Architecture & Attention Lab',
      deliverable_type: 'Coding Lab + Report',
      due_date: getRelativeDate(3),
      effort_hours: 9.0,
      grade_weight: 10.0,
      hard_deadline: false,
      status: 'Pending',
      priority_score: 88,
      parsed_from: 'Piazza Post @412: Lab 4 multi-head attention due Thursday.',
      description: 'Build multi-head attention from scratch in PyTorch + 4-page report.'
    },
    {
      id: 'task-103',
      course_id: 'math104',
      course_code: 'MATH 104',
      title: 'Problem Set 6: Compact Sets & Metric Spaces',
      deliverable_type: 'Math Proofs',
      due_date: getRelativeDate(4),
      effort_hours: 6.5,
      grade_weight: 5.0,
      hard_deadline: true,
      status: 'Pending',
      priority_score: 72,
      parsed_from: 'Course Website: Homework 6 due Friday 5 PM.',
      description: 'Complete problems 12-18 on Heine-Borel theorem and open covers.'
    },
    {
      id: 'task-104',
      course_id: 'econ101',
      course_code: 'ECON 101',
      title: 'Game Theory Policy Case Study',
      deliverable_type: 'Essay',
      due_date: getRelativeDate(6),
      effort_hours: 5.0,
      grade_weight: 8.0,
      hard_deadline: false,
      status: 'Pending',
      priority_score: 61,
      parsed_from: 'Syllabus: Case Study 2 due end of Week 7.',
      description: 'Analyze Nash Equilibria in modern oligopoly market interventions.'
    }
  ],
  announcements: [],
  bottlenecks: [],
  extension_emails: [],
  agent_logs: []
};

function getRelativeDate(daysFromToday) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().split('T')[0];
}

// Try connecting to PostgreSQL
try {
  pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 3000
  });

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.warn('⚠️ PostgreSQL Connection Info: Using In-Memory Store (DB URL not accessible or offline)');
      isPostgresConnected = false;
    } else {
      console.log('✅ PostgreSQL Connected successfully via pg pool!');
      isPostgresConnected = true;
      initDbTables();
    }
  });
} catch (error) {
  console.warn('⚠️ PostgreSQL Client Pool Initialization Error:', error.message);
  isPostgresConnected = false;
}

async function initDbTables() {
  if (!isPostgresConnected || !pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        instructor VARCHAR(100),
        email VARCHAR(100),
        color VARCHAR(20)
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(50) PRIMARY KEY,
        course_id VARCHAR(50) REFERENCES courses(id) ON DELETE SET NULL,
        course_code VARCHAR(20),
        title VARCHAR(255) NOT NULL,
        deliverable_type VARCHAR(100),
        due_date VARCHAR(20),
        effort_hours NUMERIC(4, 1),
        grade_weight NUMERIC(4, 1),
        hard_deadline BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'Pending',
        priority_score INT DEFAULT 50,
        parsed_from TEXT,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255),
        source VARCHAR(100),
        course_code VARCHAR(20),
        content TEXT,
        parsed_json JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_logs (
        id VARCHAR(50) PRIMARY KEY,
        action_type VARCHAR(50),
        message TEXT,
        metadata JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ PostgreSQL Tables initialized successfully.');
  } catch (err) {
    console.error('Error creating PostgreSQL tables:', err.message);
  }
}

export function getPool() {
  return pool;
}

export function isDbConnected() {
  return isPostgresConnected;
}
