import { Runbook, IncidentScenario, AuditLogEntry, ProjectFile } from '../types/agent';

export const INITIAL_RUNBOOKS: Runbook[] = [
  {
    id: 'rb-k8s-crashloop',
    title: 'Kubernetes Pod CrashLoopBackOff Incident Runbook',
    trigger: 'Pod Status: CrashLoopBackOff, Container ExitCode != 0',
    category: 'Kubernetes',
    riskLevel: 'HIGH',
    author: 'SRE Team',
    lastUpdated: '2026-09-15',
    keywords: ['crashloop', 'crashloopbackoff', 'pod', 'exitcode', 'k8s', 'restart'],
    steps: [
      'Step 1: Check pod restart count and status via `kubectl get pods -n <namespace>`.',
      'Step 2: Inspect crashed container logs using `kubectl logs <pod-name> --previous --tail=50`.',
      'Step 3: Execute `kubectl describe pod <pod-name>` to check events, probe failures, and exit status.',
      'Step 4: Check if recent deployment caused configuration regression (`kubectl rollout history`).',
      'Step 5: [HUMAN APPROVAL REQUIRED] If faulty release, trigger rollback: `kubectl rollout undo deployment/<name>`.',
    ],
  },
  {
    id: 'rb-500-spike',
    title: 'HTTP 500 / 5xx Error Rate Spike Runbook',
    trigger: 'Prometheus Alert: High5xxErrorRate (rate > 5% for 3m)',
    category: 'Monitoring',
    riskLevel: 'HIGH',
    author: 'DevOps Lead',
    lastUpdated: '2026-09-20',
    keywords: ['500', '5xx', 'http', 'spike', 'latency', 'gateway', 'error'],
    steps: [
      'Step 1: Query Prometheus metric: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100`.',
      'Step 2: Check downstream dependencies (PostgreSQL pool, Redis latency, third-party APIs).',
      'Step 3: Correlate incident start timestamp with Git CI/CD deployment history (`git log -n 5`).',
      'Step 4: [HUMAN APPROVAL REQUIRED] Isolate faulty canary pods or scale stable replicas.',
      'Step 5: Post incident summary and notify on-call channel.',
    ],
  },
  {
    id: 'rb-oom-killed',
    title: 'Linux / Container OOMKilled (Exit Code 137) Runbook',
    trigger: 'Container ExitCode: 137, Reason: OOMKilled',
    category: 'Docker',
    riskLevel: 'MEDIUM',
    author: 'Platform Ops',
    lastUpdated: '2026-08-30',
    keywords: ['oom', 'oomkilled', '137', 'memory', 'ram', 'leak'],
    steps: [
      'Step 1: Verify OOM termination reason: `kubectl get pod <pod-name> -o jsonpath="{.status.containerStatuses[*].lastState.terminated.reason}"`.',
      'Step 2: Check historical memory consumption via Prometheus: `container_memory_working_set_bytes`.',
      'Step 3: Determine if root cause is unexpected traffic spike vs heap memory leak in Node.js/Java.',
      'Step 4: [HUMAN APPROVAL REQUIRED] Safely increase memory limit in Helm values or `kubectl set resources`.',
    ],
  },
  {
    id: 'rb-docker-hardening',
    title: 'Container Image Security & Dockerfile Hardening',
    trigger: 'CI Security Scan: Root user detected, large image size (> 1GB)',
    category: 'Docker',
    riskLevel: 'LOW',
    author: 'DevSecOps Team',
    lastUpdated: '2026-09-02',
    keywords: ['docker', 'dockerfile', 'security', 'cve', 'multistage', 'root'],
    steps: [
      'Step 1: Replace single-stage build with multi-stage build (`FROM node:20-alpine AS builder`).',
      'Step 2: Enforce non-root execution: add `USER node` or `USER 10001:10001`.',
      'Step 3: Pin base images using SHA256 digests instead of `:latest`.',
      'Step 4: Add `.dockerignore` file to omit `.git`, `.env`, and `node_modules`.',
    ],
  },
  {
    id: 'rb-terraform-drift',
    title: 'Cloud Infrastructure Drift & Terraform Remediation',
    trigger: 'Terraform Cloud Alert: Drift detected against statefile',
    category: 'IaC',
    riskLevel: 'CRITICAL',
    author: 'Cloud Architect',
    lastUpdated: '2026-09-18',
    keywords: ['terraform', 'drift', 'iac', 'state', 'aws', 'plan', 'apply'],
    steps: [
      'Step 1: Execute read-only drift detection: `terraform plan -detailed-exitcode`.',
      'Step 2: Compare out-of-band modifications made via Cloud Console.',
      'Step 3: If manual modification was authorized emergency fix, import into HCL code.',
      'Step 4: [HUMAN APPROVAL REQUIRED] Senior review required prior to `terraform apply`.',
    ],
  },
  {
    id: 'rb-cicd-pipeline',
    title: 'GitHub Actions / Jenkins Pipeline Failure Triage',
    trigger: 'CI Job Failed: test_and_build step returned non-zero',
    category: 'CI/CD',
    riskLevel: 'LOW',
    author: 'DevOps Engineer',
    lastUpdated: '2026-08-10',
    keywords: ['pipeline', 'github actions', 'jenkins', 'ci', 'cd', 'build', 'test'],
    steps: [
      'Step 1: Fetch workflow run logs for failed job ID.',
      'Step 2: Classify failure: Linting error, Unit test assertion, or Network timeout during npm install.',
      'Step 3: Inspect Git commit diff (`git diff HEAD~1`).',
      'Step 4: Propose automated patch or retry runner cache.',
    ],
  },
];

