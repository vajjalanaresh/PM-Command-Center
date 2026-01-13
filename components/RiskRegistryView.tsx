import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  Plus,
} from 'lucide-react';

const RiskRegistryView = ({ risks, projects, tasks }) => {
  const getProjectName = (pid) =>
    projects.find((p) => p.id === pid)?.name || 'N/A';

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Medium':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Risk Registry
          </h1>
          <p className="text-slate-500 font-medium">
            Identified threats and active mitigation plans.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
          <Plus size={18} /> Log New Risk
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {risks.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
            <CheckCircle2
              size={48}
              className="text-emerald-500 mx-auto mb-4"
            />
            <h3 className="text-xl font-bold">No active risks</h3>
            <p className="text-slate-500 mt-2">
              The portfolio is currently clear of identified threats.
            </p>
          </div>
        ) : (
          risks.map((risk) => (
            <div
              key={risk.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${getSeverityStyle(
                      risk.severity
                    )}`}
                  >
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {risk.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      {getProjectName(risk.projectId)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getSeverityStyle(
                      risk.severity
                    )}`}
                  >
                    {risk.severity} Impact
                  </span>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                    <AlertTriangle
                      size={14}
                      className="text-amber-500"
                    />
                    Impacted Tasks
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {risk.impactedTaskIds.map((tid) => {
                      const task = tasks.find((t) => t.id === tid);
                      return (
                        <span
                          key={tid}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600"
                        >
                          {task?.title || tid}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    Mitigation Plan
                  </h4>
                  <p className="text-sm text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 font-medium italic">
                    "{risk.mitigation}"
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RiskRegistryView;
