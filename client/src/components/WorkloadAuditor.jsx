import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Check,
  Award,
  Plus
} from 'lucide-react';

export default function WorkloadAuditor({
  densityData = [],
  bottlenecks = [],
  dailyLimit = 7.0,
  onTriggerMitigation,
  onOpenEmailStudio,
  tasks = [],
  onUpdateStatus
}) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeDensityData = Array.isArray(densityData) ? densityData : [];
  const safeBottlenecks = Array.isArray(bottlenecks) ? bottlenecks : [];

  const totalWeeklyHours = safeDensityData.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top 2 Candy Hero Cards (Matching Image 1 Design) */}
      <div className="dashboard-cards-grid">
        {/* Royal Purple Hero Card */}
        <div className="hero-purple-card">
          <div className="purple-card-header">
            <div>
              <div className="purple-card-title">Weekly Workload Density</div>
              <div className="purple-card-subtitle">7-Day Effort Audit & Capacity Tracker</div>
            </div>
            <span className="badge-time-pill">7.0h / day Limit</span>
          </div>

          {/* Wavy Graph SVG Visualizer */}
          <div className="wave-graph-box">
            <svg className="graph-svg" viewBox="0 0 400 90" preserveAspectRatio="none">
              <path
                d="M 0,60 Q 60,10 120,40 T 240,15 T 360,50 T 400,30"
                fill="none"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="3"
              />
              <path
                d="M 0,70 Q 60,30 120,55 T 240,25 T 360,65 T 400,45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth="4"
              />
              <circle cx="240" cy="25" r="7" fill="#FF5252" stroke="#FFFFFF" strokeWidth="3" />
            </svg>
          </div>

          <div className="metrics-three-col">
            <div className="metric-stat-box">
              <div className="stat-label">Total Time</div>
              <div className="stat-val-large">{totalWeeklyHours.toFixed(1)} Hr</div>
            </div>
            <div className="metric-stat-box">
              <div className="stat-label">Active Tasks</div>
              <div className="stat-val-large">{safeTasks.length} Tasks</div>
            </div>
            <div className="metric-stat-box">
              <div className="stat-label">Overloads</div>
              <div className="stat-val-large" style={{ color: safeBottlenecks.length > 0 ? '#FF5252' : '#10B981' }}>
                {safeBottlenecks.length} Days
              </div>
            </div>
          </div>
        </div>

        {/* Hot Coral Pink Bottleneck Card */}
        <div className="hero-coral-card">
          <div className="coral-header">
            <div className="coral-icon-pill">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="coral-title">
                {safeBottlenecks.length > 0 ? 'Bottleneck Overload' : 'Schedule Optimal'}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.2rem' }}>
                {safeBottlenecks.length > 0
                  ? `${safeBottlenecks[0].dayLabel} exceeds safe limit by +${safeBottlenecks[0].overloadAmount}h`
                  : 'All daily effort hours are within safe limits'}
              </div>
            </div>
          </div>

          <div className="coral-bottom-row">
            <div>
              <div className="coral-big-stat">
                {safeBottlenecks.length > 0 ? `${safeBottlenecks[0].totalHours.toFixed(1)}h` : 'Safe'}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>
                {safeBottlenecks.length > 0 ? 'Peak Day Requirement' : 'Workload Balanced'}
              </div>
            </div>

            <button
              className="btn-arrow-circle"
              onClick={() =>
                safeBottlenecks.length > 0
                  ? onOpenEmailStudio && onOpenEmailStudio(safeBottlenecks[0].date)
                  : onTriggerMitigation && onTriggerMitigation()
              }
              title="Fix Bottleneck / Draft Email"
            >
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Project Candy Cards Row */}
      <div>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.85rem' }}>
          Your Core Courses
        </div>
        <div className="projects-row-grid">
          <div className="project-candy-card cs162">
            <div>
              <div className="candy-card-title">CS 162: Operating Systems</div>
              <div className="candy-card-sub">Pintos Kernel Syscalls & VM</div>
            </div>
            <div className="candy-card-footer">
              <div className="avatars-overlap-row">
                <div className="avatar-dot">TA</div>
                <div className="avatar-dot">2</div>
              </div>
              <button className="plus-btn-mini">+</button>
            </div>
          </div>

          <div className="project-candy-card cs182">
            <div>
              <div className="candy-card-title">CS 182: Deep Learning</div>
              <div className="candy-card-sub">Transformer Multi-Head Attention</div>
            </div>
            <div className="candy-card-footer">
              <div className="avatars-overlap-row">
                <div className="avatar-dot">ER</div>
                <div className="avatar-dot">4</div>
              </div>
              <button className="plus-btn-mini">+</button>
            </div>
          </div>

          <div className="project-candy-card math104">
            <div>
              <div className="candy-card-title">MATH 104: Real Analysis</div>
              <div className="candy-card-sub">Problem Set 6 Metric Spaces</div>
            </div>
            <div className="candy-card-footer">
              <div className="avatars-overlap-row">
                <div className="avatar-dot">DH</div>
                <div className="avatar-dot">1</div>
              </div>
              <button className="plus-btn-mini">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* White Clay Deliverables List & High-Contrast 7-Day Density Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
        {/* Deliverables Checkmark List */}
        <div className="clay-white-card">
          <div className="clay-card-title">
            <span>Tasks For Today</span>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
              {safeTasks.filter((t) => t.status === 'Completed').length} completed, {safeTasks.filter((t) => t.status !== 'Completed').length} left
            </span>
          </div>

          <div className="task-checkmark-list">
            {safeTasks.slice(0, 5).map((t) => {
              const isDone = t.status === 'Completed';
              const priorityScore = t.priority_score || t.priorityScore || 50;
              const priorityClass = priorityScore > 85 ? 'high' : 'med';

              return (
                <div key={t.id} className={`task-check-row ${isDone ? 'completed' : ''}`}>
                  <div className="task-left-info">
                    <button
                      className={`check-circle-icon-btn ${isDone ? 'checked' : ''}`}
                      onClick={() => onUpdateStatus && onUpdateStatus(t.id, isDone ? 'Pending' : 'Completed')}
                      title="Toggle Task Status"
                    >
                      <Check size={16} />
                    </button>

                    <div>
                      <div className="task-item-title">{t.title}</div>
                      <div className="task-item-meta">
                        <span style={{ color: '#4F46E5', fontWeight: 700 }}>{t.course_code || t.courseCode}</span>
                        <span><Clock size={12} inline /> {t.effort_hours || t.effortHours}h</span>
                        <span>Due: {t.due_date || t.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`priority-candy-pill ${priorityClass}`}>
                    {priorityScore} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Density Timeline Visualizer (High Contrast Dark Text & Vibrant Bars) */}
        <div className="clay-white-card">
          <div className="clay-card-title">
            <span>7-Day Density Timeline</span>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Limit: {dailyLimit}h/day</span>
          </div>

          <div className="clean-bars-row">
            {safeDensityData.map((day) => {
              const heightPct = Math.min(100, Math.round(((day.totalHours || 0) / 16.0) * 100));
              const isOver = day.isBottleneck;

              return (
                <div key={day.date} className="clean-day-col">
                  <div className="clean-bar-bg">
                    {/* Safe limit dashed line indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: `${(dailyLimit / 16.0) * 100}%`,
                        left: 0,
                        right: 0,
                        borderTop: '2px dashed rgba(239, 68, 68, 0.6)',
                        zIndex: 2
                      }}
                    />

                    <div
                      className={`clean-bar-fill ${isOver ? 'overload' : 'normal'}`}
                      style={{ height: `${Math.max(12, heightPct)}%` }}
                    >
                      <span className="clean-bar-val">{day.totalHours > 0 ? `${day.totalHours.toFixed(1)}h` : '0h'}</span>
                    </div>
                  </div>
                  <div className="clean-day-name">{day.dayLabel}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
