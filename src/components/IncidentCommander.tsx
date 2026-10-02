import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  Terminal, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  ShieldAlert,
  Server,
  Cpu,
  BarChart3
} from 'lucide-react';
import { IncidentScenario } from '../types/agent';
import { INCIDENT_SCENARIOS } from '../data/devopsData';

interface IncidentCommanderProps {
  onTriageIncident: (scenario: IncidentScenario) => void;
}

export const IncidentCommander: React.FC<IncidentCommanderProps> = ({ onTriageIncident }) => {
  const [selectedIncident, setSelectedIncident] = useState<IncidentScenario>(INCIDENT_SCENARIOS[0]);
  const [resolvedMap, setResolvedMap] = useState<Record<string, boolean>>({});

  const handleResolveSimulation = (id: string) => {
    setResolvedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Flame className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Incident Commander & Root Cause Lab
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate real production outages. Watch the Agentic Assistant correlate metrics, inspect logs, and formulate safe mitigations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Active Outages: <span className="text-rose-400 font-bold">{INCIDENT_SCENARIOS.length} Scenarios</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Incident Scenario Selector */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Select Failure Scenario</span>
          </div>

          <div className="space-y-2.5">
            {INCIDENT_SCENARIOS.map((inc) => {
              const isSelected = selectedIncident.id === inc.id;
              const isResolved = resolvedMap[inc.id];

              return (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                        inc.severity.includes('P1')
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : inc.severity.includes('P2')
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                      }`}
                    >
                      {inc.severity}
                    </span>

                    {isResolved ? (
                      <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span> Triggered
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white truncate">{inc.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{inc.description}</p>
                  
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Target: <code className="text-slate-300 font-mono">{inc.service}</code></span>
                    <span className="text-slate-500">{inc.environment}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Live Incident Inspection & Action */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
            {/* Header of selected incident */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{selectedIncident.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedIncident.service}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedIncident.description}</p>
              </div>

              {/* Triage Button */}
              <button
                onClick={() => onTriageIncident(selectedIncident)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-lg shadow-cyan-600/25 transition flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Dispatch Agent to Triage</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Live Metrics Grid */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                <span>Simulated Prometheus & Node Telemetry</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Error Rate (5xx)</div>
                  <div className={`text-base font-bold mt-1 ${selectedIncident.metrics.errorRate.includes('%') && parseFloat(selectedIncident.metrics.errorRate) > 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {selectedIncident.metrics.errorRate}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">P95 Latency</div>
                  <div className="text-base font-bold mt-1 text-amber-400">
                    {selectedIncident.metrics.p95Latency}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">CPU Load</div>
                  <div className="text-base font-bold mt-1 text-slate-200">
                    {selectedIncident.metrics.cpu}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Memory Working Set</div>
                  <div className={`text-base font-bold mt-1 ${selectedIncident.metrics.memory.includes('100%') ? 'text-rose-400' : 'text-slate-200'}`}>
                    {selectedIncident.metrics.memory}
                  </div>
                </div>
              </div>
            </div>

            {/* Symptoms Detected */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>Observed Symptoms</span>
              </div>
              <ul className="space-y-1.5">
                {selectedIncident.symptoms.map((symptom, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Container / Cluster Raw Logs Stream */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  <span>Real-time Stacktrace / Container Logs</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Live Tail</span>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {selectedIncident.logsSnippet}
              </div>
            </div>

            {/* Footer with suggested action */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span className="text-slate-300">
                  Recommended Agent Prompt: <span className="text-cyan-300 italic">"{selectedIncident.suggestedPrompt}"</span>
                </span>
              </div>
              <button
                onClick={() => handleResolveSimulation(selectedIncident.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  resolvedMap[selectedIncident.id]
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {resolvedMap[selectedIncident.id] ? 'Marked as Resolved ✓' : 'Toggle Resolved'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