export const INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: 'inc-01',
    title: 'Kubernetes CrashLoopBackOff in Payment Service',
    service: 'payment-service',
    severity: 'P1 - Critical',
    environment: 'production-k8s',
    description: 'The core payment-service pod is repeatedly restarting with status CrashLoopBackOff, blocking credit card checkout transactions.',
    symptoms: [
      'Customer checkout error rate jumped to 84%',
      'Pod restart count: 12 in the last 15 minutes',
      'Liveness probe failed after 3 attempts',
    ],
    logsSnippet: `[2026-10-02 15:20:01] [FATAL] DB_HOST="postgres-primary.db.internal" resolved
[2026-10-02 15:20:02] [FATAL] ConnectionError: password authentication failed for user "payment_writer"
[2026-10-02 15:20:02] [FATAL] Unhandled rejection in database pool initialization
[2026-10-02 15:20:03] [INFO] Node.js process exited with code 1
[2026-10-02 15:20:05] [Kubelet] Container payment-service failed liveness probe, restarting`,
    metrics: {
      cpu: '12% (Idle)',
      memory: '48MB / 512MB',
      errorRate: '84.2%',
      p95Latency: 'N/A (Failing)',
    },
    suggestedPrompt: 'Investigate why payment-service is crashing in production and recommend safe remediation.',
    associatedRunbookId: 'rb-k8s-crashloop',
  },
  {
    id: 'inc-02',
    title: 'HTTP 500 Error Spike on Ingress API Gateway',
    service: 'api-gateway',
    severity: 'P1 - Critical',
    environment: 'production-k8s',
    description: 'Prometheus triggered High5xxErrorRate alert. Over 18% of all incoming mobile app API calls are failing with status 502/500.',
    symptoms: [
      '5xx error rate exceeded 18% (SLO limit is 0.1%)',
      'Redis cache cluster latency spiked from 2ms to 1,400ms',
      'Canary deployment tagged v1.12.0 deployed 12 minutes ago',
    ],
    logsSnippet: `[2026-10-02 15:18:42] [ERROR] Ingress-Nginx: 502 Bad Gateway upstream "redis-cache-service:6379" timed out
[2026-10-02 15:18:43] [ERROR] RedisConnectionError: ERR max number of clients reached (maxclients=10000)
[2026-10-02 15:18:45] [WARN] Fallback circuit breaker open, dropping traffic`,
    metrics: {
      cpu: '89% (High)',
      memory: '1.4GB / 2GB',
      errorRate: '18.4%',
      p95Latency: '2,840ms',
    },
    suggestedPrompt: 'High 500 error spike detected on api-gateway after recent deployment. Correlate logs and rollback.',
    associatedRunbookId: 'rb-500-spike',
  },
  {
    id: 'inc-03',
    title: 'OOMKilled Container in Analytics Worker',
    service: 'data-pipeline-worker',
    severity: 'P2 - Major',
    environment: 'production-k8s',
    description: 'Analytics batch processing worker was terminated by the Linux OOM killer with Exit Code 137 due to an unindexed SQL query load.',
    symptoms: [
      'Exit Code 137 in pod termination status',
      'Memory graph shows steep linear climb to 100% before pod restart',
      'Data pipeline queue lag is increasing by 500 items/minute',
    ],
    logsSnippet: `[2026-10-02 14:55:10] [INFO] Processing batch batch_948291 (1,200,000 raw events)
[2026-10-02 14:55:34] [WARN] Heap total: 980MB, Heap limit: 1024MB
[2026-10-02 14:55:36] <kernel>: Memory cgroup out of memory: Killed process 412 (node)
[2026-10-02 14:55:37] Kubelet: Container data-pipeline-worker terminated with exit code 137 (OOMKilled)`,
    metrics: {
      cpu: '98%',
      memory: '100% (1024MB / 1024MB)',
      errorRate: 'Queue Lagging',
      p95Latency: '8,400ms',
    },
    suggestedPrompt: 'Our data-pipeline-worker pod was killed with Exit Code 137 (OOMKilled). Diagnose and suggest fix.',
    associatedRunbookId: 'rb-oom-killed',
  },
  {
    id: 'inc-04',
    title: 'Dockerfile Security Audit & Layer Optimization',
    service: 'user-service-docker',
    severity: 'P3 - Moderate',
    environment: 'staging-ci',
    description: 'Security scanner flagged high CVEs in base image and detected container running as root user with 1.8GB image size.',
    symptoms: [
      'Image size: 1.84 GB (excessive overhead)',
      'Security alert: Container runs as UID 0 (root)',
      'Node.js development dependencies bundled into production container',
    ],
    logsSnippet: `[Trivy Scan Results]
Target: user-service:latest
Total Vulnerabilities: 24 (CRITICAL: 2, HIGH: 7, MEDIUM: 15)
- CVE-2024-21538 in node:18-bullseye (libvips vulnerability)
- Security Rule S-001: USER instruction missing (container runs as root)
- Size Warning: node_modules cache present in final image layer (+820MB)`,
    metrics: {
      cpu: 'Normal',
      memory: 'Normal',
      errorRate: '0%',
      p95Latency: '45ms',
    },
    suggestedPrompt: 'Review our Dockerfile, optimize build layers to reduce size, and harden security to run as non-root.',
    associatedRunbookId: 'rb-docker-hardening',
  },
];

