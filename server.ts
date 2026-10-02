import express from 'express';
import path from 'path';
import net from 'net';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.unref();

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
        return;
      }

      reject(err);
    });

    server.listen(startPort, '0.0.0.0', () => {
      const address = server.address();
      const resolvedPort = typeof address === 'object' && address ? address.port : startPort;
      server.close(() => resolve(resolvedPort));
    });
  });
}

app.use(express.json());

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// DevOps Runbooks Knowledge Base for RAG simulation
const RUNBOOKS = [
  {
    id: 'rb-k8s-crashloop',
    title: 'Kubernetes Pod CrashLoopBackOff Runbook',
    trigger: 'CrashLoopBackOff, container exit code 1 or 137',
    steps: [
      '1. Run `kubectl logs <pod-name> --previous` to see why the container failed.',
      '2. Run `kubectl describe pod <pod-name>` to check exit codes, liveness/readiness probe failures, or OOM status.',
      '3. Verify environment variables and database connection strings.',
      '4. If caused by faulty deployment, request human approval before running `kubectl rollout undo deployment/<name>`.',
    ],
    riskLevel: 'HIGH',
    keywords: ['crashloop', 'crashloopbackoff', 'pod', 'exit code', 'crash'],
  },
  {
    id: 'rb-oom-killed',
    title: 'Container OOMKilled (Exit Code 137) Runbook',
    trigger: 'OOMKilled, Pod termination with code 137, Memory usage spike',
    steps: [
      '1. Check Prometheus metric: `container_memory_working_set_bytes`.',
      '2. Inspect memory limits in deployment spec: `kubectl get deploy <name> -o yaml`.',
      '3. Profile heap dumps or investigate memory leaks in application code.',
      '4. If legitimate traffic surge, patch resource limit with approval: `kubectl set resources deployment <name> --limits=memory=1Gi`.',
    ],
    riskLevel: 'MEDIUM',
    keywords: ['oom', 'oomkilled', 'memory', '137', 'ram'],
  },
  {
    id: 'rb-500-spike',
    title: 'HTTP 500 Error Rate Spike & Incident Triage',
    trigger: 'Prometheus alert: high_5xx_rate > 5%',
    steps: [
      '1. Query Prometheus: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100`.',
      '2. Correlate with recent Git commits or CI/CD deployments in the last 30 minutes.',
      '3. Check microservice upstream dependencies (Database, Redis, Auth provider).',
      '4. If new release introduced bug, trigger automated canary rollback with human authorization.',
    ],
    riskLevel: 'HIGH',
    keywords: ['500', '5xx', 'http', 'error rate', 'incident', 'spike'],
  },
  {
    id: 'rb-docker-build',
    title: 'Docker Image Optimization & Security Hardening',
    trigger: 'Large image size, root container vulnerability, slow CI cache',
    steps: [
      '1. Use multi-stage builds (`AS builder` -> minimal alpine/distroless runner).',
      '2. Pin base image digests instead of using `:latest`.',
      '3. Run non-root user (`USER nonroot` or `USER 1001`).',
      '4. Leverage `.dockerignore` to exclude node_modules, git, and sensitive secrets.',
    ],
    riskLevel: 'LOW',
    keywords: ['docker', 'dockerfile', 'container', 'vulnerability', 'optimize', 'image'],
  },
  {
    id: 'rb-terraform-drift',
    title: 'Terraform State Drift & IaC Review Runbook',
    trigger: 'Resource drift detected between cloud provider and state file',
    steps: [
      '1. Run `terraform plan -detailed-exitcode` in read-only mode.',
      '2. Compare attributes modified out-of-band via AWS/GCP Console.',
      '3. Reconcile code changes or state refresh (`terraform refresh`).',
      '4. Require Senior DevOps approval before applying destructive changes (`terraform apply`).',
    ],
    riskLevel: 'CRITICAL',
    keywords: ['terraform', 'drift', 'state', 'plan', 'iac', 'aws'],
  },
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Runbooks search API (RAG simulation)
app.get('/api/runbooks', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase();
  if (!query) {
    return res.json(RUNBOOKS);
  }
  const matched = RUNBOOKS.filter((rb) =>
    rb.title.toLowerCase().includes(query) ||
    rb.keywords.some((k) => query.includes(k) || k.includes(query)) ||
    rb.trigger.toLowerCase().includes(query)
  );
  res.json(matched.length > 0 ? matched : [RUNBOOKS[0]]);
});

