import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle2, Copy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EmailGenerator({
  emails,
  bottlenecks,
  tasks,
  courses,
  onGenerateEmail,
  onSendEmail
}) {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [studentName, setStudentName] = useState('Alex Rivera');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (emails && emails.length > 0) {
      setSelectedEmail(emails[0]);
    }
  }, [emails]);

  const handleGenerateNew = async () => {
    const bDate = bottlenecks.length > 0 ? bottlenecks[0].date : null;
    const topTaskId = tasks.length > 0 ? tasks[0].id : null;
    const res = await onGenerateEmail(bDate, topTaskId, studentName);
    if (res && res.email) {
      setSelectedEmail(res.email);
    }
  };

  const handleSend = async () => {
    if (!selectedEmail) return;
    setIsSending(true);
    await onSendEmail(selectedEmail.id);
    setIsSending(false);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleCopyText = () => {
    if (!selectedEmail) return;
    const fullText = `Subject: ${selectedEmail.subject}\n\n${selectedEmail.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="email-simple-container">
      <div className="pinterest-hero-card" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
            <Mail size={20} inline style={{ color: '#E60023', marginRight: '0.4rem' }} /> Auto-Drafted Professor Extension Emails
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.84rem', marginTop: '0.2rem' }}>
            Automatically triggered when workload density exceeds safe daily limits. Generates polite, formal extension requests with workload proof.
          </p>
        </div>
        <button className="btn-primary-glow" onClick={handleGenerateNew}>
          <Sparkles size={15} />
          <span>Draft New Email</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
        {/* Draft List */}
        <div style={{ background: 'white', padding: '1.4rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.8rem', color: '#0F172A' }}>Draft History ({emails.length})</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>Your Name:</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', padding: '0.45rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {emails.map((e) => (
              <div
                key={e.id}
                onClick={() => setSelectedEmail(e)}
                style={{
                  background: selectedEmail?.id === e.id ? '#FEF2F2' : '#F8FAFC',
                  border: selectedEmail?.id === e.id ? '1px solid #E60023' : '1px solid #E2E8F0',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 800, color: '#E60023' }}>{e.course_code}</span>
                  <span style={{ fontSize: '0.68rem', background: e.status.includes('Sent') ? '#ECFDF5' : '#FEF3C7', color: e.status.includes('Sent') ? '#059669' : '#D97706', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                    {e.status.includes('Sent') ? 'Sent' : 'Draft'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.2rem', color: '#0F172A' }}>{e.instructor_name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Editor View */}
        <div className="email-clean-card">
          {selectedEmail ? (
            <div>
              <div className="email-meta-box">
                <div><strong>To:</strong> {selectedEmail.instructor_name} &lt;{selectedEmail.recipient_email}&gt;</div>
                <div style={{ marginTop: '0.2rem' }}><strong>Subject:</strong> {selectedEmail.subject}</div>
              </div>

              <textarea
                className="email-body-clean"
                rows={14}
                value={selectedEmail.body}
                onChange={(e) => setSelectedEmail({ ...selectedEmail, body: e.target.value })}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn-secondary-glow" onClick={handleCopyText}>
                  {copied ? (
                    <>
                      <CheckCircle2 size={15} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={15} /> Copy Text
                    </>
                  )}
                </button>

                <button
                  className="btn-primary-glow"
                  onClick={handleSend}
                  disabled={isSending || selectedEmail.status.includes('Sent')}
                >
                  {isSending ? (
                    <>
                      <div className="spinner-sm"></div>
                      <span>Dispatching Email...</span>
                    </>
                  ) : selectedEmail.status.includes('Sent') ? (
                    <>
                      <CheckCircle2 size={15} /> Sent via SMTP
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Send Extension Request
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
              Select or draft an extension request email.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
