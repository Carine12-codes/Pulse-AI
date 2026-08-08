// Unstructured Announcement Parser Engine for AutoStudy AI

/**
 * Extracts structured academic deliverables from raw unstructured text (Canvas, Email, Piazza, Syllabus).
 */
export function parseAnnouncementText(rawText) {
  if (!rawText || rawText.trim().length === 0) {
    return null;
  }

  const text = rawText.trim();
  
  // 1. Extract Course Code
  const courseRegex = /(?:CS|MATH|ECON|PHYS|ENG|CHEM|BIO|STAT|EECS|DS|INFO)\s?\d{2,3}[A-Z]?/i;
  const courseMatch = text.match(courseRegex);
  const courseCode = courseMatch ? courseMatch[0].toUpperCase() : 'GEN 100';

  // 2. Extract Task Title
  let title = 'Parsed Academic Assignment';
  const projectRegex = /(?:Project|Lab|Problem Set|Homework|PSet|Case Study|Paper|Essay|Midterm|Exam|Quiz|Milestone|Assignment)\s?\d*/i;
  const projectMatch = text.match(projectRegex);
  
  if (projectMatch) {
    // Extract surrounding context around assignment match
    const lines = text.split('\n');
    const matchingLine = lines.find(l => projectRegex.test(l));
    if (matchingLine) {
      title = matchingLine.replace(/^(IMPORTANT|ANNOUNCEMENT|Hi Class|Team|Notice)[:\s]*/i, '').trim();
      if (title.length > 55) {
        title = title.substring(0, 52) + '...';
      }
    } else {
      title = `${courseCode} ${projectMatch[0]}`;
    }
  } else {
    // Fallback: use first non-empty line
    const firstLine = text.split('\n')[0].replace(/^#+\s*/, '').trim();
    if (firstLine.length > 0) {
      title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
    }
  }

  // 3. Extract Estimated Effort Hours
  let effortHours = 6.0; // Default baseline
  const effortRegex = /(\d+(?:\.\d+)?)\s*(?:hours|hrs|hr|hours of work|hours estimated)/i;
  const effortMatch = text.match(effortRegex);
  if (effortMatch) {
    effortHours = parseFloat(effortMatch[1]);
  } else {
    // Infer based on key terms
    if (/heavy|large|complex|kernel|diffusion|multi-head|ablation/i.test(text)) {
      effortHours = 12.0;
    } else if (/proofs|pages|report|lab/i.test(text)) {
      effortHours = 7.5;
    } else if (/quiz|reading|short/i.test(text)) {
      effortHours = 3.0;
    }
  }

  // 4. Extract Grade Weight Percentage
  let gradeWeight = 8.0; // Default weight
  const weightRegex = /(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:of|weight|final grade|grade)/i;
  const weightMatch = text.match(weightRegex);
  if (weightMatch) {
    gradeWeight = parseFloat(weightMatch[1]);
  } else {
    const rawPercentRegex = /(\d+(?:\.\d+)?)\s*%/;
    const rawPercentMatch = text.match(rawPercentRegex);
    if (rawPercentMatch) {
      gradeWeight = parseFloat(rawPercentMatch[1]);
    }
  }

  // 5. Extract Hard vs Soft Deadline
  const hardDeadline = /hard deadline|no extensions|strict|penalty|5:00 PM|midnight PST/i.test(text);

  // 6. Extract Due Date / Relative Days
  let dueDaysFromToday = 3;
  if (/tomorrow/i.test(text)) {
    dueDaysFromToday = 1;
  } else if (/thursday/i.test(text)) {
    dueDaysFromToday = 3;
  } else if (/friday/i.test(text)) {
    dueDaysFromToday = 4;
  } else if (/next week|wednesday|next wednesday/i.test(text)) {
    dueDaysFromToday = 6;
  }

  const d = new Date();
  d.setDate(d.getDate() + dueDaysFromToday);
  const dueDate = d.toISOString().split('T')[0];

  // 7. Deliverable Type
  let deliverableType = 'Assignment';
  if (/coding|pytorch|kernel|syscall|notebook|python|code/i.test(text)) {
    deliverableType = 'Coding Project';
  } else if (/proof|theorem|math|metric space/i.test(text)) {
    deliverableType = 'Math Proofs';
  } else if (/essay|paper|case study|report/i.test(text)) {
    deliverableType = 'Essay / Report';
  } else if (/exam|midterm|review/i.test(text)) {
    deliverableType = 'Exam Prep';
  }

  return {
    id: `parsed-${Date.now()}`,
    courseCode,
    title,
    dueDate,
    effortHours,
    gradeWeight,
    hardDeadline,
    deliverableType,
    status: 'Pending',
    description: text.substring(0, 140) + '...',
    parsedFrom: 'Autonomous AI Parser Stream',
    dependencies: [],
    confidenceScore: 0.94,
  };
}
