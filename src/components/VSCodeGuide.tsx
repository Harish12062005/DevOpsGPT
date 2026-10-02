import React, { useState } from 'react';
import { 
  Code2, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  FolderTree, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Cpu, 
  Layers,
  ChevronRight
} from 'lucide-react';
import JSZip from 'jszip';
import { VSCODE_PROJECT_FILES } from '../data/devopsData';
import { ProjectFile } from '../types/agent';

export const VSCodeGuide: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(VSCODE_PROJECT_FILES[1]); // agent.js
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleCopyCommand = (cmd: string, stepIdx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedStep(stepIdx);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const projectFolder = zip.folder('agentic-devops-assistant');

      // Add all project files
      VSCODE_PROJECT_FILES.forEach((f) => {
        projectFolder?.file(f.path, f.content);
      });

      // Add a simple public HTML file for web viewing
      const publicFolder = projectFolder?.folder('public');
      publicFolder?.file(
        'index.html',
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DevOpsGPT - Agentic AI Assistant</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-8">
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
      <h1 class="text-2xl font-bold text-cyan-400">DevOpsGPT Agentic AI Console</h1>
      <p class="text-xs text-slate-400 mt-1">Autonomous DevOps Assistant with Reasoning & Tool Calling</p>
      
      <div class="mt-4 space-y-3">
        <input id="prompt" type="text" placeholder="e.g. Investigate CrashLoopBackOff pod..." class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm focus:outline-none focus:border-cyan-500" />
        <button onclick="sendPrompt()" class="w-full bg-cyan-600 hover:bg-cyan-500 font-semibold p-3 rounded-xl text-sm transition">Dispatch Agent</button>
      </div>
    </div>
    
    <div id="output" class="bg-slate-900 border border-slate-800 p-6 rounded-2xl font-mono text-xs whitespace-pre-wrap text-emerald-400 hidden"></div>
  </div>

  <script>
    async function sendPrompt() {
      const prompt = document.getElementById('prompt').value;
      if (!prompt) return;
      const out = document.getElementById('output');
      out.classList.remove('hidden');
      out.innerText = "Agent is reasoning with Gemini and tools...";
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        out.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        out.innerText = "Error: " + err.message;
      }
    }
  </script>
</body>
</html>`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'agentic-devops-assistant-vscode.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip', err);
    } finally {
      setIsZipping(false);
    }
  };

  const steps = [
    {
      title: 'Step 1: Install Prerequisites in VS Code',
      desc: 'Ensure you have Node.js 18+ or 20+ installed. Open VS Code and install the following extensions from the Marketplace:',
      code: '# Recommended VS Code Extensions\n- "Docker" by Microsoft\n- "Kubernetes" by Microsoft\n- "HashiCorp Terraform" by HashiCorp\n- "Even Better TOML" / "YAML" by Red Hat',
    },
    {
      title: 'Step 2: Create Project Folder & Initialize',
      desc: 'Open VS Code integrated terminal (`Ctrl + ~` or `Cmd + ~`) and initialize your project:',
      code: `mkdir agentic-devops-assistant
cd agentic-devops-assistant
npm init -y`,
    },
    {
      title: 'Step 3: Install Required Dependencies',
      desc: 'Install the official Google GenAI SDK and Express web server:',
      code: `npm install @google/genai express dotenv cors
npm install -D nodemon`,
    },
    {
      title: 'Step 4: Configure Your .env File',
      desc: 'Get your Gemini API key from https://aistudio.google.com and set your local APP_URL:',
      code: `echo "GEMINI_API_KEY=your_actual_gemini_api_key_here" > .env
echo "PORT=3000" >> .env
echo "APP_URL=http://localhost:3000" >> .env`,
    },
    {
      title: 'Step 5: Run & Test Locally',
      desc: 'Launch your agent server in VS Code terminal:',
      code: `node server.js
# Or with auto-reload:
npx nodemon server.js`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Code2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              VS Code Step-by-Step Developer Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build and run this Agentic AI assistant directly on your laptop in Visual Studio Code. Complete beginner & college friendly!
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-linear-to-r from-cyan-600 via-indigo-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-lg shadow-cyan-600/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>{isZipping ? 'Packaging Project...' : 'Download Full VS Code Project (.ZIP)'}</span>
        </button>
      </div>

      {/* College Step-by-Step Tutorial Cards */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span>Step-by-Step Terminal Instructions for VS Code</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((st, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-[10px] flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span>{st.title}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{st.desc}</p>
              </div>

              <div className="relative group bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
                <pre>{st.code}</pre>
                <button
                  onClick={() => handleCopyCommand(st.code, idx)}
                  className="absolute right-2 top-2 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Copy command"
                >
                  {copiedStep === idx ? (
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

      {/* Project Source Code Inspector */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <FolderTree className="h-4 w-4 text-indigo-400" />
          <span>Project File Tree & Complete Source Code</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Selector */}
          <div className="space-y-1.5">
            {VSCODE_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-semibold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span>{file.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">{file.language}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span className="font-mono font-semibold">{selectedFile.path}</span>
                <span className="text-slate-500 text-[11px] hidden sm:inline">— {selectedFile.description}</span>
              </div>

              <button
                onClick={() => handleCopyCode(selectedFile.content)}
                className="px-3 py-1 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedFile ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedFile ? 'Copied File!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-cyan-100 overflow-x-auto leading-relaxed max-h-125 overflow-y-auto">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
