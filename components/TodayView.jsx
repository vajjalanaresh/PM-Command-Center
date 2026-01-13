import React from "react";
import { CheckCircle2, Clock, AlertCircle, Target } from "lucide-react";

const TodayView = ({ tasks, projects, onStatusChange }) => {
  const today = new Date().toISOString().split("T")[0];

  const dueTodayTasks = tasks.filter(
    (t) => t.dueDate <= today && t.status !== "Done"
  );

  const getProjectName = (projectId) =>
    projects.find((p) => p.id === projectId)?.name || "Unknown";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
          <Target size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Today's Focus
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Critical objectives requiring resolution by EOD.
          </p>
        </div>
      </header>

      <div className="space-y-4">
        {dueTodayTasks.length > 0 ? (
          dueTodayTasks.map((task) => {
            const isOverdue = task.dueDate < today;

            return (
              <div
                key={task.id}
                className={`bg-white p-5 lg:p-6 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group ${
                  isOverdue
                    ? "border-l-4 border-l-rose-500"
                    : "border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <button
                    onClick={() => onStatusChange(task.id, "Done")}
                    className="w-10 h-10 rounded-xl border-2 border-slate-100 flex items-center justify-center text-transparent hover:text-emerald-500 hover:border-emerald-500 transition-all bg-slate-50 group-hover:bg-white shrink-0"
                  >
                    <CheckCircle2 size={24} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-900 truncate max-w-[200px] sm:max-w-none">
                        {task.title}
                      </h3>

                      {isOverdue && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg shrink-0">
                          <AlertCircle size={10} /> Overdue
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest truncate">
                      {getProjectName(task.projectId)} • {task.assignee}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-black text-slate-400 bg-slate-50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto">
                  <Clock size={14} className="shrink-0" />
                  {task.dueDate}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              No tasks due today 🎉
            </h3>
            <p className="text-slate-500 mt-2 font-medium">
              The decks are clear. Focus on strategy or upcoming roadmap
              planning.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayView;
