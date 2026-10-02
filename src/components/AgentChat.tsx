import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Cpu, 
  RefreshCw, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Copy, 
  Check, 
  Info,
  Server,
  Zap
} from 'lucide-react';
import { ChatMessage, ApprovalRequest, ToolCall } from '../types/agent';

interface AgentChatProps {
  messages: ChatMessage[];
  isThinking: boolean;
  onSendMessage: (text: string) => void;
  onRequestApprovalModal: (approval: ApprovalRequest) => void;
  onClearHistory: () => void;
  activeEnvironment: string;
  setActiveEnvironment: (env: string) => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  messages,
  isThinking,
  onSendMessage,
  onRequestApprovalModal,
  onClearHistory,
  activeEnvironment,
  setActiveEnvironment,
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const toggleSteps = (msgId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickPrompts = [
    {
      label: '🚨 CrashLoopBackOff Pod',
      prompt: 'Investigate CrashLoopBackOff on payment-service pod in production namespace.',
    },
    {
      label: '📈 Ingress 500 Error Spike',
      prompt: 'High 500 error spike detected on api-gateway after recent deployment. Correlate Prometheus metrics and suggest fix.',
    },
    {
      label: '💥 OOMKilled Container (137)',
      prompt: 'Our data-pipeline-worker container died with Exit Code 137 (OOMKilled). Diagnose root cause.',
    },
    {
      label: '🏗️ Terraform AWS EKS IaC',
      prompt: 'Generate Terraform HCL for an AWS EKS Kubernetes cluster with 3 worker nodes and least privilege IAM.',
    },
    {
      label: '🐳 Dockerfile Security Audit',
      prompt: 'Audit our Node.js Dockerfile for root privilege vulnerabilities and optimize multi-stage build size.',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* Top Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Server className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-medium text-slate-300">Target Cluster:</span>
          </div>
          <select
            value={activeEnvironment}
            onChange={(e) => setActiveEnvironment(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="production-k8s">production-k8s (AWS EKS us-east-1)</option>
            <option value="staging-cluster">staging-cluster (GCP GKE us-central1)</option>
            <option value="docker-local">docker-local (Local Daemon)</option>
          </select>
          <span className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Connected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800 border border-slate-800 transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset Session</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const breakdown = msg.breakdown;
          const isStepsOpen = expandedSteps[msg.id] ?? true; // open by default for transparency

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400 px-1">
                {isUser ? (
                  <>
                    <span>DevOps Engineer</span>
                    <span className="text-slate-600">•</span>
                    <span>{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-cyan-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-cyan-400" /> DevOpsGPT Agent
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded text-[10px]">
                      {msg.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'ReAct Engine'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>{msg.timestamp}</span>
                  </>
                )}
              </div>

              {/* Message Body */}
              <div
                className={`rounded-2xl p-4 max-w-4xl w-full border ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-900/40 to-indigo-900/40 border-cyan-700/50 text-slate-100 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-200 shadow-lg'
                }`}
              >
                {/* User Message Text */}
                {isUser && <p className="text-sm font-medium">{msg.text}</p>}

                {/* Assistant Agent Response */}
                {!isUser && breakdown && (
                  <div className="space-y-4">
                    {/* Collapsible Agent Reasoning & Plan */}
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                      <button
                        onClick={() => toggleSteps(msg.id)}
                        className="w-full px-3.5 py-2.5 bg-slate-800/40 hover:bg-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-300 transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Agent Reasoning & Tool Chain (ReAct Cycle)</span>
                          {breakdown.confidenceScore && (
                            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-[10px] px-1.5 py-0.2 rounded">
                              {breakdown.confidenceScore}% Confidence
                            </span>
                          )}
                        </span>
                        {isStepsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>

                      {isStepsOpen && (
                        <div className="p-3.5 space-y-3.5 text-xs text-slate-300 border-t border-slate-800/60 divide-y divide-slate-800/40">
                          {/* 1. Thought / ReAct */}
                          <div>
                            <div className="font-semibold text-cyan-400 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
                              <span>1. Observation & Agent Thought</span>
                            </div>
                            <p className="text-slate-300 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed font-sans">
                              {breakdown.thought}
                            </p>
                          </div>

                          {/* 2. Plan */}
                          <div className="pt-2.5">
                            <div className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
                              <span>2. Multi-Step Execution Plan</span>
                            </div>
                            <ol className="list-decimal list-inside space-y-1 text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
                              {breakdown.plan.map((step, idx) => (
                                <li key={idx} className="leading-relaxed">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* 3. RAG Runbook Match */}
                          {breakdown.retrievedRunbook && (
                            <div className="pt-2.5">
                              <div className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
                                <BookOpen className="h-3 w-3" />
                                <span>3. RAG Runbook Retrieved from Knowledge Base</span>
                              </div>
                              <div className="bg-emerald-950/20 border border-emerald-800/40 p-2.5 rounded-lg text-emerald-300 space-y-1">
                                <div className="font-semibold text-emerald-200">
                                  {breakdown.retrievedRunbook.title}
                                </div>
                                <div className="text-[11px] text-emerald-400/90">
                                  Trigger Condition: {breakdown.retrievedRunbook.trigger}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. Tool Execution Terminals */}
                          {breakdown.toolCalls && breakdown.toolCalls.length > 0 && (
                            <div className="pt-2.5">
                              <div className="font-semibold text-amber-400 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
                                <Terminal className="h-3 w-3" />
                                <span>4. DevOps Tools Invocations</span>
                              </div>
                              <div className="space-y-2">
                                {breakdown.toolCalls.map((tc, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden font-mono"
                                  >
                                    <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
                                      <span className="flex items-center gap-1.5">
                                        <span className="text-cyan-400 font-bold uppercase">{tc.tool}</span>
                                        <span className="text-slate-600">|</span>
                                        <span className="text-slate-300">{tc.purpose}</span>
                                      </span>
                                      <button
                                        onClick={() => handleCopy(tc.command, `${msg.id}-${idx}`)}
                                        className="hover:text-white p-0.5 text-slate-400 flex items-center gap-1 cursor-pointer text-[10px]"
                                      >
                                        {copiedIndex === `${msg.id}-${idx}` ? (
                                          <Check className="h-3 w-3 text-emerald-400" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </button>
                                    </div>
                                    <div className="p-2.5 text-xs text-amber-300 overflow-x-auto whitespace-pre-wrap">
                                      $ {tc.command}
                                    </div>
                                    {tc.simulatedOutput && (
                                      <div className="px-2.5 pb-2 text-[11px] text-slate-400 border-t border-slate-900/60 pt-1.5 whitespace-pre-wrap">
                                        {tc.simulatedOutput}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Human Approval Gate Widget (If High-Risk Action Detected) */}
                    {breakdown.needsHumanApproval && breakdown.approvalDetails && (
                      <div className="bg-amber-950/20 border-2 border-amber-500/40 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                              <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  Human Approval Gate Activated
                                </span>
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                                  {breakdown.approvalDetails.riskLevel} Risk
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-0.5">
                                {breakdown.approvalDetails.actionTitle}
                              </p>
                            </div>
                          </div>

                          {msg.approval?.status === 'approved' ? (
                            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approved & Executed
                            </span>
                          ) : msg.approval?.status === 'rejected' ? (
                            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              Denied by Operator
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                if (msg.approval) {
                                  onRequestApprovalModal(msg.approval);
                                } else {
                                  onRequestApprovalModal({
                                    id: `appr-${msg.id}`,
                                    actionTitle: breakdown.approvalDetails!.actionTitle,
                                    commandToExecute: breakdown.approvalDetails!.commandToExecute,
                                    riskLevel: breakdown.approvalDetails!.riskLevel,
                                    riskJustification: breakdown.approvalDetails!.riskJustification,
                                    status: 'pending',
                                  });
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                              <span>Review & Authorize</span>
                            </button>
                          )}
                        </div>

                        <div className="bg-slate-950 p-2 rounded-lg font-mono text-xs text-amber-300 border border-slate-800">
                          <code>{breakdown.approvalDetails.commandToExecute}</code>
                        </div>
                      </div>
                    )}

                    {/* Final Diagnosis & Recommended Action */}
                    <div className="space-y-3 pt-1">
                      <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                        <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>Agent Diagnosis</span>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed font-medium">
                          {breakdown.diagnosisOrSummary}
                        </p>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Recommended Remediation & Commands
                        </div>
                        <div className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                          {breakdown.recommendedFix}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback plain text if breakdown not present */}
                {!isUser && !breakdown && (
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl max-w-md animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 animate-spin" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>DevOpsGPT is Reasoning</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Formulating multi-step plan & inspecting tools (Kubectl, Docker, Prometheus)...
              </p>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* College Scenario Pills */}
      <div className="py-2.5 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-400" /> College Scenarios:
        </span>
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(item.prompt)}
            disabled={isThinking}
            className="text-xs whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition disabled:opacity-50 cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="relative mt-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask DevOpsGPT (e.g., 'Investigate CrashLoopBackOff on payment-service' or 'Generate Terraform for EKS')..."
          disabled={isThinking}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-4 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-xl"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isThinking}
          className="absolute right-2 top-2 h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
