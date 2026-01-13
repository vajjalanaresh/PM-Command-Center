import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShieldX,
  Zap,
  ChevronRight,
  Plus,
  BarChart2,
} from "lucide-react";

const DashboardView = ({
  projects = [],
  tasks = [],
  onSelectProject = () => {},
  onNavigate = () => {},
  onAddProjectClick = () => {},
}) => {
  const atRiskCount = projects.filter((p) => p.status === "At Risk").length;
  const delayedCount = projects.filter((p) => p.status === "Delayed").length;
  const blockedTasks = tasks.filter((t) => t.status === "Blocked");
  const todayStr = new Date().toISOString().split("T")[0];
  const overdueCount = tasks.filter(
    (t) => t.dueDate < todayStr && t.status !== "Done"
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Command Center
          </h1>
          <p className="text-slate-500 font-medium">
            Portfolio health and critical bottleneck overview.
          </p>
        </div>
        <button
          onClick={onAddProjectClick}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-xs uppercase tracking-widest w-full sm:w-auto"
        >
          <Plus size={18} />
          Initiate Project
        </button>
      </header>

      {/* Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total Projects"
          value={projects.length}
          icon={<TrendingUp size={20} />}
          color="bg-indigo-50 text-indigo-600"
          onClick={() => onNavigate("Projects")}
        />
        <StatCard
          label="Critical Path Risks"
          value={atRiskCount + delayedCount}
          icon={<AlertCircle size={20} />}
          color="bg-rose-50 text-rose-600"
          onClick={() => onNavigate("Blocked")}
        />
        <StatCard
          label="Active Blockers"
          value={blockedTasks.length}
          icon={<ShieldX size={20} />}
          color="bg-amber-50 text-amber-600"
          onClick={() => onNavigate("Blocked")}
        />
        <StatCard
          label="Due / Overdue"
          value={overdueCount}
          icon={<Clock size={20} />}
          color="bg-slate-100 text-slate-600"
          onClick={() => onNavigate("Today")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={20} className="text-amber-500 fill-amber-500" />
              <h2 className="text-xl font-black text-slate-900">
                Priority Alerts
              </h2>
            </div>

            <div className="space-y-4">
              {delayedCount > 0 && (
                <div className="p-4 sm:p-5 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <AlertCircle className="text-rose-500" size={20} />
                  </div>
                  <div>
                    <p className="font-black text-rose-900 text-sm">
                      Portfolio Delay Warning
                    </p>
                    <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                      {delayedCount} projects have slipped past their original
                      target dates. Resource audit recommended.
                    </p>
                  </div>
                </div>
              )}

              {blockedTasks.length > 0 && (
                <div className="p-4 sm:p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <ShieldX className="text-amber-500" size={20} />
                  </div>
                  <div>
                    <p className="font-black text-amber-900 text-sm">
                      Bottlenecks Identified
                    </p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      {blockedTasks.length} high-impact tasks are stalled.
                      Review the Blocked tab for root-cause analysis.
                    </p>
                  </div>
                </div>
              )}

              {delayedCount === 0 && blockedTasks.length === 0 && (
                <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                  <CheckCircle2
                    size={32}
                    className="mx-auto mb-3 text-emerald-500 opacity-20"
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Portfolio Healthy
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">
              Active Initiatives
            </h2>

            <div className="space-y-4">
              {projects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        p.status === "On Track"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Ends {p.calculatedEndDate}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-slate-300 group-hover:text-indigo-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl">
            <h3 className="font-black text-xl mb-3">Portfolio Strategy</h3>
            <p className="text-xs text-indigo-100 mb-6">
              Visualize resource overlaps and milestone shifts in real-time.
            </p>
            <button
              onClick={() => onNavigate("Timeline")}
              className="w-full bg-white text-indigo-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest"
            >
              View Timeline Bar
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-sm">
              <BarChart2 size={16} className="text-indigo-500" /> System Load
            </h3>

            <div className="flex justify-center">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-50"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={Math.PI * 2 * 64}
                    strokeDashoffset={
                      Math.PI *
                      2 *
                      64 *
                      (1 -
                        projects.reduce((a, p) => a + p.progress, 0) /
                          Math.max(projects.length * 100, 1))
                    }
                    strokeLinecap="round"
                    className="text-indigo-600 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-slate-900">
                    {Math.round(
                      projects.reduce((a, p) => a + p.progress, 0) /
                        Math.max(projects.length, 1)
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 text-left hover:border-indigo-300 hover:shadow-lg transition-all"
  >
    <div className={`p-3 rounded-xl shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
        {label}
      </p>
      <h4 className="text-2xl font-black text-slate-900">{value}</h4>
    </div>
  </button>
);

export default DashboardView;
