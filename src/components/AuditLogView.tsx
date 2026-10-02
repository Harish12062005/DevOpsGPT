import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Filter, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  UserCheck,
  Cpu
} from 'lucide-react';
import { AuditLogEntry } from '../types/agent';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterRisk === 'ALL') return true;
    return log.riskLevel === filterRisk;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `devops-audit-log-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Zero-Trust Audit Trail & Safety Governance
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every autonomous agent reasoning step, tool invocation, and human authorization is logged immutably for compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">LOW Risk</option>
              <option value="MEDIUM">MEDIUM Risk</option>
              <option value="HIGH">HIGH Risk</option>
              <option value="CRITICAL">CRITICAL Risk</option>
            </select>
          </div>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* College Architecture Note */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <Cpu className="h-4 w-4" /> Autonomous Read Operations
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Read-only queries (kubectl get, docker ps, prometheus query) run automatically without blocking engineer workflows.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <UserCheck className="h-4 w-4" /> Human-in-the-Loop Gating
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Destructive mutations (rollbacks, pod restarts, terraform apply) pause execution and require explicit cryptographic sign-off.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-rose-400 font-semibold">
            <ShieldCheck className="h-4 w-4" /> Hard Guardrails Intercept
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Forbidden commands (e.g. `rm -rf`, `delete namespace prod`) are hard-blocked by the deterministic proxy before LLM execution.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Tool</th>
                <th className="px-4 py-3">Command Executed</th>
                <th className="px-4 py-3">Risk Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Governance Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => {
                const getStatusBadge = (status: string) => {
                  switch (status) {
                    case 'APPROVED':
                    case 'EXECUTED':
                      return (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="h-3 w-3" /> {status}
                        </span>
                      );
                    case 'AUTO_BLOCKED':
                    case 'DENIED':
                      return (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          <XCircle className="h-3 w-3" /> {status}
                        </span>
                      );
                    default:
                      return (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {status}
                        </span>
                      );
                  }
                };

                const getRiskBadge = (risk: string) => {
                  switch (risk) {
                    case 'CRITICAL':
                      return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
                    case 'HIGH':
                      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                    case 'MEDIUM':
                      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
                    default:
                      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
                  }
                };

                return (
                  <tr key={log.id} className="hover:bg-slate-850/60 transition">
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">
                      {log.operator}
                    </td>
                    <td className="px-4 py-3 font-mono uppercase text-cyan-400 font-semibold">
                      {log.tool}
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-300 max-w-xs truncate">
                      <code>{log.command}</code>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getRiskBadge(log.riskLevel)}`}>
                        {log.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{log.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
