import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Terminal, HelpCircle } from 'lucide-react';
import { ApprovalRequest } from '../types/agent';

interface ApprovalModalProps {
  request: ApprovalRequest | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  onApprove,
  onReject,
  onClose,
}) => {
  if (!request) return null;

  const getRiskColor = (risk: string) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Human Approval Gate</h3>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${getRiskColor(request.riskLevel)}`}>
                  {request.riskLevel} Risk
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous agent execution paused. Confirmation required by DevOps engineer.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-sm text-slate-300">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Proposed Operation
            </div>
            <div className="text-white font-medium text-base bg-slate-950 p-3 rounded-xl border border-slate-800">
              {request.actionTitle}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" /> Exact Command to be Executed
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
              <code>{request.commandToExecute}</code>
            </div>
          </div>

          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Why is Human Approval Required?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {request.riskJustification}
            </p>
          </div>

          {/* College Educational Note */}
          <div className="bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-xl flex items-start gap-2.5 text-xs text-indigo-300">
            <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-200">College Concept Note: </span>
              In production DevOps, giving an autonomous LLM unconstrained root or write access can lead to accidental downtime or data loss. Human-in-the-loop (HITL) gates establish zero-trust boundaries where the agent plans and advises, but humans authorize changes.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={() => onReject(request.id)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <XCircle className="h-4 w-4 text-rose-400" />
            <span>Deny & Abort Action</span>
          </button>
          <button
            onClick={() => onApprove(request.id)}
            className="px-5 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Authorize & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};
