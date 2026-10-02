import React from 'react';
import { 
  Bot, 
  Terminal, 
  AlertTriangle, 
  FileCode2, 
  BookOpen, 
  ShieldCheck, 
  Code2, 
  GitBranch, 
  GraduationCap,
  Sparkles,
  Server,
  Activity
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasGeminiKey: boolean;
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasGeminiKey,
  pendingApprovalsCount,
}) => {
  const tabs = [
    { id: 'chat', label: 'Agent Console', icon: Bot, badge: null },
    { id: 'incidents', label: 'Incident Commander', icon: AlertTriangle, badge: 'Live Lab' },
    { id: 'iac', label: 'IaC Generator', icon: FileCode2, badge: null },
    { id: 'runbooks', label: 'RAG Runbooks', icon: BookOpen, badge: null },
    { id: 'audit', label: 'Safety & Audit', icon: ShieldCheck, badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Gate` : null },
    { id: 'vscode', label: 'VS Code Guide', icon: Code2, badge: 'Download' },
    { id: 'deploy', label: 'GitHub & Deploy', icon: GitBranch, badge: 'Publish' },
    { id: 'concepts', label: 'Agentic AI 101', icon: GraduationCap, badge: 'College' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      {/* Top Banner with System Status */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800/80 flex flex-wrap items-center justify-between text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            DevOps Agent Core: Active
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Server className="h-3 w-3 text-cyan-400" />
            Model: {hasGeminiKey ? 'Gemini 3.8 Flash' : 'Hybrid Reasoning Engine'}
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <Activity className="h-3 w-3 text-amber-400" />
            Connected Tools: Kubectl, Docker, Git, Terraform, Prometheus
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded text-[11px] font-mono">
            College Edition
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Zero-Trust Human Gates: <span className="text-emerald-400 font-semibold">Enabled</span>
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">DevOpsGPT</h1>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> Agentic AI
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
              Intelligent DevOps Assistant with Reasoning, Tools & Human Safety Gates
            </p>
          </div>
        </div>

        {/* Tab switcher for desktop */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      tab.id === 'audit' && pendingApprovalsCount > 0
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden px-2 pb-2 overflow-x-auto flex items-center gap-1 border-t border-slate-800/80 bg-slate-900/90 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 shrink-0 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1 bg-slate-800 text-slate-300 rounded">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
