import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WorkloadAuditor from './components/WorkloadAuditor';
import AnnouncementParser from './components/AnnouncementParser';
import TaskQueue from './components/TaskQueue';
import EffortEstimator from './components/EffortEstimator';
import EmailGenerator from './components/EmailGenerator';
import AgentTerminal from './components/AgentTerminal';

import {
  fetchHealth,
  fetchCourses,
  fetchTasks,
  fetchEmails,
  fetchAgentLogs,
  parseAnnouncement,
  addTask,
  updateTaskStatus,
  reprioritizeQueue,
  generateExtensionEmail,
  sendExtensionEmail,
  runAutonomousPipeline
} from './services/api';

import { INITIAL_COURSES, INITIAL_TASKS } from './data/initialData';
import { calculateWorkloadDensity, detectBottlenecks, reprioritizeQueue as localReprioritize } from './utils/schedulerEngine';
import './App.css';
import confetti from 'canvas-confetti';
import { Search, Bell, Zap, Plus, Cpu, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [turboMode, setTurboMode] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Core Data States
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [tasks, setTasks] = useState(localReprioritize(INITIAL_TASKS));
  const [densityData, setDensityData] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [emails, setEmails] = useState([]);
  const [agentLogs, setAgentLogs] = useState([
    {
      id: 'log-init',
      action_type: 'SYSTEM',
      message: 'Google Antigravity Pulse AI Engine initialized in Turbo / Autonomous mode.',
      timestamp: new Date().toISOString()
    }
  ]);

  const dailyCapacityLimit = 7.0;

  // Initialize data on mount
  useEffect(() => {
    async function initData() {
      try {
        const health = await fetchHealth();
        setDbConnected(health.postgresConnected || false);

        const fetchedCourses = await fetchCourses();
        if (fetchedCourses && fetchedCourses.length > 0) setCourses(fetchedCourses);

        const fetchedTasks = await fetchTasks();
        if (fetchedTasks && fetchedTasks.length > 0) setTasks(fetchedTasks);

        const fetchedEmails = await fetchEmails();
        if (fetchedEmails) setEmails(fetchedEmails);

        const fetchedLogs = await fetchAgentLogs();
        if (fetchedLogs && fetchedLogs.length > 0) setAgentLogs(fetchedLogs);
      } catch (err) {
        console.warn('Backend API connection note: operating with live frontend fallback', err);
      }
    }
    initData();
  }, []);

  // Recalculate density & bottlenecks whenever tasks change
  useEffect(() => {
    const audit = calculateWorkloadDensity(tasks, dailyCapacityLimit, 7);
    setDensityData(audit);
    const b = detectBottlenecks(tasks, dailyCapacityLimit);
    setBottlenecks(b);
  }, [tasks]);

  // Handler: Run Full Autonomous Pipeline
  const handleRunPipeline = async () => {
    setIsPipelineRunning(true);
    setIsTerminalOpen(true);

    try {
      const res = await runAutonomousPipeline();
      if (res && res.pipelineResult) {
        if (res.pipelineResult.tasks) setTasks(res.pipelineResult.tasks);
        
        const updatedLogs = await fetchAgentLogs();
        if (updatedLogs && updatedLogs.length > 0) setAgentLogs(updatedLogs);

        const updatedEmails = await fetchEmails();
        if (updatedEmails) setEmails(updatedEmails);

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      }
    } catch (err) {
      console.warn('Pipeline run fallback:', err);
    } finally {
      setIsPipelineRunning(false);
    }
  };

  // Handler: Parse Announcement Text
  const handleParseAnnouncement = async (rawText) => {
    setIsParsing(true);
    try {
      const res = await parseAnnouncement(rawText, dailyCapacityLimit);
      if (res && res.parsedTask) {
        const updatedTasks = localReprioritize([res.parsedTask, ...tasks]);
        setTasks(updatedTasks);

        const updatedLogs = await fetchAgentLogs();
        if (updatedLogs && updatedLogs.length > 0) setAgentLogs(updatedLogs);

        return res;
      }
    } catch (err) {
      console.warn('Parse announcement error fallback:', err);
    } finally {
      setIsParsing(false);
    }
  };

  // Handler: Add New Task
  const handleAddNewTask = async (taskData) => {
    try {
      const res = await addTask(taskData);
      if (res && res.tasks) {
        setTasks(res.tasks);
      } else {
        const newTaskObj = {
          ...taskData,
          id: `task-${Date.now()}`,
          priority_score: 80,
        };
        setTasks(localReprioritize([newTaskObj, ...tasks]));
      }
    } catch (err) {
      const newTaskObj = {
        ...taskData,
        id: `task-${Date.now()}`,
        priority_score: 80,
      };
      setTasks(localReprioritize([newTaskObj, ...tasks]));
    }
  };

  // Handler: Update Task Status
  const handleUpdateStatus = async (taskId, newStatus) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
      return localReprioritize(updated);
    });

    try {
      const res = await updateTaskStatus(taskId, newStatus);
      if (res && res.tasks) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.warn('Backend task status sync note:', err.message);
    }
  };

  // Handler: Re-sort Queue
  const handleReprioritize = async () => {
    try {
      const res = await reprioritizeQueue();
      if (res && res.tasks) setTasks(res.tasks);
      else setTasks(localReprioritize(tasks));
    } catch (err) {
      setTasks(localReprioritize(tasks));
    }
  };

  // Handler: Extension Email Operations
  const handleGenerateEmail = async (bDate, taskId, studentName) => {
    try {
      const res = await generateExtensionEmail(bDate, taskId, studentName);
      if (res && res.email) {
        setEmails((prev) => [res.email, ...prev]);
        return res;
      }
    } catch (err) {
      console.warn('Generate email error:', err);
    }
  };

  const handleSendEmail = async (emailId) => {
    try {
      const res = await sendExtensionEmail(emailId);
      if (res && res.email) {
        setEmails((prev) => prev.map((e) => (e.id === emailId ? res.email : e)));
      }
    } catch (err) {
      setEmails((prev) =>
        prev.map((e) => (e.id === emailId ? { ...e, status: 'Sent (Simulated)' } : e))
      );
    }
  };

  const handleOpenEmailStudioForDate = (date) => {
    setActiveTab('email');
    handleGenerateEmail(date, tasks[0]?.id, 'Alex Rivera');
  };

  return (
    <div className="app-master-layout">
      {/* Vertical Gradient Left Sidebar (Matching Reference Image 1 & 2 Sidebar) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        turboMode={turboMode}
        setTurboMode={setTurboMode}
        bottlenecksCount={bottlenecks.length}
        onRunPipeline={handleRunPipeline}
        isPipelineRunning={isPipelineRunning}
        toggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        isTerminalOpen={isTerminalOpen}
        dbConnected={dbConnected}
      />

      {/* Main Canvas Area */}
      <main className="main-canvas-area">
        {/* Canvas Header Bar (Matching Image 2 Greeting & Search Header) */}
        <header className="canvas-header-bar">
          <div className="header-greeting">
            <h2>Good morning, Alex! 👋</h2>
            <p>You have {tasks.filter(t => t.status !== 'Completed').length} active deliverables for this week ({bottlenecks.length} overload bottleneck alert)</p>
          </div>

          <div className="header-right-tools">
            <div className="turbo-mode-pill">
              <span className="pulsing-dot"></span>
              <span>ReAct Auto Pipeline ON</span>
            </div>

            <button className="btn-canvas-primary" onClick={handleRunPipeline} disabled={isPipelineRunning}>
              <Zap size={16} />
              <span>{isPipelineRunning ? 'Fixing...' : '✨ Auto-Fix Schedule'}</span>
            </button>

            <button className="btn-icon-round" onClick={() => setIsTerminalOpen(!isTerminalOpen)} title="Toggle Agent Log Trace">
              <Cpu size={18} />
            </button>
          </div>
        </header>

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <WorkloadAuditor
            densityData={densityData}
            bottlenecks={bottlenecks}
            dailyLimit={dailyCapacityLimit}
            onTriggerMitigation={handleRunPipeline}
            onOpenEmailStudio={handleOpenEmailStudioForDate}
            tasks={tasks}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'parser' && (
          <AnnouncementParser
            onParseAnnouncement={handleParseAnnouncement}
            isParsing={isParsing}
          />
        )}

        {activeTab === 'queue' && (
          <TaskQueue
            tasks={tasks}
            courses={courses}
            onUpdateStatus={handleUpdateStatus}
            onAddNewTask={handleAddNewTask}
            onReprioritize={handleReprioritize}
          />
        )}

        {activeTab === 'estimator' && <EffortEstimator />}

        {activeTab === 'email' && (
          <EmailGenerator
            emails={emails}
            bottlenecks={bottlenecks}
            tasks={tasks}
            courses={courses}
            onGenerateEmail={handleGenerateEmail}
            onSendEmail={handleSendEmail}
          />
        )}
      </main>

      {/* Antigravity ReAct Agent Real-time Log Console Drawer */}
      <AgentTerminal
        logs={agentLogs}
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onClearLogs={() => setAgentLogs([])}
      />
    </div>
  );
}
