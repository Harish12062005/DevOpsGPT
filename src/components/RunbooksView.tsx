import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Database,
  Tag,
  Calendar,
  User,
  Sparkles
} from 'lucide-react';
import { Runbook } from '../types/agent';
import { INITIAL_RUNBOOKS } from '../data/devopsData';

interface RunbooksViewProps {
  runbooks: Runbook[];
  onAddRunbook: (rb: Runbook) => void;
}

export const RunbooksView: React.FC<RunbooksViewProps> = ({ runbooks, onAddRunbook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRunbook, setSelectedRunbook] = useState<Runbook>(runbooks[0] || INITIAL_RUNBOOKS[0]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newCategory, setNewCategory] = useState<'Kubernetes' | 'Docker' | 'Monitoring' | 'CI/CD' | 'IaC'>('Kubernetes');
  const [newRisk, setNewRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [newSteps, setNewSteps] = useState('');
  const [newKeywords, setNewKeywords] = useState('');

  const filteredRunbooks = runbooks.filter((rb) => {
    const q = searchTerm.toLowerCase();
    return (
      rb.title.toLowerCase().includes(q) ||
      rb.trigger.toLowerCase().includes(q) ||
      rb.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  });

  const handleCreateRunbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSteps.trim()) return;

    const created: Runbook = {
      id: `rb-${Date.now()}`,
      title: newTitle.trim(),
      trigger: newTrigger.trim() || 'Custom Trigger',
      category: newCategory,
      riskLevel: newRisk,
      author: 'Harish (Student DevOps)',
      lastUpdated: new Date().toISOString().split('T')[0],
      keywords: newKeywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean),
      steps: newSteps.split('\n').filter((s) => s.trim().length > 0),
    };

    onAddRunbook(created);
    setSelectedRunbook(created);
    setShowAddModal(false);
    // Reset form
    setNewTitle('');
    setNewTrigger('');
    setNewSteps('');
    setNewKeywords('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              RAG Knowledge Base & Operational Runbooks
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Retrieval-Augmented Generation (RAG) grounds the Agentic AI in verified team runbooks, preventing hallucinations during high-pressure incidents.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Runbook</span>
        </button>
      </div>

      {/* College Concept Card */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl text-xs text-indigo-200 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white text-sm">How RAG Works in This DevOps Assistant (Simple College Level):</span>
          <p className="text-slate-300 leading-relaxed">
            Instead of relying solely on an LLM's frozen training memory (which can generate outdated or hallucinated shell commands), the assistant indexes your team's standard operating procedures (SOPs). When an engineer asks a question or an alert fires, the agent executes semantic keyword retrieval to find the exact runbook and injects the proven commands into the LLM's reasoning context.
          </p>
        </div>
      </div>

      {/* Search & Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search runbooks by keyword (e.g. 'crashloop', '500', 'oom')..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            {filteredRunbooks.map((rb) => {
              const isSelected = selectedRunbook.id === rb.id;
              return (
                <button
                  key={rb.id}
                  onClick={() => setSelectedRunbook(rb)}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {rb.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        rb.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : rb.riskLevel === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      {rb.riskLevel}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white truncate">{rb.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Trigger: {rb.trigger}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Runbook Details View */}
        <div className="lg:col-span-2">
          {selectedRunbook ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedRunbook.title}</h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {selectedRunbook.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> Author: {selectedRunbook.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Updated: {selectedRunbook.lastUpdated}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-mono uppercase px-3 py-1 rounded-lg border font-semibold self-start ${
                    selectedRunbook.riskLevel === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : selectedRunbook.riskLevel === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  {selectedRunbook.riskLevel} Risk
                </span>
              </div>

              {/* Trigger Info */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Activation Trigger Condition</span>
                </div>
                <div className="text-xs font-mono text-amber-200">
                  {selectedRunbook.trigger}
                </div>
              </div>

              {/* Sequential Steps */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Step-by-Step Resolution Workflow</span>
                </div>
                <div className="space-y-2">
                  {selectedRunbook.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-200 font-mono leading-relaxed"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords Tag Cloud */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-indigo-400" />
                  <span>RAG Semantic Match Keywords</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRunbook.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
              Select a runbook from the left to inspect its procedures.
            </div>
          )}
        </div>
      </div>

      {/* Add Runbook Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Incident Runbook</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateRunbook} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Runbook Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Redis Cache Memory Eviction Runbook"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Kubernetes">Kubernetes</option>
                    <option value="Docker">Docker</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="CI/CD">CI/CD</option>
                    <option value="IaC">IaC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Risk Level</label>
                  <select
                    value={newRisk}
                    onChange={(e: any) => setNewRisk(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trigger Condition</label>
                <input
                  type="text"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="e.g. Memory usage > 90% or maxmemory alert"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resolution Steps (One per line)</label>
                <textarea
                  rows={4}
                  value={newSteps}
                  onChange={(e) => setNewSteps(e.target.value)}
                  placeholder="Step 1: Check redis INFO stats&#10;Step 2: Increase maxmemory policy&#10;Step 3: Flush expired keys"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keywords (Comma-separated)</label>
                <input
                  type="text"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  placeholder="redis, cache, memory, eviction, oom"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save to RAG Base
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
