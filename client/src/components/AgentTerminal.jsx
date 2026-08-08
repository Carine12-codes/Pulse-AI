import React from 'react';
import { Terminal, X, Trash2, Cpu, CheckCircle } from 'lucide-react';

export default function AgentTerminal({ logs, isOpen, onClose, onClearLogs }) {
  if (!isOpen) return null;

  return (
    <div className="terminal-drawer-container">
      <div className="terminal-drawer-header">
        <div className="header-left">
          <Terminal size={18} className="terminal-header-icon" />
          <span className="terminal-title">Google Antigravity Agent ReAct Execution Trace</span>
          <span className="live-status-pill">
            <Cpu size={12} /> Active ReAct Loop
          </span>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={onClearLogs} title="Clear Trace Console">
            <Trash2 size={16} />
          </button>
          <button className="icon-btn" onClick={onClose} title="Close Terminal">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="terminal-console-body">
        {logs.length > 0 ? (
          logs.map((log) => {
            const isWarning = log.action_type === 'BOTTLENECK' || log.message?.includes('BOTTLENECK');
            const isEmail = log.action_type === 'EMAILER' || log.action_type === 'SMTP_MAILER';
            const isParser = log.action_type === 'PARSER';

            return (
              <div key={log.id || Math.random()} className="log-line">
                <span className="log-timestamp">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '10:52:14 AM'}
                </span>
                <span
                  className={`log-tag ${isWarning ? 'warning' : isEmail ? 'email' : isParser ? 'parser' : 'info'}`}
                >
                  [{log.action_type || 'AGENT'}]
                </span>
                <span className="log-message">{log.message}</span>
              </div>
            );
          })
        ) : (
          <div className="terminal-empty-msg">
            <CheckCircle size={16} /> Antigravity Agent standing by. Trigger actions or run the pipeline to stream execution logs.
          </div>
        )}
      </div>
    </div>
  );
}
