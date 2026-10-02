export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ToolType = 'kubectl' | 'docker' | 'git' | 'terraform' | 'prometheus' | 'alertmanager';

export interface ToolCall {
  id: string;
  tool: ToolType;
  command: string;
  purpose: string;
  simulatedOutput?: string;
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'denied';
}

export interface Runbook {
  id: string;
  title: string;
  trigger: string;
  steps: string[];
  riskLevel: RiskLevel;
  keywords: string[];
  category: 'Kubernetes' | 'Docker' | 'Monitoring' | 'CI/CD' | 'IaC';
  author: string;
  lastUpdated: string;
}

export interface ApprovalRequest {
  id: string;
  actionTitle: string;
  commandToExecute: string;
  riskLevel: RiskLevel;
  riskJustification: string;
  status: 'pending' | 'approved' | 'rejected';
  resolvedAt?: string;
}

export interface AgentStepBreakdown {
  thought: string;
  plan: string[];
  retrievedRunbook?: {
    title: string;
    trigger: string;
    relevantSteps: string[];
  };
  toolCalls: Array<{
    tool: string;
    command: string;
    purpose: string;
    simulatedOutput?: string;
  }>;
  needsHumanApproval: boolean;
  approvalDetails?: {
    actionTitle: string;
    commandToExecute: string;
    riskLevel: RiskLevel;
    riskJustification: string;
  };
  diagnosisOrSummary: string;
  recommendedFix: string;
  confidenceScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  source?: 'gemini-3.8-flash' | 'simulated-agent-engine';
  breakdown?: AgentStepBreakdown;
  approval?: ApprovalRequest;
}

export interface IncidentScenario {
  id: string;
  title: string;
  service: string;
  severity: 'P1 - Critical' | 'P2 - Major' | 'P3 - Moderate';
  environment: string;
  description: string;
  symptoms: string[];
  logsSnippet: string;
  metrics: {
    cpu: string;
    memory: string;
    errorRate: string;
    p95Latency: string;
  };
  suggestedPrompt: string;
  associatedRunbookId: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  operator: string;
  tool: ToolType | 'agent_core';
  command: string;
  riskLevel: RiskLevel;
  status: 'EXECUTED' | 'APPROVED' | 'DENIED' | 'AUTO_BLOCKED';
  notes: string;
}

export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}
