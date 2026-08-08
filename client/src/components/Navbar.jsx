import React from 'react';
import {
  Brain,
  Zap,
  Activity,
  AlertTriangle,
  Terminal,
  Play,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  Mail
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  turboMode,
  setTurboMode,
  bottlenecksCount,
  onRunPipeline,
  isPipelineRunning,
  toggleTerminal,
  isTerminalOpen
}) {
  return (
    <aside className="sidebar-container">
      <div className="sidebar-top">
        {/* Brand Logo */}
        <div className="sidebar-brand" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-icon-box">
            <Brain size={22} />
          </div>
          <div className="brand-name">
            Pulse<span style={{ color: '#FF793F' }}>AI</span>
          </div>
        </div>

        {/* Navigation Items (Matching Image 1 & 2 Sidebar) */}
        <nav className="sidebar-nav-list">
          <button
            className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'parser' ? 'active' : ''}`}
            onClick={() => setActiveTab('parser')}
          >
            <Sparkles size={18} />
            <span>Parse Text</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <Layers size={18} />
            <span>Task Queue</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'estimator' ? 'active' : ''}`}
            onClick={() => setActiveTab('estimator')}
          >
            <Sliders size={18} />
            <span>Effort Calculator</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            <Mail size={18} />
            <span>Extension Studio</span>
            {bottlenecksCount > 0 && (
              <span className="sidebar-badge-count">{bottlenecksCount}</span>
            )}
          </button>
        </nav>
      </div>

      {/* Sidebar Bottom Action Card (Matching Image 2 Update Box) */}
      <div className="sidebar-bottom-widget">
        <div className="widget-title">Autonomous Mode</div>
        <div className="widget-desc">Zero human effort schedule optimization</div>
        <button
          className="btn-sidebar-action"
          onClick={onRunPipeline}
          disabled={isPipelineRunning}
        >
          {isPipelineRunning ? 'Fixing Schedule...' : '✨ Auto-Fix Schedule'}
        </button>
      </div>
    </aside>
  );
}
