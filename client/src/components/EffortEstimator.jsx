import React, { useState } from 'react';
import { Activity, Clock, Sliders, Cpu, BookOpen, Code, FileText, Sparkles } from 'lucide-react';

export default function EffortEstimator() {
  const [pages, setPages] = useState(25);
  const [mathProofs, setMathProofs] = useState(6);
  const [codeLines, setCodeLines] = useState(450);
  const [readingSpeed, setReadingSpeed] = useState(12); // pages per hour
  const [proofSpeed, setProofSpeed] = useState(1.5); // proofs per hour
  const [codingVelocity, setCodingVelocity] = useState(1.0); // 1.0 = baseline, 0.8 = slower
  const [complexityTier, setComplexityTier] = useState('HIGH'); // INTRO, STANDARD, HIGH

  // Effort Calculations
  const readingHours = pages / readingSpeed;
  const mathHours = mathProofs / proofSpeed;
  const codingBaseHours = (codeLines / 55) * (1 / codingVelocity);
  const tierMultiplier = complexityTier === 'HIGH' ? 1.35 : complexityTier === 'STANDARD' ? 1.1 : 0.9;

  const totalCalculatedHours = parseFloat(((readingHours + mathHours + codingBaseHours) * tierMultiplier).toFixed(1));

  // Time Breakdown
  const researchHours = parseFloat((totalCalculatedHours * 0.25).toFixed(1));
  const implementationHours = parseFloat((totalCalculatedHours * 0.55).toFixed(1));
  const reviewHours = parseFloat((totalCalculatedHours * 0.2).toFixed(1));

  return (
    <div className="estimator-container">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">
            <Activity className="accent-icon" /> Multi-Factor Effort Hours Estimator
          </h2>
          <p className="panel-description">
            Configurable algorithmic model that estimates realistic completion time based on deliverable specs and student processing velocity.
          </p>
        </div>
      </div>

      <div className="estimator-grid">
        {/* Left Column: Input Sliders & Parameters */}
        <div className="estimator-card">
          <h3 className="card-subtitle">
            <Sliders size={18} /> Deliverable Scope Parameters
          </h3>

          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">
                <BookOpen size={14} /> Assigned Reading Pages
              </span>
              <span className="slider-value">{pages} Pages</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              value={pages}
              onChange={(e) => setPages(parseInt(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">
                <FileText size={14} /> Rigorous Math Proof Problems
              </span>
              <span className="slider-value">{mathProofs} Proofs</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={mathProofs}
              onChange={(e) => setMathProofs(parseInt(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">
                <Code size={14} /> Expected Code Implementation (Lines)
              </span>
              <span className="slider-value">{codeLines} LOC</span>
            </div>
            <input
              type="range"
              min="0"
              max="1500"
              step="25"
              value={codeLines}
              onChange={(e) => setCodeLines(parseInt(e.target.value))}
            />
          </div>

          <div className="complexity-selector">
            <span className="slider-title">
              <Cpu size={14} /> Architecture Complexity Level
            </span>
            <div className="tier-buttons">
              <button
                className={`tier-btn ${complexityTier === 'INTRO' ? 'active' : ''}`}
                onClick={() => setComplexityTier('INTRO')}
              >
                Introductory (0.9x)
              </button>
              <button
                className={`tier-btn ${complexityTier === 'STANDARD' ? 'active' : ''}`}
                onClick={() => setComplexityTier('STANDARD')}
              >
                Standard (1.1x)
              </button>
              <button
                className={`tier-btn ${complexityTier === 'HIGH' ? 'active' : ''}`}
                onClick={() => setComplexityTier('HIGH')}
              >
                Kernel / ML High (1.35x)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Effort Result Card */}
        <div className="estimator-card output">
          <h3 className="card-subtitle">
            <Clock size={18} /> Algorithmic Effort Estimate
          </h3>

          <div className="effort-output-display">
            <div className="total-hours-number">{totalCalculatedHours}</div>
            <div className="total-hours-unit">Estimated Total Effort Hours</div>
          </div>

          <div className="breakdown-phase-matrix">
            <div className="phase-row">
              <span className="phase-name">
                <BookOpen size={14} /> Research & Specs Analysis (25%)
              </span>
              <span className="phase-val">{researchHours} hrs</span>
            </div>
            <div className="phase-row">
              <span className="phase-name">
                <Code size={14} /> Coding & Proof Writing (55%)
              </span>
              <span className="phase-val highlight">{implementationHours} hrs</span>
            </div>
            <div className="phase-row">
              <span className="phase-name">
                <Sparkles size={14} /> Debugging & Test Suites (20%)
              </span>
              <span className="phase-val">{reviewHours} hrs</span>
            </div>
          </div>

          <div className="heuristic-formula-info">
            <p>
              <strong>Formula:</strong> Effort = ((Pages / {readingSpeed}pph) + (Proofs / {proofSpeed}pph) + (LOC / 55)) &times; {tierMultiplier}x Complexity Multiplier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
