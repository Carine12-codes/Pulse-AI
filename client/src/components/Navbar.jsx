import React from 'react';
import {
  Brain,
  Zap,
  Activity,
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
    <aside className="sidebar-container" aria-label="Main Application Sidebar Navigation">
      <div className="sidebar-top">
        {/* Brand Logo */}
        <div
          className="sidebar-brand"
          onClick={() => setActiveTab('dashboard')}
          role="button"
          tabIndex={0}
          aria-label="Pulse AI Brand Logo - Return to Dashboard"
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('dashboard')}
        >
          <div className="brand-icon-box">
            <Brain size={22} aria-hidden="true" />
          </div>
          <div className="brand-name">
            Pulse<span style={{ color: '#FF793F' }}>AI</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav-list" aria-label="Primary Navigation">
          <button
            className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            aria-label="Navigate to Dashboard Tab"
            aria-current={activeTab === 'dashboard' ? 'page' : undefined}
          >
            <Activity size={18} aria-hidden="true" />
            <span>Dashboard</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'parser' ? 'active' : ''}`}
            onClick={() => setActiveTab('parser')}
            aria-label="Navigate to Announcement NLP Parser Tab"
            aria-current={activeTab === 'parser' ? 'page' : undefined}
          >
            <Sparkles size={18} aria-hidden="true" />
            <span>Parse Text</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
            aria-label="Navigate to Task Queue Pinboard Tab"
            aria-current={activeTab === 'queue' ? 'page' : undefined}
          >
            <Layers size={18} aria-hidden="true" />
            <span>Task Queue</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'estimator' ? 'active' : ''}`}
            onClick={() => setActiveTab('estimator')}
            aria-label="Navigate to Effort Hours Calculator Tab"
            aria-current={activeTab === 'estimator' ? 'page' : undefined}
          >
            <Sliders size={18} aria-hidden="true" />
            <span>Effort Calculator</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
            aria-label="Navigate to Extension Request Studio Tab"
            aria-current={activeTab === 'email' ? 'page' : undefined}
          >
            <Mail size={18} aria-hidden="true" />
            <span>Extension Studio</span>
            {bottlenecksCount > 0 && (
              <span className="sidebar-badge-count" aria-label={`${bottlenecksCount} schedule bottleneck warning`}>
                {bottlenecksCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Sidebar Bottom Action Card */}
      <div className="sidebar-bottom-widget" role="region" aria-label="Autonomous Mode Optimization">
        <div className="widget-title">Autonomous Mode</div>
        <div className="widget-desc">Zero human effort schedule optimization</div>
        <button
          className="btn-sidebar-action"
          onClick={onRunPipeline}
          disabled={isPipelineRunning}
          aria-label="Trigger Autonomous Schedule Auto-Fix Pipeline"
        >
          {isPipelineRunning ? 'Fixing Schedule...' : '✨ Auto-Fix Schedule'}
        </button>
      </div>
    </aside>
  );
}
