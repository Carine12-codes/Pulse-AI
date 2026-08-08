// Parser Engine for client

export function parseAnnouncementText(rawText) {
  if (!rawText || rawText.trim().length === 0) return null;

  const text = rawText.trim();
  
  const courseRegex = /(?:CS|MATH|ECON|PHYS|ENG|CHEM|BIO|STAT|EECS|DS|INFO)\s?\d{2,3}[A-Z]?/i;
  const courseMatch = text.match(courseRegex);
  const course_code = courseMatch ? courseMatch[0].toUpperCase() : 'CS 182';

  let title = `${course_code} Deliverable`;
  const firstLine = text.split('\n')[0].replace(/^(IMPORTANT|ANNOUNCEMENT|Hi Class|Team)[:\s]*/i, '').trim();
  if (firstLine.length > 0) {
    title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
  }

  let effort_hours = 6.0;
  const effortMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours|hrs|hr)/i);
  if (effortMatch) effort_hours = parseFloat(effortMatch[1]);
  else if (/heavy|diffusion|kernel|project|lab/i.test(text)) effort_hours = 11.0;

  let grade_weight = 10.0;
  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)/i);
  if (weightMatch) grade_weight = parseFloat(weightMatch[1]);

  const hard_deadline = /hard deadline|strict|no extensions|penalty|midnight/i.test(text);

  let days = 3;
  if (/tomorrow/i.test(text)) days = 1;
  else if (/friday/i.test(text)) days = 4;
  else if (/next week/i.test(text)) days = 6;

  const d = new Date();
  d.setDate(d.getDate() + days);

  return {
    id: `task-${Date.now()}`,
    course_id: course_code.toLowerCase().replace(/\s+/g, ''),
    course_code,
    title,
    deliverable_type: /coding|pytorch|code/i.test(text) ? 'Coding Lab' : 'Math/Report',
    due_date: d.toISOString().split('T')[0],
    effort_hours,
    grade_weight,
    hard_deadline,
    status: 'Pending',
    priority_score: 82,
    description: text
  };
}
