import React, { useState } from "react";
import { Plus, History, ArrowRight } from "lucide-react";

const DecisionLogView = ({
  decisions = [],
  projects = [],
  tasks = [],
  onAddDecision = () => {},
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!desc.trim()) return;

    onAddDecision({
      description: desc,
      date: new Date().toISOString().split("T")[0],
      impactedProjectIds: [],
      impactedTaskIds: [],
    });

    setDesc("");
    setShowAdd(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Decision Registry
          </h1>
          <p className="text-slate-500 mt-2">
            Formal audit trail of architectural and project shifts
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          {showAdd ? (
            "Close"
          ) : (
            <>
              <Plus size={18} /> Log Decision
            </>
          )}
        </button>
      </header>

      {showAdd && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl animate-in zoom-in-95 duration-300"
        >
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Decision Summary
          </label>
          <textarea
            className="w-full border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-slate-600 h-32"
            placeholder="Describe what was decided, why, and the expected outcome..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-slate-500 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold"
            >
              Publish to Log
            </button>
          </div>
        </form>
      )}

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 z-0"></div>
        <div className="space-y-8 relative z-10">
          {decisions.map((decision) => (
            <div key={decision.id} className="flex gap-6 group">
              <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-sm group-hover:border-indigo-500 transition-colors">
                <History size={20} />
              </div>

              <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                    {decision.date}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase font-bold">
                    Log #{decision.id.split("-")[1]?.slice(-4) || "612A"}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed font-medium">
                  {decision.description}
                </p>

                {(decision.impactedProjectIds.length > 0 ||
                  decision.impactedTaskIds.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                    {decision.impactedProjectIds.map((pid) => (
                      <span
                        key={pid}
                        className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded flex items-center gap-1 font-bold"
                      >
                        Project: {projects.find((p) => p.id === pid)?.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DecisionLogView;