// Agent Chat & Execution API
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { prompt, conversationHistory = [], activeEnvironment = 'production-k8s' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // 1. RAG Step: Search Runbooks
    const promptLower = prompt.toLowerCase();
    const retrievedRunbooks = RUNBOOKS.filter((rb) =>
      rb.keywords.some((kw) => promptLower.includes(kw)) ||
      promptLower.includes(rb.id.split('-')[1])
    );
    const primaryRunbook = retrievedRunbooks[0] || RUNBOOKS[0];

    // If Gemini client is active, execute real Agentic reasoning with structured schema
    if (aiClient) {
      try {
        const systemInstruction = `You are "DevOpsGPT", an Agentic AI DevOps Assistant designed for college-level understanding and real production safety.
Your mission is to understand natural language DevOps requests, formulate a multi-step plan, select DevOps tools (kubectl, docker, git, terraform, prometheus), reference the runbook knowledge base, and enforce HUMAN APPROVAL GATES for high-impact or destructive actions.

Context:
- Environment: ${activeEnvironment}
- Relevant Runbook: ${primaryRunbook.title} (Trigger: ${primaryRunbook.trigger})
- Risk Guidelines:
  - Read-only actions (get pods, describe, logs, docker ps, git status, terraform plan) -> Risk: LOW, needsHumanApproval: false
  - Restart / scale actions (kubectl rollout restart, docker restart, scale replicas) -> Risk: MEDIUM, needsHumanApproval: true
  - Destructive / Rollback actions (kubectl rollout undo, terraform apply, pod delete, drop DB) -> Risk: HIGH or CRITICAL, needsHumanApproval: true

You MUST return pure JSON matching this exact structure:
{
  "thought": "Your internal agentic reasoning breakdown (Observation -> Thought -> Action Plan)",
  "plan": ["Step 1 description", "Step 2 description", "Step 3 description"],
  "retrievedRunbook": {
    "title": "Title of matched runbook",
    "trigger": "Trigger condition",
    "relevantSteps": ["Step a", "Step b"]
  },
  "toolCalls": [
    {
      "tool": "kubectl | docker | git | terraform | prometheus",
      "command": "Exact command or query string",
      "purpose": "Why this tool is being invoked",
      "simulatedOutput": "Realistic console output from running this command"
    }
  ],
  "needsHumanApproval": true or false,
  "approvalDetails": {
    "actionTitle": "Short title if approval is needed (e.g. Rollback Payment Service)",
    "commandToExecute": "Command pending approval",
    "riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",
    "riskJustification": "Clear explanation why human confirmation is required"
  },
  "diagnosisOrSummary": "Clear, friendly college-level summary of the root cause or result",
  "recommendedFix": "Actionable instructions or code snippet",
  "confidenceScore": 95
}`;

        const geminiResponse = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `User DevOps Request: "${prompt}"\nRecent Context: ${JSON.stringify(conversationHistory.slice(-2))}`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        const rawText = geminiResponse.text?.trim() || '{}';
        const parsed = JSON.parse(rawText);

        return res.json({
          source: 'gemini-3.8-flash',
          ...parsed,
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to simulated reasoning engine:', geminiError?.message);
        // Fallback gracefully below
      }
    }

    // High quality intelligent simulated agent reasoning fallback (guarantees 100% offline/demo reliability)
    const simulatedResponse = generateSimulatedAgentResponse(prompt, primaryRunbook);
    return res.json({
      source: 'simulated-agent-engine',
      ...simulatedResponse,
    });
  } catch (err: any) {
    console.error('Error in /api/agent/chat:', err);
    res.status(500).json({ error: 'Internal agent error', message: err?.message });
  }
});

