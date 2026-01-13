import React from "react";
import {
  PieChart,
  BarChart2,
  Activity,
  Target,
  ShieldAlert,
} from "lucide-react";

const ReportsView = ({ projects, tasks, risks }) => {
  // Prevent division by zero
  const avgProgress =
    projects.length > 0
      ? projects.reduce((acc, p) => acc + p.progress, 0) / projects.length
      : 0;

  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Portfolio Reports</h1>
        <p className="text-slate-500 font-medium">
          Aggregated analytics and performance trends.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Aggregate Progress */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-6">
          <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">
            Aggregate Progress
          </h3>

          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="20"
                fill="transparent"
                className="text-slate-50"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="20"
                fill="transparent"
                strokeDasharray={Math.PI * 2 * 80}
                strokeDashoffset={Math.PI * 2 * 80 * (1 - avgProgress / 100)}
                strokeLinecap="round"
                className="text-indigo-600 transition-all duration-1000"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-4xl font-black text-slate-900">
                {Math.round(avgProgress)}%
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-slate-900">
              Portfolio Delivery Rate
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Based on {tasks.length} aggregated tasks
            </p>
          </div>
        </div>

        {/* Health Breakdown */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900">
              Health Breakdown
            </h3>
            <BarChart2 className="text-slate-400" size={20} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full content-center">
            <div className="space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                    <span className="text-slate-500">{status}</span>
                    <span className="text-slate-900">{count}</span>
                  </div>

                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div
                      className={`h-full transition-all duration-700 ${
                        status === "Delayed"
                          ? "bg-rose-500"
                          : status === "At Risk"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${
                          (Number(count) / (projects.length || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-center border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-indigo-600" size={18} />
                <p className="font-bold text-slate-900 text-sm">
                  Actionable Insight
                </p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                "Project delay frequency has increased by 12% since the last
                sprint. Focus on mitigating 'Medium' severity risks to prevent
                further portfolio slippage."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Avg Tasks / PM"
          value="14.2"
          trend="+2.4"
          icon={<PieChart size={18} />}
        />
        <ReportCard
          title="Risk Density"
          value="0.5"
          trend="-0.1"
          icon={<ShieldAlert size={18} />}
        />
        <ReportCard
          title="Blocker Lifetime"
          value="3.2 Days"
          trend="-0.5"
          icon={<Target size={18} />}
        />
        <ReportCard
          title="Velocity"
          value="1.8 pts"
          trend="+0.3"
          icon={<Activity size={18} />}
        />
      </div>
    </div>
  );
};

const ReportCard = ({ title, value, trend, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">{icon}</div>
      <span
        className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
          trend.startsWith("+")
            ? "bg-emerald-50 text-emerald-600"
            : "bg-rose-50 text-rose-600"
        }`}
      >
        {trend}
      </span>
    </div>

    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
      {title}
    </p>
    <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
  </div>
);

export default ReportsView;
