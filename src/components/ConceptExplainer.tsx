import React from 'react';
import { 
  GraduationCap, 
  BrainCircuit, 
  Cpu, 
  Wrench, 
  BookOpen, 
  ShieldAlert, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const ConceptExplainer: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Agentic AI Explained (Simple College Level)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Understand the fundamental differences between simple LLM chatbots and autonomous Agentic AI systems for your viva or project presentation.
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800 hidden sm:inline">
          Viva & Viva-Voce Study Guide
        </span>
      </div>

      {/* 1. Comparison: Chatbot vs Agentic AI */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 px-1">
          <BrainCircuit className="h-4 w-4 text-cyan-400" />
          <span>1. Traditional Chatbot vs. Agentic AI (Core Difference)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chatbot */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                <XCircle className="h-4 w-4" /> Traditional LLM Chatbot
              </h4>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                Passive
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standard chatbots (like basic ChatGPT without tools) only predict the next token based on text. They cannot observe your Kubernetes cluster, cannot run `docker ps`, cannot fetch Prometheus metrics, and often hallucinate non-existent CLI flags.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-400">
              User: "Why is pod crashing?"<br />
              Bot: "Pod could crash due to many reasons like memory or config. Try running some kubectl command." (No real investigation).
            </div>
          </div>

          {/* Agentic AI */}
          <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/40 p-5 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Agentic AI (DevOps Assistant)
              </h4>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Autonomous + Goal-Oriented
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              An Agent combines an LLM reasoning core with a closed-loop ReAct cycle (Reason + Act). It formulates a multi-step plan, actually invokes tools (kubectl, prometheus), retrieves team runbooks, diagnoses the exact cause, and asks human permission before rollback.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300">
              User: "Why is pod crashing?"<br />
              Agent: 1) Runs `kubectl get pods` → 2) Runs `kubectl logs` → 3) Identifies Postgres password mismatch → 4) Requests approval for rollback!
            </div>
          </div>
        </div>
      </div>

      {/* 2. The ReAct Pattern Loop */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="h-4 w-4 text-indigo-400" />
          <span>2. The 4 Stages of the ReAct Loop (Reason + Act)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-cyan-400 font-bold uppercase font-mono text-[11px]">Stage 1: Observation</div>
            <p className="text-slate-300 leading-relaxed">
              The agent receives alerts, user queries, or metric threshold breaches from Prometheus / Alertmanager.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-indigo-400 font-bold uppercase font-mono text-[11px]">Stage 2: Thought & Plan</div>
            <p className="text-slate-300 leading-relaxed">
              The reasoning core (Gemini) breaks the incident down into logical steps and matches it with the RAG runbook database.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-amber-400 font-bold uppercase font-mono text-[11px]">Stage 3: Tool Execution</div>
            <p className="text-slate-300 leading-relaxed">
              The agent dispatches CLI calls (`kubectl`, `docker`, `git`) through a secure, sandboxed execution layer.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-emerald-400 font-bold uppercase font-mono text-[11px]">Stage 4: Human Gate & Fix</div>
            <p className="text-slate-300 leading-relaxed">
              If an action is high-risk (like deployment rollback), the agent halts for engineer authorization before applying.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Open Challenges in DevOps AI (from Abstract) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 px-1">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <span>3. Open Research Challenges Addressed in Our Work</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Challenge 1: Hallucinated Commands</span>
              <span className="text-[10px] text-amber-400 font-mono">High Risk</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong className="text-slate-200">The Problem:</strong> LLMs can invent shell flags or destructive syntax that crashes nodes.<br />
              <strong className="text-cyan-400">Our Solution:</strong> Tool whitelist validation and dry-run execution checks prior to shell dispatch.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Challenge 2: Credential & Secret Security</span>
              <span className="text-[10px] text-rose-400 font-mono">Critical</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong className="text-slate-200">The Problem:</strong> Storing cluster admin kubeconfig in prompts risks prompt injection attacks.<br />
              <strong className="text-cyan-400">Our Solution:</strong> Least-privilege ServiceAccounts; agent never sees master database passwords.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Challenge 3: Explainability & Auditability</span>
              <span className="text-[10px] text-indigo-400 font-mono">Governance</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong className="text-slate-200">The Problem:</strong> "Black box" AI decisions violate SOC2 and enterprise compliance.<br />
              <strong className="text-cyan-400">Our Solution:</strong> Every reasoning chain, tool command, and human approval signature is logged to an immutable audit trail.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Challenge 4: LLM Inference Cost & Latency</span>
              <span className="text-[10px] text-emerald-400 font-mono">Efficiency</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong className="text-slate-200">The Problem:</strong> Sending megabytes of log files into large LLMs is slow and expensive.<br />
              <strong className="text-cyan-400">Our Solution:</strong> Local pre-filtering (grep, tail) combined with fast reasoning models like Gemini 3.8 Flash.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
