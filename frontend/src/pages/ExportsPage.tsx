import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { Download, FileText, CheckCircle2, ShieldCheck, Database, FileSpreadsheet, Code } from 'lucide-react';

export const ExportsPage: React.FC = () => {
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadManifest = async () => {
      try {
        const res = await fetch('/data/dataset_manifest.json');
        if (res.ok) {
          const data = await res.json();
          setManifest(data);
        }
      } catch (err) {
        console.error('Error loading manifest:', err);
      } finally {
        setLoading(false);
      }
    };
    loadManifest();
  }, []);

  const tables = [
    { name: 'employees', title: 'Employees (2,000)', desc: 'Full IT employee master data' },
    { name: 'teams', title: 'Teams (100)', desc: 'IT squads and departmental groups' },
    { name: 'skills', title: 'Skills (60)', desc: 'Curated IT-only skills taxonomy' },
    { name: 'employee_skills', title: 'Employee Skills', desc: 'Bridge table with proficiency levels' },
    { name: 'shift_templates', title: 'Shift Templates', desc: 'Reusable 8h shift patterns' },
    { name: 'shift_occurrences', title: 'Shift Occurrences', desc: '90 days of dated occurrences' },
    { name: 'coverage_requirements', title: 'Coverage Requirements', desc: 'Headcount & technical skill demand' },
    { name: 'shift_assignments', title: 'Shift Assignments', desc: 'Allocated workers per occurrence' },
    { name: 'leave_requests', title: 'Leave Requests (5,000)', desc: 'Time-off requests & manager decisions' },
    { name: 'attendance_events', title: 'Attendance Events', desc: 'Clock punches & reconciled hours' },
    { name: 'swap_requests', title: 'Swap Requests', desc: 'Shift exchange requests & approval state' },
    { name: 'schedule_runs', title: 'Schedule Runs', desc: 'Solver runs and coverage statistics' },
    { name: 'ground_truth', title: 'Anomaly Ground Truth', desc: 'Decoupled benchmark ground-truth labels' },
  ];

  const reports = [
    { file: 'generation_report.md', title: 'Generation Report', desc: 'Deterministic seed & entity counts summary' },
    { file: 'validation_report.md', title: 'Validation Report', desc: 'Full audit findings & constraint detections' },
    { file: 'evaluation_report.md', title: 'Evaluation Benchmark Report', desc: 'Precision, Recall, F1 & Quality Metrics' },
  ];

  const downloadFile = (path: string, filename: string) => {
    const a = document.createElement('a');
    a.href = path;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Download className="w-5 h-5 text-indigo-400" />
          <span>Data Exports &amp; Reproducibility Center</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Export authoritative synthetic datasets, isolated ground truth, manifests, and reproducible evaluation reports.
        </p>
      </div>

      {/* Manifest Box */}
      {manifest && (
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950/20 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Authoritative Dataset Manifest</h2>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Seed: {manifest.random_seed}
              </span>
            </div>
            <button
              onClick={() => downloadFile('/data/dataset_manifest.json', 'dataset_manifest.json')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download manifest.json</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-500 uppercase font-sans font-medium block">Generator Version</span>
              <span className="text-slate-200">{manifest.generator_version}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-500 uppercase font-sans font-medium block">Random Seed</span>
              <span className="text-indigo-300 font-bold">{manifest.random_seed}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-500 uppercase font-sans font-medium block">Generation Mode</span>
              <span className="text-emerald-400 uppercase">{manifest.mode}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-500 uppercase font-sans font-medium block">Generated At</span>
              <span className="text-slate-300 text-[11px] truncate block">{manifest.generated_at}</span>
            </div>
          </div>
        </div>
      )}

      {/* Generated Markdown Reports */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Evaluation and Audit Reports (Markdown)</span>
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {reports.map(rep => (
            <div key={rep.file} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700 mb-2 inline-block">
                  {rep.file}
                </span>
                <h3 className="font-bold text-white text-xs mb-1">{rep.title}</h3>
                <p className="text-[11px] text-slate-400">{rep.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => downloadFile(`/data/${rep.file}`, rep.file)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Tables Export Matrix */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Entity Datasets Export (CSV &amp; JSON)</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map(tbl => (
            <div key={tbl.name} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-white">{tbl.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">{tbl.name}</span>
                </div>
                <p className="text-[11px] text-slate-400">{tbl.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => downloadFile(`/data/${tbl.name}.csv`, `${tbl.name}.csv`)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => downloadFile(`/data/${tbl.name}.json`, `${tbl.name}.json`)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  <span>JSON</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

