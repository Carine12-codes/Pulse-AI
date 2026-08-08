const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    console.warn('API fetchHealth fallback:', err.message);
    return { status: 'offline', postgresConnected: false };
  }
}

export async function fetchCourses() {
  try {
    const res = await fetch(`${API_BASE}/courses`);
    return await res.json();
  } catch (err) {
    console.warn('API fetchCourses fallback:', err.message);
    return [];
  }
}

export async function fetchTasks() {
  try {
    const res = await fetch(`${API_BASE}/tasks`);
    return await res.json();
  } catch (err) {
    console.warn('API fetchTasks fallback:', err.message);
    return [];
  }
}

export async function addTask(taskData) {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    return await res.json();
  } catch (err) {
    console.error('API addTask error:', err.message);
    throw err;
  }
}

export async function updateTaskStatus(taskId, status) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (err) {
    console.error('API updateTaskStatus error:', err.message);
    throw err;
  }
}

export async function parseAnnouncement(rawText, dailyCapacityHours = 7.0) {
  try {
    const res = await fetch(`${API_BASE}/announcements/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, dailyCapacityHours }),
    });
    return await res.json();
  } catch (err) {
    console.error('API parseAnnouncement error:', err.message);
    throw err;
  }
}

export async function fetchWorkloadDensity(capacityLimit = 7.0) {
  try {
    const res = await fetch(`${API_BASE}/workload/density?capacityLimit=${capacityLimit}`);
    return await res.json();
  } catch (err) {
    console.warn('API fetchWorkloadDensity error:', err.message);
    return { dailyDensity: [], bottlenecks: [] };
  }
}

export async function reprioritizeQueue() {
  try {
    const res = await fetch(`${API_BASE}/queue/reprioritize`, {
      method: 'POST',
    });
    return await res.json();
  } catch (err) {
    console.error('API reprioritizeQueue error:', err.message);
    throw err;
  }
}

export async function fetchEmails() {
  try {
    const res = await fetch(`${API_BASE}/emails`);
    return await res.json();
  } catch (err) {
    console.warn('API fetchEmails error:', err.message);
    return [];
  }
}

export async function generateExtensionEmail(bottleneckDate, taskId, studentName = 'Alex Rivera') {
  try {
    const res = await fetch(`${API_BASE}/emails/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bottleneckDate, taskId, studentName }),
    });
    return await res.json();
  } catch (err) {
    console.error('API generateExtensionEmail error:', err.message);
    throw err;
  }
}

export async function sendExtensionEmail(emailId) {
  try {
    const res = await fetch(`${API_BASE}/emails/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId }),
    });
    return await res.json();
  } catch (err) {
    console.error('API sendExtensionEmail error:', err.message);
    throw err;
  }
}

export async function fetchAgentLogs() {
  try {
    const res = await fetch(`${API_BASE}/agent/logs`);
    return await res.json();
  } catch (err) {
    console.warn('API fetchAgentLogs error:', err.message);
    return [];
  }
}

export async function runAutonomousPipeline() {
  try {
    const res = await fetch(`${API_BASE}/agent/run-pipeline`, {
      method: 'POST',
    });
    return await res.json();
  } catch (err) {
    console.error('API runAutonomousPipeline error:', err.message);
    throw err;
  }
}
