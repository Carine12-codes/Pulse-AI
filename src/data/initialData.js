// Sample initial data for AutoStudy AI

export const INITIAL_COURSES = [
  {
    id: 'cs162',
    code: 'CS 162',
    name: 'Operating Systems & System Programming',
    instructor: 'Prof. Thomas Anderson',
    email: 'tanderson@university.edu',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'cs182',
    code: 'CS 182',
    name: 'Deep Neural Networks & Machine Learning',
    instructor: 'Prof. Elena Rostova',
    email: 'erostova@university.edu',
    color: '#3B82F6', // Blue
  },
  {
    id: 'math104',
    code: 'MATH 104',
    name: 'Introduction to Real Analysis',
    instructor: 'Prof. David Hilbert',
    email: 'dhilbert@university.edu',
    color: '#10B981', // Emerald
  },
  {
    id: 'econ101',
    code: 'ECON 101',
    name: 'Advanced Microeconomic Theory',
    instructor: 'Prof. Sarah Jenkins',
    email: 'sjenkins@university.edu',
    color: '#F59E0B', // Amber
  },
];

// Helper to get dates relative to today
const getRelativeDate = (daysFromToday) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS = [
  {
    id: 'task-101',
    courseId: 'cs162',
    courseCode: 'CS 162',
    title: 'Pintos Project 2: User Programs & Syscalls',
    deliverableType: 'Coding Project',
    dueDate: getRelativeDate(3), // 3 days from now
    effortHours: 14.5,
    gradeWeight: 15.0, // 15% of final grade
    hardDeadline: true,
    status: 'In Progress',
    description: 'Implement exec, wait, read, write syscalls and argument passing in Pintos kernel.',
    parsedFrom: 'Canvas Announcement: "Project 2 spec released. Hard deadline in 3 days. Estimated 15 hours work."',
    dependencies: [],
    priorityScore: 94,
  },
  {
    id: 'task-102',
    courseId: 'cs182',
    courseCode: 'CS 182',
    title: 'Transformer Architecture & Attention Mechanism Lab',
    deliverableType: 'Coding Lab + Report',
    dueDate: getRelativeDate(3), // Same day bottleneck!
    effortHours: 9.0,
    gradeWeight: 10.0,
    hardDeadline: false,
    status: 'Pending',
    description: 'Build multi-head attention module from scratch in PyTorch and write 4-page evaluation report.',
    parsedFrom: 'Piazza Post @412: "Lab 4 posted. Due Thursday at midnight."',
    dependencies: [],
    priorityScore: 88,
  },
  {
    id: 'task-103',
    courseId: 'math104',
    courseCode: 'MATH 104',
    title: 'Problem Set 6: Compact Sets & Metric Spaces',
    deliverableType: 'Math Proofs',
    dueDate: getRelativeDate(4),
    effortHours: 6.5,
    gradeWeight: 5.0,
    hardDeadline: true,
    status: 'Pending',
    description: 'Complete problems 12-18 from Chapter 4 on Heine-Borel theorem and open covers.',
    parsedFrom: 'Course Website: "Homework 6 due Friday 5 PM."',
    dependencies: [],
    priorityScore: 72,
  },
  {
    id: 'task-104',
    courseId: 'econ101',
    courseCode: 'ECON 101',
    title: 'Game Theory Policy Case Study Analysis',
    deliverableType: 'Essay',
    dueDate: getRelativeDate(6),
    effortHours: 5.0,
    gradeWeight: 8.0,
    hardDeadline: false,
    status: 'Pending',
    description: 'Analyze Nash Equilibria in modern oligopoly market interventions (8 pages).',
    parsedFrom: 'Syllabus schedule line: "Case Study 2 due end of Week 7."',
    dependencies: [],
    priorityScore: 61,
  },
  {
    id: 'task-105',
    courseId: 'cs182',
    courseCode: 'CS 182',
    title: 'Midterm Exam Preparation & Practice Set',
    deliverableType: 'Exam Review',
    dueDate: getRelativeDate(5),
    effortHours: 7.0,
    gradeWeight: 25.0,
    hardDeadline: true,
    status: 'Pending',
    description: 'Review backpropagation math, conv nets, transformer attention heads, and GAN loss formulations.',
    parsedFrom: 'Email from Prof. Rostova: "Midterm covers lectures 1-12."',
    dependencies: ['task-102'],
    priorityScore: 85,
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

export const USER_SETTINGS_DEFAULT = {
  dailyCapacityHours: 7.0, // Maximum safe study/work hours per day
  studentCodingVelocity: 1.0, // 1.0 = baseline speed, 0.8 = slower, 1.2 = faster
  studentReadingSpeedPPH: 12, // pages per hour
  studentMathProofPPH: 1.5, // proofs per hour
  autoDraftEmails: true,
  turboMode: true,
};
