import React, { useState } from 'react';
import { Zap, Clock, Award, Plus, Filter, Check, ArrowUpDown, Calendar, BookOpen } from 'lucide-react';

export default function TaskQueue({
  tasks = [],
  courses = [],
  onUpdateStatus,
  onAddNewTask,
  onReprioritize
}) {
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('CS 182');
  const [newEffort, setNewEffort] = useState(8.0);
  const [newWeight, setNewWeight] = useState(10.0);
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  const filteredTasks = tasks.filter((t) => {
    if (filterCourse !== 'ALL' && (t.course_code || t.courseCode) !== filterCourse) return false;
    return true;
  });

  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddNewTask({
      title: newTitle,
      course_code: newCourseCode,
      course_id: newCourseCode.toLowerCase().replace(/\s+/g, ''),
      effort_hours: parseFloat(newEffort),
      grade_weight: parseFloat(newWeight),
      due_date: newDueDate,
      hard_deadline: true,
      deliverable_type: 'Assignment',
      status: 'Pending',
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="queue-pinterest-container">
      {/* Light Top Hero Card */}
      <div className="pinterest-hero-card" style={{ marginBottom: '1.2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
            <Zap size={22} inline style={{ color: '#E60023', marginRight: '0.4rem' }} /> Topological Task Pinboard
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Pins are dynamically prioritized based on grade weight, deadline urgency, and effort hours.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn-secondary-glow" onClick={onReprioritize}>
            <ArrowUpDown size={15} />
            <span>Re-Sort Pins</span>
          </button>
          <button className="btn-primary-glow" onClick={() => setShowAddModal(true)}>
            <Plus size={15} />
            <span>+ Create Pin</span>
          </button>
        </div>
      </div>

      {/* Light Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', background: 'white', padding: '0.8rem 1.4rem', borderRadius: 'var(--radius-pin)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          <Filter size={15} />
          <span>Filter Course:</span>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            style={{ background: '#F1F5F9', border: '1px solid rgba(0,0,0,0.08)', color: '#0F172A', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <option value="ALL">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>{c.code}</option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
          Showing {filteredTasks.length} active pins
        </span>
      </div>

      {/* Light Pinterest Masonry Pin Grid */}
      <div className="pinterest-masonry-grid">
        {filteredTasks.map((t, idx) => {
          const isDone = t.status === 'Completed';
          const priorityScore = t.priority_score || t.priorityScore || 50;
          const topRank = idx < 2;

          const courseBg = idx % 3 === 0 ? '#E60023' : idx % 3 === 1 ? '#9333EA' : '#4F46E5';

          return (
            <div key={t.id} className={`pin-card ${isDone ? 'completed' : ''}`}>
              <div className="pin-banner-accent" style={{ background: courseBg }}></div>
              
              <div className="pin-card-header">
                <span className="pin-course-tag" style={{ backgroundColor: courseBg }}>
                  {t.course_code || t.courseCode}
                </span>
                <span className={`pin-rank-badge ${topRank ? 'top' : ''}`}>
                  #{idx + 1} Pin ({priorityScore} pts)
                </span>
              </div>

              <h4 className="pin-title">{t.title}</h4>
              <p className="pin-description">{t.description || 'Deliverable parsed and optimized automatically by Antigravity Agent.'}</p>

              <div className="pin-metrics-pills">
                <span className="metric-pill">
                  <Clock size={12} /> {t.effort_hours || t.effortHours} Hours
                </span>
                <span className="metric-pill">
                  <Award size={12} /> Weight: {t.grade_weight || t.gradeWeight}%
                </span>
                <span className="metric-pill">
                  <BookOpen size={12} /> {t.deliverable_type || t.deliverableType || 'Task'}
                </span>
              </div>

              <div className="pin-card-footer">
                <div className="pin-due-date">
                  <Calendar size={12} /> Due: {t.due_date || t.dueDate}
                </div>

                <button
                  className={`status-check-btn ${isDone ? 'checked' : ''}`}
                  onClick={() => onUpdateStatus && onUpdateStatus(t.id, isDone ? 'Pending' : 'Completed')}
                  title="Toggle Task Status"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal (Light Theme) */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.2rem', color: '#0F172A' }}>Create New Deliverable Pin</h3>
            <form onSubmit={handleCreateTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Deliverable Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java Theory Recap & Quiz"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0.6rem', borderRadius: '12px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Course Code</label>
                  <select
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0.6rem', borderRadius: '12px', fontSize: '0.85rem' }}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Effort (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newEffort}
                    onChange={(e) => setNewEffort(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0.6rem', borderRadius: '12px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Grade Weight (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0.6rem', borderRadius: '12px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0.6rem', borderRadius: '12px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary-glow" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-glow">Save Pin & Re-Sort</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
