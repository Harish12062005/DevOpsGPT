import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AgentChat } from './components/AgentChat';
import { IncidentCommander } from './components/IncidentCommander';
import { IaCGenerator } from './components/IaCGenerator';
import { RunbooksView } from './components/RunbooksView';
import { AuditLogView } from './components/AuditLogView';
import { VSCodeGuide } from './components/VSCodeGuide';
import { GitHubDeployGuide } from './components/GitHubDeployGuide';
import { ConceptExplainer } from './components/ConceptExplainer';
import { ApprovalModal } from './components/ApprovalModal';
import { ChatMessage, ApprovalRequest, Runbook, AuditLogEntry, IncidentScenario } from './types/agent';
import { INITIAL_RUNBOOKS, AUDIT_LOG_SEED } from './data/devopsData';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init',
    role: 'assistant',
    text: 'Hello Engineer! I am DevOpsGPT, your Agentic AI DevOps Assistant. I combine reasoning, tools (Kubectl, Docker, Git, Terraform, Prometheus), runbooks, and zero-trust human approval gates to keep your clusters healthy. How can I assist you today?',
    timestamp: '15:20:00',
    source: 'simulated-agent-engine',
    breakdown: {
      thought: 'System initialized. Connected to production Kubernetes cluster, Docker daemon, and Prometheus metrics engine. Standing by for incident response, IaC generation, or log correlation.',
      plan: [
        'Awaiting natural language request from DevOps engineer',
        'Will match request against verified team runbooks',
        'Will inspect infrastructure using read-only CLI tools',
        'Will halt for human approval prior to executing any destructive changes',
      ],
      retrievedRunbook: {
        title: 'Kubernetes Pod CrashLoopBackOff Incident Runbook',
        trigger: 'Pod Status: CrashLoopBackOff',
        relevantSteps: [
          'Inspect namespace pods',
          'Check logs --previous',
          'Request human approval for rollback',
        ],
      },
      toolCalls: [
        {
          tool: 'kubectl',
          command: 'kubectl cluster-info',
          purpose: 'Verify cluster control plane health',
          simulatedOutput: 'Kubernetes control plane is running at https://eks.us-east-1.amazonaws.com\nCoreDNS is running at https://eks.us-east-1.amazonaws.com/dns',
        },
      ],
      needsHumanApproval: false,
      diagnosisOrSummary: 'DevOpsGPT is fully operational. You can test incident triage, generate Terraform/Docker manifests, or check the VS Code guide.',
      recommendedFix: 'Select a quick scenario below (e.g., "CrashLoopBackOff Pod" or "Ingress 500 Error Spike") to watch the full ReAct agent loop in action!',
      confidenceScore: 99,
    },
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [activeApproval, setActiveApproval] = useState<ApprovalRequest | null>(null);
  const [runbooks, setRunbooks] = useState<Runbook[]>(INITIAL_RUNBOOKS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(AUDIT_LOG_SEED);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [activeEnvironment, setActiveEnvironment] = useState<string>('production-k8s');

  // Check backend health & Gemini status on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasGeminiKey) {
          setHasGeminiKey(true);
        }
      })
      .catch((err) => {
        console.warn('Backend health check note:', err?.message);
      });
  }, []);

  const pendingApprovalsCount = messages.filter((m) => m.approval?.status === 'pending').length;

  const handleSendMessage = async (text: string) => {
    const userMsgId = `usr-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text,
      timestamp,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsThinking(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          activeEnvironment,
          conversationHistory: messages.slice(-4).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      const asstMsgId = `asst-${Date.now()}`;

      let approvalObj: ApprovalRequest | undefined = undefined;
      if (data.needsHumanApproval && data.approvalDetails) {
        approvalObj = {
          id: `appr-${Date.now()}`,
          actionTitle: data.approvalDetails.actionTitle || 'DevOps Action Authorization',
          commandToExecute: data.approvalDetails.commandToExecute,
          riskLevel: data.approvalDetails.riskLevel || 'HIGH',
          riskJustification: data.approvalDetails.riskJustification || 'High-impact operation requires human approval.',
          status: 'pending',
        };

        // Add to audit log
        const auditEntry: AuditLogEntry = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          operator: 'DevOpsGPT (Pending Gate)',
          tool: (data.toolCalls?.[0]?.tool as any) || 'kubectl',
          command: data.approvalDetails.commandToExecute,
          riskLevel: data.approvalDetails.riskLevel || 'HIGH',
          status: 'AUTO_BLOCKED',
          notes: `Paused execution: ${data.approvalDetails.actionTitle}`,
        };
        setAuditLogs((prev) => [auditEntry, ...prev]);
      } else if (data.toolCalls && data.toolCalls.length > 0) {
        // Read-only executed tools audit
        data.toolCalls.forEach((tc: any, idx: number) => {
          const auditEntry: AuditLogEntry = {
            id: `aud-${Date.now()}-${idx}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            operator: 'DevOpsGPT (Autonomous)',
            tool: (tc.tool as any) || 'kubectl',
            command: tc.command,
            riskLevel: 'LOW',
            status: 'EXECUTED',
            notes: tc.purpose,
          };
          setAuditLogs((prev) => [auditEntry, ...prev]);
        });
      }

      const newAssistantMsg: ChatMessage = {
        id: asstMsgId,
        role: 'assistant',
        text: data.diagnosisOrSummary || 'Task completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
        breakdown: {
          thought: data.thought,
          plan: data.plan || [],
          retrievedRunbook: data.retrievedRunbook,
          toolCalls: data.toolCalls || [],
          needsHumanApproval: !!data.needsHumanApproval,
          approvalDetails: data.approvalDetails,
          diagnosisOrSummary: data.diagnosisOrSummary,
          recommendedFix: data.recommendedFix,
          confidenceScore: data.confidenceScore || 95,
        },
        approval: approvalObj,
      };

      setMessages((prev) => [...prev, newAssistantMsg]);
    } catch (err: any) {
      console.error('Agent chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `Error connecting to Agent reasoning server: ${err?.message}. Switched to local fallback.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleApprove = (approvalId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.approval && (msg.approval.id === approvalId || `appr-${msg.id}` === approvalId)) {
          return {
            ...msg,
            approval: { ...msg.approval, status: 'approved', resolvedAt: new Date().toISOString() },
          };
        }
        return msg;
      })
    );

    // Update audit log
    const targetApproval = activeApproval;
    if (targetApproval) {
      const auditEntry: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        operator: 'Senior SRE (Harish)',
        tool: 'kubectl',
        command: targetApproval.commandToExecute,
        riskLevel: targetApproval.riskLevel,
        status: 'APPROVED',
        notes: `Authorized via Human Gate: ${targetApproval.actionTitle}`,
      };
      setAuditLogs((prev) => [auditEntry, ...prev]);
    }

    setActiveApproval(null);
  };

  const handleReject = (approvalId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.approval && (msg.approval.id === approvalId || `appr-${msg.id}` === approvalId)) {
          return {
            ...msg,
            approval: { ...msg.approval, status: 'rejected', resolvedAt: new Date().toISOString() },
          };
        }
        return msg;
      })
    );

    // Update audit log
    const targetApproval = activeApproval;
    if (targetApproval) {
      const auditEntry: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        operator: 'DevOps Engineer (Harish)',
        tool: 'kubectl',
        command: targetApproval.commandToExecute,
        riskLevel: targetApproval.riskLevel,
        status: 'DENIED',
        notes: `Rejected by human engineer: ${targetApproval.actionTitle}`,
      };
      setAuditLogs((prev) => [auditEntry, ...prev]);
    }

    setActiveApproval(null);
  };

  const handleTriageIncident = (scenario: IncidentScenario) => {
    setActiveTab('chat');
    handleSendMessage(scenario.suggestedPrompt);
  };

  const handleAddRunbook = (newRunbook: Runbook) => {
    setRunbooks((prev) => [newRunbook, ...prev]);
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasGeminiKey={hasGeminiKey}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Tab Content */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'chat' && (
          <AgentChat
            messages={messages}
            isThinking={isThinking}
            onSendMessage={handleSendMessage}
            onRequestApprovalModal={(appr) => setActiveApproval(appr)}
            onClearHistory={handleClearHistory}
            activeEnvironment={activeEnvironment}
            setActiveEnvironment={setActiveEnvironment}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentCommander onTriageIncident={handleTriageIncident} />
        )}

        {activeTab === 'iac' && <IaCGenerator />}

        {activeTab === 'runbooks' && (
          <RunbooksView runbooks={runbooks} onAddRunbook={handleAddRunbook} />
        )}

        {activeTab === 'audit' && <AuditLogView logs={auditLogs} />}

        {activeTab === 'vscode' && <VSCodeGuide />}

        {activeTab === 'deploy' && <GitHubDeployGuide />}

        {activeTab === 'concepts' && <ConceptExplainer />}
      </main>

      {/* Human Approval Gate Modal */}
      <ApprovalModal
        request={activeApproval}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={() => setActiveApproval(null)}
      />
    </div>
  );
}