// Helper for simulated reasoning engine (deterministic, rich, college-friendly)
function generateSimulatedAgentResponse(prompt: string, runbook: any) {
  const p = prompt.toLowerCase();

  if (p.includes('crashloop') || p.includes('crash') || p.includes('pod') || p.includes('k8s')) {
    return {
      thought:
        "The user reported a Kubernetes pod issue. As an Agent, I follow the ReAct pattern: 1) Observe the cluster state via `kubectl get pods`, 2) Read container logs with `kubectl logs`, 3) Correlate with CrashLoopBackOff runbook, 4) Formulate a safe remediation plan.",
      plan: [
        'Inspect namespace pods to identify crashing containers',
        'Extract previous crash logs and check exit code',
        'Verify database connectivity and environment secrets',
        'Request human approval before executing deployment rollback',
      ],
      retrievedRunbook: {
        title: runbook.title,
        trigger: runbook.trigger,
        relevantSteps: runbook.steps,
      },
      toolCalls: [
        {
          tool: 'kubectl',
          command: 'kubectl get pods -n production -l app=payment-service',
          purpose: 'Identify status and restart count of the target microservice',
          simulatedOutput:
            'NAME                               READY   STATUS             RESTARTS   AGE\npayment-service-78f99c898c-m4px2   0/1     CrashLoopBackOff   8          14m\npayment-service-78f99c898c-z9v1k   1/1     Running            0          14m',
        },
        {
          tool: 'kubectl',
          command: 'kubectl logs payment-service-78f99c898c-m4px2 -n production --previous --tail=20',
          purpose: 'Inspect stack trace before container termination',
          simulatedOutput:
            '[FATAL] 2026-10-02 15:24:10 ConnectionError: Failed to connect to postgresql-master:5432\n[FATAL] password authentication failed for user "payment_app"\n[INFO] Process terminated with exit code 1',
        },
      ],
      needsHumanApproval: true,
      approvalDetails: {
        actionTitle: 'Rollback Payment Service Deployment to v2.4.1',
        commandToExecute: 'kubectl rollout undo deployment/payment-service -n production',
        riskLevel: 'HIGH',
        riskJustification:
          'Rollback will temporarily cycle pods and revert configuration. Human engineer authorization is required under zero-trust DevOps governance.',
      },
      diagnosisOrSummary:
        'Root Cause Diagnosed: Pod `payment-service-m4px2` is in CrashLoopBackOff due to a PostgreSQL credential mismatch introduced in release v2.4.2.',
      recommendedFix:
        '1. Approve the rollback to v2.4.1 to restore payment uptime immediately.\n2. Fix the secret key `DB_PASSWORD` in `kubernetes/secrets.yaml`.\n3. Re-deploy via CI/CD pipeline once credentials match.',
      confidenceScore: 98,
    };
  }

  if (p.includes('500') || p.includes('spike') || p.includes('prometheus') || p.includes('metric')) {
    return {
      thought:
        "User detected an HTTP 500 error spike. ReAct step: 1) Query Prometheus timeseries for HTTP status rates, 2) Check ingress gateway logs, 3) Match with incident triage runbook, 4) Determine if traffic routing or canary rollback is required.",
      plan: [
        'Query Prometheus rate of 5xx responses over the last 15 minutes',
        'Check service latency 95th percentile metrics',
        'Correlate timeline with recent Git release tags',
        'Prepare canary traffic drain with human confirmation',
      ],
      retrievedRunbook: {
        title: 'HTTP 500 Error Rate Spike & Incident Triage',
        trigger: 'Prometheus alert: high_5xx_rate > 5%',
        relevantSteps: [
          'Query Prometheus rate metrics',
          'Check upstream microservice dependencies',
          'Execute canary rollback if bug confirmed',
        ],
      },
      toolCalls: [
        {
          tool: 'prometheus',
          command: 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100',
          purpose: 'Calculate percentage of failing requests in real-time',
          simulatedOutput: 'Result: 14.82% (Critical threshold > 5% exceeded)',
        },
        {
          tool: 'git',
          command: 'git log -n 3 --oneline',
          purpose: 'Check latest commits deployed to production',
          simulatedOutput:
            'a8f91b2 (HEAD -> main, tag: v1.12.0) feat: enable redis caching layer\n42c8d10 fix: update auth middleware headers\n99e0f31 chore: bump dependencies',
        },
      ],
      needsHumanApproval: true,
      approvalDetails: {
        actionTitle: 'Reroute 100% Traffic Away from Canary Pods',
        commandToExecute: 'kubectl patch ingress api-gateway -p \'{"spec":{"rules":[{"http":{"paths":[{"backend":{"service":{"name":"api-stable"}}]}}]}}\'',
        riskLevel: 'HIGH',
        riskJustification:
          'Modifies cluster-wide Ingress routing rules. Prevents user-facing 500 errors but requires engineer sign-off.',
      },
      diagnosisOrSummary:
        'Incident Diagnosis: Commit `a8f91b2` enabled Redis caching, but the production Redis cluster is rejecting connections due to connection exhaustion.',
      recommendedFix:
        '1. Approve ingress reroute to stable service.\n2. Scale Redis `maxclients` or disable feature flag `ENABLE_REDIS_CACHE=false`.\n3. Redeploy safely.',
      confidenceScore: 94,
    };
  }

  if (p.includes('terraform') || p.includes('iac') || p.includes('aws') || p.includes('infra')) {
    return {
      thought:
        "User is requesting Infrastructure as Code (IaC) generation or Terraform analysis. Agent will: 1) Parse cloud requirements, 2) Select modular Terraform provider patterns, 3) Generate secure HCL syntax with tags and least privilege.",
      plan: [
        'Analyze infrastructure requirements (VPC, Subnets, Compute)',
        'Generate modular Terraform HCL with encryption and tags',
        'Run simulated `terraform validate` and `terraform plan`',
        'Flag changes requiring senior approval',
      ],
      retrievedRunbook: {
        title: 'Terraform State Drift & IaC Review Runbook',
        trigger: 'Resource provisioning or state drift',
        relevantSteps: [
          'Run terraform plan in read-only mode',
          'Enforce tag standards and encryption at rest',
          'Require approval for apply',
        ],
      },
      toolCalls: [
        {
          tool: 'terraform',
          command: 'terraform plan -no-color',
          purpose: 'Dry-run proposed infrastructure additions',
          simulatedOutput: 'Plan: 3 to add, 0 to change, 0 to destroy.\n+ aws_vpc.devops_vpc\n+ aws_subnet.public_subnet\n+ aws_eks_cluster.main',
        },
      ],
      needsHumanApproval: true,
      approvalDetails: {
        actionTitle: 'Apply Terraform Infrastructure to AWS Cloud',
        commandToExecute: 'terraform apply -auto-approve tfplan',
        riskLevel: 'CRITICAL',
        riskJustification:
          'Provisions real cloud resources that incur billing costs and modify cloud networking.',
      },
      diagnosisOrSummary:
        'IaC Generation Complete: Formulated a production-ready AWS EKS infrastructure module adhering to CIS benchmarks.',
      recommendedFix:
        'Review the generated `main.tf` and `variables.tf`. Click "Approve & Apply" to simulate cloud deployment.',
      confidenceScore: 96,
    };
  }

  // Default Docker / General DevOps response
  return {
    thought:
      "General DevOps operational query received. Decomposing into tool interactions and safe recommendations.",
    plan: [
      'Parse request parameters and relevant DevOps domains',
      'Inspect relevant container or configuration states',
      'Provide structured operational guidance',
    ],
    retrievedRunbook: {
      title: runbook.title,
      trigger: runbook.trigger,
      relevantSteps: runbook.steps,
    },
    toolCalls: [
      {
        tool: 'docker',
        command: 'docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"',
        purpose: 'Check running containers in local daemon',
        simulatedOutput:
          'CONTAINER ID   NAMES             STATUS\n8a7b6c5d4e3f   web-frontend      Up 4 hours\n1f2e3d4c5b6a   api-backend       Up 4 hours (healthy)\n9z8y7x6w5v4u   postgres-db       Up 2 days',
      },
    ],
    needsHumanApproval: false,
    approvalDetails: null,
    diagnosisOrSummary:
      'DevOps Assistant is ready. All 5 core tool connectors (Kubectl, Docker, Git, Terraform, Prometheus) are online and healthy.',
    recommendedFix:
      'You can ask me to: 1) Investigate CrashLoopBackOff pods, 2) Triage 500 error spikes, 3) Review Dockerfiles for CVEs, or 4) Generate Terraform scripts.',
    confidenceScore: 92,
  };
}

// Development vs Production serving
async function startServer() {
  const resolvedPort = await findAvailablePort(PORT);

  if (process.env.NODE_ENV !== 'production') {
    // In dev mode: mount Vite middleware on Express
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve static files from dist
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(resolvedPort, '0.0.0.0', () => {
    console.log(`DevOps Agentic AI Assistant running at http://0.0.0.0:${resolvedPort}`);
    console.log(`Gemini integration: ${aiClient ? 'Active (gemini-3.8-flash)' : 'Simulation Mode'}`);
  });
}

startServer();
