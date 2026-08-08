// Initial mock data for AutoStudy AI client

export const INITIAL_COURSES = [
  {
    id: 'cs162',
    code: 'CS 162',
    name: 'Operating Systems & System Programming',
    instructor: 'Prof. Thomas Anderson',
    email: 'tanderson@berkeley.edu',
    color: '#8B5CF6',
  },
  {
    id: 'cs182',
    code: 'CS 182',
    name: 'Deep Neural Networks & Machine Learning',
    instructor: 'Prof. Elena Rostova',
    email: 'erostova@berkeley.edu',
    color: '#3B82F6',
  },
  {
    id: 'math104',
    code: 'MATH 104',
    name: 'Introduction to Real Analysis',
    instructor: 'Prof. David Hilbert',
    email: 'dhilbert@berkeley.edu',
    color: '#10B981',
  },
  {
    id: 'econ101',
    code: 'ECON 101',
    name: 'Advanced Microeconomic Theory',
    instructor: 'Prof. Sarah Jenkins',
    email: 'sjenkins@berkeley.edu',
    color: '#F59E0B',
  },
];

const getRelativeDate = (daysFromToday) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS = [
  {
    id: 'task-101',
    courseId: 'cs162',
    course_code: 'CS 162',
    title: 'Pintos Project 2: User Programs & Syscalls',
    deliverable_type: 'Coding Project',
    due_date: getRelativeDate(3),
    effort_hours: 14.5,
    grade_weight: 15.0,
    hard_deadline: true,
    status: 'In Progress',
    description: 'Implement exec, wait, read, write syscalls and argument passing in Pintos kernel.',
    priority_score: 94,
  },
  {
    id: 'task-102',
    courseId: 'cs182',
    course_code: 'CS 182',
    title: 'Transformer Architecture & Attention Lab',
    deliverable_type: 'Coding Lab + Report',
    due_date: getRelativeDate(3),
    effort_hours: 9.0,
    grade_weight: 10.0,
    hard_deadline: false,
    status: 'Pending',
    description: 'Build multi-head attention module from scratch in PyTorch and write 4-page evaluation report.',
    priority_score: 88,
  },
  {
    id: 'task-103',
    courseId: 'math104',
    course_code: 'MATH 104',
    title: 'Problem Set 6: Compact Sets & Metric Spaces',
    deliverable_type: 'Math Proofs',
    due_date: getRelativeDate(4),
    effort_hours: 6.5,
    grade_weight: 5.0,
    hard_deadline: true,
    status: 'Pending',
    description: 'Complete problems 12-18 from Chapter 4 on Heine-Borel theorem and open covers.',
    priority_score: 72,
  },
  {
    id: 'task-104',
    courseId: 'econ101',
    course_code: 'ECON 101',
    title: 'Game Theory Policy Case Study Analysis',
    deliverable_type: 'Essay',
    due_date: getRelativeDate(6),
    effort_hours: 5.0,
    grade_weight: 8.0,
    hard_deadline: false,
    status: 'Pending',
    description: 'Analyze Nash Equilibria in modern oligopoly market interventions (8 pages).',
    priority_score: 61,
  },
];

export const SAMPLE_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'CS 182: Emergency Scope Creep & Project 2 Clarification',
    source: 'Canvas Announcement',
    courseCode: 'CS 182',
    timestamp: '10 minutes ago',
    content: `IMPORTANT ANNOUNCEMENT: For CS 182 Project 2 (Diffusion Models & Fine-Tuning), we are extending the required deliverables. In addition to the PyTorch notebook, you must submit a 5-page PDF report with hyperparameter benchmark charts and ablation tables. Due date is set for Thursday, Nov 14 at 11:59 PM. This assignment represents 12% of your final grade. Expect roughly 11 hours of training and writing time.`,
  },
  {
    id: 'ann-2',
    title: 'MATH 104: Midterm 2 Date & Problem Set 7 Release',
    source: 'Piazza Post @589',
    courseCode: 'MATH 104',
    timestamp: '2 hours ago',
    content: `Hi Class, Problem Set 7 on Connectedness and Uniform Continuity has been published on bCourses. It consists of 8 rigorous proofs (pages 142-145). It will be due this Friday at 5:00 PM PST. Hard deadline! Weight: 6% of total course grade. Estimated effort is 7.5 hours of proof writing.`,
  },
  {
    id: 'ann-3',
    title: 'CS 162: Pintos Project 3 Milestone & Code Review',
    source: 'Email from Prof. Anderson',
    courseCode: 'CS 162',
    timestamp: 'Yesterday',
    content: `Team, Pintos Project 3 (Virtual Memory & Page Allocation) is now live. Submission deadline is next Wednesday at midnight. Weight is 18% of your overall mark. This is a heavy lab requiring ~16 hours of kernel debugging, page table synchronization, and swap disk management. Work in your design groups immediately.`,
  },
];