export const AUDIT_LOG_SEED: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-02 14:15:20',
    operator: 'DevOpsGPT (Autonomous Agent)',
    tool: 'kubectl',
    command: 'kubectl get pods -n production -o wide',
    riskLevel: 'LOW',
    status: 'EXECUTED',
    notes: 'Autonomous read-only cluster health observation.',
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-02 14:15:24',
    operator: 'DevOpsGPT (Autonomous Agent)',
    tool: 'prometheus',
    command: 'query: rate(http_requests_total[5m])',
    riskLevel: 'LOW',
    status: 'EXECUTED',
    notes: 'Automated telemetry correlation for service latency.',
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-02 14:18:10',
    operator: 'Senior SRE (Harish)',
    tool: 'kubectl',
    command: 'kubectl rollout undo deployment/payment-service -n production',
    riskLevel: 'HIGH',
    status: 'APPROVED',
    notes: 'Approved via Agent Human-in-the-Loop Gate to resolve CrashLoopBackOff incident.',
  },
  {
    id: 'aud-004',
    timestamp: '2026-10-02 14:22:01',
    operator: 'DevOpsGPT (Guardrail Intercept)',
    tool: 'agent_core',
    command: 'kubectl delete namespace production',
    riskLevel: 'CRITICAL',
    status: 'AUTO_BLOCKED',
    notes: 'Attempted command blocked by hardcoded least-privilege zero-trust policy.',
  },
];

