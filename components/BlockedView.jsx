import React from "react";
import { ShieldAlert, Calendar, MessageSquare } from "lucide-react";

const BlockedView = ({ tasks, projects, onStatusChange }) => {
  const blockedTasks = tasks.filter((t) => t.status === "Blocked");
  const getProjectName = (pid) =>
    projects.find((p) => p.id === pid)?.name || "Unknown";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Portfolio Blockers
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Critical path analysis of stalled objectives.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blockedTasks.length > 0 ? (
          blockedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-8 rounded-[2.5rem] border border-rose-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="font-black text-xl text-slate-900 mb-1">
                    {task.title}
                  </h3>
                  <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">
                    {getProjectName(task.projectId)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                  <ShieldAlert size={24} />
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                    <MessageSquare size={10} /> Root Cause
                  </label>
                  <p className="text-sm font-bold text-slate-700 italic">
                    "{task.blockerDetails?.reason || "Reason not documented"}"
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black">
                      {task.blockerDetails?.owner
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">
                        Responsible
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        {task.blockerDetails?.owner}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase">
                      Resolution ETA
                    </p>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Calendar size={12} className="text-rose-400" />
                      {task.blockerDetails?.eta}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onStatusChange(task.id, "In Progress")}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
              >
                Mark Unblocked
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} className="opacity-20" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Portfolio is Clear
            </h3>
            <p className="text-slate-500 mt-2">
              No critical path items are currently blocked.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedView;
