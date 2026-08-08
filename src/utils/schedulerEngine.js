// Autonomous Scheduler Engine for AutoStudy AI

/**
 * Calculates daily workload density for the upcoming days.
 */
export function calculateWorkloadDensity(tasks, maxDailyHours = 7.0, daysAhead = 7) {
  const densityMap = {};
  const today = new Date();

  // Initialize dates
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    densityMap[dateStr] = {
      date: dateStr,
      dayLabel,
      totalHours: 0,
      capacityLimit: maxDailyHours,
      tasks: [],
      isBottleneck: false,
    };
  }

  // Aggregate tasks by due date
  tasks.forEach((task) => {
    if (task.status === 'Completed') return;

    if (densityMap[task.dueDate]) {
      densityMap[task.dueDate].totalHours += task.effortHours;
      densityMap[task.dueDate].tasks.push(task);
    }
  });

  // Flag bottlenecks
  Object.values(densityMap).forEach((day) => {
    if (day.totalHours > day.capacityLimit) {
      day.isBottleneck = true;
      day.overloadAmount = parseFloat((day.totalHours - day.capacityLimit).toFixed(1));
    } else {
      day.overloadAmount = 0;
    }
  });

  return Object.values(densityMap);
}

/**
 * Detects specific schedule bottlenecks where daily effort exceeds safe limit.
 */
export function detectBottlenecks(tasks, maxDailyHours = 7.0) {
  const dailyDensity = calculateWorkloadDensity(tasks, maxDailyHours, 10);
  return dailyDensity.filter((day) => day.isBottleneck);
}

/**
 * Calculates priority score (0-100) for dynamic topological sorting.
 */
export function calculatePriorityScore(task) {
  const today = new Date();
  const due = new Date(task.dueDate);
  const diffDays = Math.max(0, Math.ceil((due - today) / (1000 * 60 * 60 * 24)));

  // Urgency component (0-40 pts): standard decay curve
  let urgencyPts = 40;
  if (diffDays > 0) {
    urgencyPts = Math.max(5, 40 - diffDays * 6);
  }

  // Grade Weight component (0-35 pts)
  const weightPts = Math.min(35, (task.gradeWeight || 5) * 2.2);

  // Effort Density component (0-15 pts)
  const effortPts = Math.min(15, (task.effortHours || 4) * 1.0);

  // Hard Deadline bonus (10 pts)
  const hardDeadlinePts = task.hardDeadline ? 10 : 0;

  const score = Math.min(100, Math.round(urgencyPts + weightPts + effortPts + hardDeadlinePts));
  return score;
}

/**
 * Re-prioritizes the task queue automatically.
 */
export function reprioritizeQueue(tasks) {
  return [...tasks]
    .map((t) => ({
      ...t,
      priorityScore: calculatePriorityScore(t),
    }))
    .sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.status === 'Completed') return 1;
      if (b.status === 'Completed') return -1;
      return b.priorityScore - a.priorityScore;
    });
}

/**
 * Auto-generates a formal extension email for professor when a bottleneck occurs.
 */
export function generateExtensionEmail(bottleneckDay, targetTask, course, studentName = 'Alex Rivera') {
  const professor = course ? course.instructor : 'Professor';
  const courseCode = course ? course.code : (targetTask ? targetTask.courseCode : 'Course');
  const taskTitle = targetTask ? targetTask.title : 'Assignment';

  const totalOverload = bottleneckDay ? bottleneckDay.totalHours : 14.5;
  const safeLimit = bottleneckDay ? bottleneckDay.capacityLimit : 7.0;

  const formattedDate = bottleneckDay
    ? new Date(bottleneckDay.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'this week';

  // Proposed extended date (2 days later)
  const extendedDateObj = bottleneckDay ? new Date(bottleneckDay.date) : new Date();
  extendedDateObj.setDate(extendedDateObj.getDate() + 2);
  const proposedDate = extendedDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const subject = `Extension Request: ${courseCode} - ${taskTitle} [${studentName}]`;

  const body = `Dear ${professor},

I hope this email finds you well.

I am writing to formally request a brief 48-hour extension on ${taskTitle}, currently due on ${formattedDate}.

To maintain complete transparency regarding my academic workload, my autonomous workload auditor flagged a severe schedule bottleneck for ${formattedDate}. On this date, I have an aggregate requirement of ${totalOverload.toFixed(1)} estimated effort hours across major core engineering deliverables (exceeding my maximum safe daily capacity of ${safeLimit.toFixed(1)} hours).

Current Progress Completed:
• Research and initial architecture design finalized
• 60% of codebase / proof draft completed
• Testing and verification phase currently underway

I am deeply committed to submitting work that meets the highest academic rigor for ${courseCode}. A 48-hour extension until ${proposedDate} would allow me to thoroughly polish my submission and run comprehensive test suites without sacrificing quality under unsustainable density.

Thank you very much for your time, understanding, and leadership.

Sincerely,
${studentName}
UC Berkeley | B.S. Computer Science & Data Science
Email: arivera@berkeley.edu | Student ID: #30358912`;

  return {
    subject,
    body,
    recipientEmail: course ? course.email : 'instructor@university.edu',
    instructorName: professor,
    courseCode,
    taskTitle,
    bottleneckDate: formattedDate,
    proposedDate,
  };
}