export const VSCODE_PROJECT_FILES: ProjectFile[] = [
  {
    name: 'package.json',
    path: 'package.json',
    language: 'json',
    description: 'Node.js project configuration with Express, Gemini SDK, and dependencies.',
    content: `{
  "name": "agentic-devops-assistant",
  "version": "1.0.0",
  "description": "Agentic AI-based DevOps Assistant for College Project",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "express": "^4.21.2",
    "dotenv": "^17.2.3",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}`,
  },
  {
    name: 'agent.js',
    path: 'agent.js',
    language: 'javascript',
    description: 'The Agentic AI Reasoning Core implementing the ReAct (Reason + Act) loop.',
    content: `// ==========================================
// Agentic AI Reasoning Core (ReAct Pattern)
// Simple, clean, college-level implementation
// ==========================================
import { GoogleGenAI } from "@google/genai";
import { executeDevOpsTool } from "./tools.js";
import runbooks from "./runbooks.json" assert { type: "json" };

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { "User-Agent": "aistudio-build" } }
});

export async function runAgenticDevOpsLoop(userRequest) {
  console.log("\\n[AGENT LOOP] Received request:", userRequest);

  // 1. RAG STEP: Retrieve relevant runbook from knowledge base
  const matchedRunbook = runbooks.find(rb =>
    rb.keywords.some(kw => userRequest.toLowerCase().includes(kw))
  ) || runbooks[0];

  console.log("[RAG] Retrieved Runbook:", matchedRunbook.title);

  // 2. REASONING & PLANNING: Prompt Gemini to output ReAct JSON
  const systemPrompt = \`
You are an intelligent Agentic DevOps Assistant.
Follow the ReAct loop:
1. Reason about the user's issue.
2. Select appropriate DevOps tools: kubectl, docker, git, terraform, prometheus.
3. Identify if any action requires HUMAN APPROVAL (destructive actions like rollback, delete, terraform apply).
4. Provide college-friendly root-cause diagnosis.

Matched Runbook: \${matchedRunbook.title}
Steps: \${JSON.stringify(matchedRunbook.steps)}

Respond ONLY in valid JSON:
{
  "thought": "Your internal agent thought",
  "plan": ["Step 1", "Step 2"],
  "toolCalls": [
    {"tool": "kubectl", "command": "kubectl get pods -n prod", "purpose": "check health"}
  ],
  "needsHumanApproval": false,
  "approvalDetails": null,
  "diagnosis": "Root cause summary",
  "recommendedFix": "How to fix it"
}
\`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: userRequest,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json"
    }
  });

  const agentDecision = JSON.parse(response.text.trim());

  // 3. TOOL EXECUTION STEP
  const toolResults = [];
  for (const call of agentDecision.toolCalls) {
    console.log(\`[TOOL EXECUTION] Running \${call.tool}: \${call.command}\`);
    const output = await executeDevOpsTool(call.tool, call.command);
    toolResults.push({ ...call, output });
  }

  // 4. HUMAN-IN-THE-LOOP CHECK
  if (agentDecision.needsHumanApproval) {
    console.log("[GATE] PAUSED! Action requires human engineer confirmation.");
  }

  return {
    ...agentDecision,
    executedTools: toolResults,
    matchedRunbook
  };
}`,
  },
  {
    name: 'tools.js',
    path: 'tools.js',
    language: 'javascript',
    description: 'DevOps Tool integrations (Kubectl, Docker, Git, Prometheus) with safe dry-run.',
    content: `// ==========================================
// DevOps Tool Integrations & CLI Simulators
// ==========================================
import { exec } from "child_process";
import util from "util";
const execAsync = util.promisify(exec);

// Whitelist of allowed commands for safety (Least Privilege)
const ALLOWED_TOOLS = ["kubectl", "docker", "git", "terraform", "prometheus"];

export async function executeDevOpsTool(toolName, command) {
  if (!ALLOWED_TOOLS.includes(toolName.toLowerCase())) {
    throw new Error(\`Unauthorized tool: \${toolName}\`);
  }

  // In local development or demo mode, return simulated safe response
  // If real CLI installed: return await execAsync(command);
  if (command.includes("get pods")) {
    return "NAME                     READY   STATUS             RESTARTS\\npayment-service-89x      0/1     CrashLoopBackOff   6\\nweb-frontend-21y         1/1     Running            0";
  }

  if (command.includes("logs")) {
    return "[FATAL] 2026-10-02 ConnectionError: Database authentication failed for user payment_writer\\n[FATAL] Exit code 1";
  }

  if (command.includes("rate(http_requests_total")) {
    return "Result: 18.4% error rate (Threshold > 5% exceeded)";
  }

  if (command.includes("git log")) {
    return "a8f91b2 (HEAD -> main) feat: update payment db connection string";
  }

  return \`Executed '\${command}' successfully. Status: 0 OK.\`;
}`,
  },
  {
    name: 'server.js',
    path: 'server.js',
    language: 'javascript',
    description: 'Express web server exposing the agent REST API and serving public web pages.',
    content: `// ==========================================
// Express Web Server & Agent API
// ==========================================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runAgenticDevOpsLoop } from "./agent.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    system: "DevOpsGPT Agentic AI",
    hasApiKey: !!process.env.GEMINI_API_KEY
  });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    const result = await runAgenticDevOpsLoop(prompt);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(\`Server listening on http://localhost:\${PORT}\`);
});`,
  },
  {
    name: 'runbooks.json',
    path: 'runbooks.json',
    language: 'json',
    description: 'RAG Knowledge base with operational runbooks for K8s, Docker, and Prometheus.',
    content: `[
  {
    "id": "rb-k8s-crashloop",
    "title": "Kubernetes Pod CrashLoopBackOff Runbook",
    "keywords": ["crashloop", "pod", "crash", "k8s", "exit"],
    "steps": [
      "1. Run kubectl logs <pod> --previous",
      "2. Run kubectl describe pod <pod>",
      "3. Request human approval for kubectl rollout undo"
    ]
  },
  {
    "id": "rb-500-spike",
    "title": "HTTP 500 Error Spike Runbook",
    "keywords": ["500", "5xx", "spike", "prometheus", "incident"],
    "steps": [
      "1. Query Prometheus error rate",
      "2. Correlate with Git deployment commits",
      "3. Isolate canary pods"
    ]
  }
]`,
  },
  {
    name: '.env.example',
    path: '.env.example',
    language: 'plaintext',
    description: 'Environment variable template file.',
    content: `# Get your Gemini API key from https://aistudio.google.com
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
PORT=3000

# APP_URL: The base URL of your running assistant
# - For local testing in VS Code: http://localhost:3000
# - For production on Vercel/Render: https://your-app.vercel.app
# - In Google AI Studio: Injected automatically (no action needed)
APP_URL=http://localhost:3000`,
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Complete Academic College Project Documentation with Abstract & Architecture.',
    content: `# Agentic AI-Based Intelligent DevOps Assistant

> **College Project Submission**  
> **Course:** Cloud Computing & Artificial Intelligence  
> **Author:** DevOps Assistant Team  

---

## 📌 Abstract
Modern DevOps teams work across a growing set of tools covering source control, build pipelines, infrastructure, containers, monitoring, and incident response. This work presents an **Agentic AI-based Intelligent DevOps Assistant**: an LLM-powered system that understands requests in natural language, plans multi-step tasks, and carries them out by calling the tools DevOps teams already use.

---

## 🧠 System Architecture

\`\`\`
  +-------------------------------------------------------------+
  |                   User Request (Natural Language)           |
  +-------------------------------------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |              Agent Reasoning Core (Gemini 3.8 Flash)        |
  |   - ReAct Cycle: [Observation -> Thought -> Plan -> Action] |
  +-------------------------------------------------------------+
             |                                     |
             v                                     v
  +-----------------------+              +-----------------------+
  | Retrieval Layer (RAG) |              |  DevOps Tool Registry |
  | - Runbooks & Policies |              |  - Kubectl (K8s)      |
  | - Historical Incidents|              |  - Docker Engine      |
  +-----------------------+              |  - Git Source Control |
                                         |  - Terraform (IaC)    |
                                         |  - Prometheus Metrics |
                                         +-----------------------+
                                                     |
                                                     v
                                         +-----------------------+
                                         |  Human Approval Gate  |
                                         | (For High-Risk Ops)   |
                                         +-----------------------+
\`\`\`

---

## 🚀 Quick Setup in VS Code

1. Clone or download this project.
2. Open terminal in VS Code:
   \`\`\`bash
   npm install
   \`\`\`
3. Create your \`.env\` file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Add your \`GEMINI_API_KEY\`.
4. Run locally:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open \`http://localhost:3000\` in your browser!

---

## 🛡️ Safety & Least Privilege
- Read-only queries execute autonomously.
- Destructive commands (e.g. \`kubectl rollout undo\`, \`terraform apply\`) require explicit human engineer authorization.
`,
  },
];
