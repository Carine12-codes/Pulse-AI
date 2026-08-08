import React, { useState } from 'react';
import { Brain, Sparkles, FileText, Check } from 'lucide-react';
import { SAMPLE_ANNOUNCEMENTS } from '../data/initialData.js';

export default function AnnouncementParser({ onParseAnnouncement, isParsing }) {
  const [inputText, setInputText] = useState(SAMPLE_ANNOUNCEMENTS[0].content);
  const [parsedResult, setParsedResult] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState(SAMPLE_ANNOUNCEMENTS[0].id);

  const handleSelectPreset = (ann) => {
    setSelectedPresetId(ann.id);
    setInputText(ann.content);
    setParsedResult(null);
  };

  const handleParse = async () => {
    if (!inputText.trim()) return;
    const res = await onParseAnnouncement(inputText);
    if (res && res.parsedTask) {
      setParsedResult(res.parsedTask);
    }
  };

  return (
    <div className="parser-simple-container">
      <div className="pinterest-hero-card" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
            <Brain size={20} inline style={{ color: '#E60023', marginRight: '0.4rem' }} /> Instant Announcement NLP Parser
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.84rem', marginTop: '0.2rem' }}>
            Paste any unstructured email, Canvas update, Piazza post, or syllabus line. AI extracts effort hours, grade weights, and target dates instantly.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Input Box & Presets */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Quick Preset Samples:</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {SAMPLE_ANNOUNCEMENTS.map((ann) => (
                <button
                  key={ann.id}
                  onClick={() => handleSelectPreset(ann)}
                  style={{
                    background: selectedPresetId === ann.id ? '#FEF2F2' : '#F1F5F9',
                    border: selectedPresetId === ann.id ? '1px solid #E60023' : '1px solid rgba(0,0,0,0.06)',
                    color: selectedPresetId === ann.id ? '#E60023' : '#475569',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {ann.courseCode}: {ann.source}
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="minimal-textarea"
            rows={8}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste syllabus line, email, Canvas notification, or Piazza message..."
          />

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-primary-glow"
              onClick={handleParse}
              disabled={isParsing || !inputText.trim()}
            >
              {isParsing ? (
                <>
                  <div className="spinner-sm"></div>
                  <span>Extracting Metadata...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Extract & Ingest Deliverable</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Parsed Extraction Result Card */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: '#0F172A' }}>
            <FileText size={16} inline style={{ color: '#9333EA', marginRight: '0.4rem' }} /> Extracted Deliverable Details
          </h3>

          {parsedResult ? (
            <div style={{ background: '#F8FAFC', padding: '1.2rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#E60023', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                  {parsedResult.course_code || parsedResult.courseCode}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#475569', background: '#E2E8F0', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 600 }}>
                  {parsedResult.deliverable_type || parsedResult.deliverableType}
                </span>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: '#0F172A' }}>{parsedResult.title}</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div style={{ background: 'white', padding: '0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}>Estimated Effort</div>
                  <div style={{ fontWeight: 800, color: '#E60023', marginTop: '0.2rem' }}>{parsedResult.effort_hours || parsedResult.effortHours} Hours</div>
                </div>
                <div style={{ background: 'white', padding: '0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}>Grade Weight</div>
                  <div style={{ fontWeight: 800, marginTop: '0.2rem', color: '#0F172A' }}>{parsedResult.grade_weight || parsedResult.gradeWeight}%</div>
                </div>
                <div style={{ background: 'white', padding: '0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}>Target Due Date</div>
                  <div style={{ fontWeight: 800, marginTop: '0.2rem', color: '#0F172A' }}>{parsedResult.due_date || parsedResult.dueDate}</div>
                </div>
                <div style={{ background: 'white', padding: '0.65rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}>Deadline Type</div>
                  <div style={{ fontWeight: 800, color: parsedResult.hard_deadline ? '#DC2626' : '#059669', marginTop: '0.2rem' }}>
                    {parsedResult.hard_deadline ? 'Strict (Hard)' : 'Flexible (Soft)'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Check size={16} /> Task saved to database & priority queue re-sorted!
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8', fontSize: '0.88rem' }}>
              Paste an announcement or select a preset and click "Extract & Ingest Deliverable".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
