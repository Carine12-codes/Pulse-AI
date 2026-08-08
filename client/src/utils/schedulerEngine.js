// Scheduler & Workload Auditor Engine for Client

export function calculateWorkloadDensity(tasks, maxDailyHours = 7.0, daysAhead = 7) {
  const densityMap = {};
  const today = new Date();

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

  tasks.forEach((task) => {
    if (task.status === 'Completed') return;
    const dueDate = task.due_date || task.dueDate;
    const effort = parseFloat(task.effort_hours || task.effortHours || 0);

    if (densityMap[dueDate]) {
      densityMap[dueDate].totalHours += effort;
      densityMap[dueDate].tasks.push(task);
    }
  });

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

export function detectBottlenecks(tasks, maxDailyHours = 7.0) {
  const dailyDensity = calculateWorkloadDensity(tasks, maxDailyHours, 7);
  return dailyDensity.filter((day) => day.isBottleneck);
}

export function calculatePriorityScore(task) {
  const today = new Date();
  const dueDate = task.due_date || task.dueDate || today.toISOString().split('T')[0];
  const due = new Date(dueDate);
  const diffDays = Math.max(0, Math.ceil((due - today) / (1000 * 60 * 60 * 24)));

  let urgency = Math.max(5, 40 - diffDays * 6);
  let weight = Math.min(35, (task.grade_weight || task.gradeWeight || 5) * 2.2);
  let effort = Math.min(15, (task.effort_hours || task.effortHours || 4) * 1.0);
  let hard = task.hard_deadline || task.hardDeadline ? 10 : 0;

  return Math.min(100, Math.round(urgency + weight + effort + hard));
}

export function reprioritizeQueue(tasks) {
  return [...tasks]
    .map((t) => ({
      ...t,
      priority_score: calculatePriorityScore(t),
    }))
    .sort((a, b) => {
      if (a.status === 'Completed') return 1;
      if (b.status === 'Completed') return -1;
      return (b.priority_score || 0) - (a.priority_score || 0);
    });
}
