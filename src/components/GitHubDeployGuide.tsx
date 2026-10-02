import React, { useState } from 'react';
import { 
  GitBranch, 
  Globe, 
  Github, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Terminal,
  Server,
  Cloud
} from 'lucide-react';

export const GitHubDeployGuide: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const gitSteps = [
    {
      id: 'git-init',
      title: '1. Initialize Git in Your Project Directory',
      desc: 'In VS Code terminal (`Ctrl + \` `), initialize git tracking and make your first commit:',
      command: `git init
git add .
git commit -m "feat: initial commit for Agentic DevOps Assistant"`,
    },
    {
      id: 'git-remote',
      title: '2. Create a GitHub Repository & Push',
      desc: 'Create a new repository on GitHub (e.g. named `agentic-devops-assistant`) and connect it:',
      command: `git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/agentic-devops-assistant.git
git push -u origin main`,
    },
    {
      id: 'git-secrets',
      title: '3. Crucial Security Rule: Never Commit .env!',
      desc: 'Ensure your `.gitignore` contains `.env` and `node_modules` so your private Gemini API key never leaks onto public GitHub:',
      command: `# In .gitignore:
node_modules/
.env
dist/
.DS_Store`,
    },
  ];

  const deploymentPlatforms = [
    {
      name: 'Vercel (Recommended - 1 Click & Free)',
      icon: Cloud,
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
      badge: 'Fastest Free Hosting',
      description: 'Ideal for publishing full-stack web applications with automatic CI/CD on every git push.',
      steps: [
        '1. Go to https://vercel.com and log in with your GitHub account.',
        '2. Click "Add New..." -> "Project" and select `agentic-devops-assistant`.',
        '3. Under "Environment Variables", add: `GEMINI_API_KEY = your_key_here`.',
        '4. Click "Deploy"! In ~45 seconds, your assistant will be live with a free `.vercel.app` URL.',
      ],
      url: 'https://vercel.com/new',
    },
    {
      name: 'Render / Railway (Full Express Server)',
      icon: Server,
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
      badge: 'Free Web Service',
      description: 'Best if you want a dedicated Node.js backend server process running 24/7.',
      steps: [
        '1. Go to https://render.com and create a free Web Service.',
        '2. Connect your GitHub repo.',
        '3. Set Build Command: `npm install && npm run build` and Start Command: `npm start`.',
        '4. Add `GEMINI_API_KEY` in the Environment panel and deploy.',
      ],
      url: 'https://render.com',
    },
  ];

  const githubActionsWorkflow = `# .github/workflows/deploy.yml
name: DevOps Agent CI/CD Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Syntax & Lint Check
        run: npm run lint --if-present

      - name: Run Build
        run: npm run build`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <GitBranch className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              GitHub Publishing & Live Website Hosting Guide
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete walkthrough to publish your source code on GitHub and launch a live website URL for your college presentation.
          </p>
        </div>

        <a
          href="https://github.com/new"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Github className="h-4 w-4" />
          <span>Create GitHub Repo</span>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </a>
      </div>

      {/* Part 1: Push to GitHub */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Github className="h-4 w-4 text-purple-400" />
          <span>Part 1: Push Source Code to GitHub via VS Code</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gitSteps.map((step) => (
            <div key={step.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-xs font-bold text-white">{step.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>

              <div className="relative bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
                <pre className="whitespace-pre-wrap">{step.command}</pre>
                <button
                  onClick={() => handleCopy(step.command, step.id)}
                  className="absolute right-2 top-2 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Copy command"
                >
                  {copiedId === step.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: Publish Live as a Website */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-cyan-400" />
          <span>Part 2: Publish as a Live Website (100% Free)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {deploymentPlatforms.map((platform, idx) => {
            const Icon = platform.icon;
            return (
              <div key={idx} className={`p-5 rounded-2xl border ${platform.color} space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-5 w-5" />
                    <h3 className="text-sm font-bold text-white">{platform.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-slate-700 bg-slate-900 text-slate-300">
                    {platform.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{platform.description}</p>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                  {platform.steps.map((st, sIdx) => (
                    <div key={sIdx} className="leading-relaxed">
                      {st}
                    </div>
                  ))}
                </div>

                <a
                  href={platform.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 transition shadow cursor-pointer"
                >
                  <span>Launch on {platform.name.split(' ')[0]}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 3: Automated CI/CD with GitHub Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Terminal className="h-4 w-4 text-indigo-400" />
            <span>Bonus: Automated GitHub Actions CI/CD Pipeline (`.github/workflows/deploy.yml`)</span>
          </div>
          <button
            onClick={() => handleCopy(githubActionsWorkflow, 'workflow')}
            className="px-3 py-1 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            {copiedId === 'workflow' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy Workflow YAML</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Save this file in `.github/workflows/deploy.yml` in your repo to automatically run automated build tests every time you git push!
        </p>

        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
          <code>{githubActionsWorkflow}</code>
        </pre>
      </div>
    </div>
  );
};
