import React, { useMemo } from "react";
import { Users, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

const ManagerView = ({ tasks }) => {
  const workloadByAssignee = useMemo(() => {
    const map = {};
    const today = new Date().toISOString().split("T")[0];

    tasks.forEach((t) => {
      if (!map[t.assignee]) {
        map[t.assignee] = {
          total: 0,
          active: 0,
          blocked: 0,
          overdue: 0,
        };
      }

      map[t.assignee].total++;

      if (t.status !== "Done") map[t.assignee].active++;
      if (t.status === "Blocked") map[t.assignee].blocked++;
      if (t.dueDate < today && t.status !== "Done") {
        map[t.assignee].overdue++;
      }
    });

    return Object.entries(map).sort((a, b) => b[1].active - a[1].active);
  }, [tasks]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Workload Velocity
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Monitoring individual capacity and potential burn-out risk.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {workloadByAssignee.map(([name, stats]) => {
          const isOverloaded = stats.active >= 10;
          const isHealthy = stats.active < 5;
          const capacityPercent = Math.min((stats.active / 10) * 100, 100);

          return (
            <div
              key={name}
              className={`bg-white p-8 rounded-[2.5rem] border transition-all hover:shadow-2xl ${
                isOverloaded ? "border-rose-200" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${
                      isOverloaded
                        ? "bg-rose-600 text-white"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-lg">
                      {name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      Active Objectives: {stats.active}
                    </p>
                  </div>
                </div>

                {isOverloaded && (
                  <div className="p-2 bg-rose-50 text-rose-500 rounded-xl animate-bounce">
                    <Zap size={24} fill="currentColor" />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span
                      className={
                        isOverloaded ? "text-rose-500" : "text-slate-400"
                      }
                    >
                      Capacity Load
                    </span>
                    <span
                      className={
                        isOverloaded ? "text-rose-600" : "text-slate-900"
                      }
                    >
                      {Math.round(capacityPercent)}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isOverloaded
                          ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                          : "bg-indigo-600"
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                      Success Rate
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      {Math.round(
                        ((stats.total - stats.active) /
                          Math.max(stats.total, 1)) *
                          100
                      )}
                      %
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                      Overdue
                    </p>
                    <p
                      className={`text-xl font-black ${
                        stats.overdue > 0 ? "text-rose-600" : "text-slate-900"
                      }`}
                    >
                      {stats.overdue}
                    </p>
                  </div>
                </div>

                {isOverloaded ? (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700">
                    <AlertTriangle size={18} />
                    <span className="text-xs font-black uppercase tracking-tight">
                      System Flag: OVERLOADED
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-black uppercase tracking-tight">
                      Capacity Healthy
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManagerView;
