import React, { useMemo } from "react";
import TaskListView from "./TaskListView";
import {
  BarChart3,
  History,
  Target,
  ShieldAlert,
  CalendarDays,
  Flame,
} from "lucide-react";

const ProjectDetailView = ({
  project,
  tasks,
  decisions,
  projects,
  onStatusChange,
  onUpdateBlocker,
  onAddDependency,
  onRemoveDependency,
  onAddTask,
}) => {
  const isDelayed = project.calculatedEndDate > project.originalEndDate;

  const healthScore = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    const overdueCount = tasks.filter(
      (t) => t.dueDate < today && t.status !== "Done"
    ).length;

    const blockedCount = tasks.filter((t) => t.status === "Blocked").length;

    if (blockedCount > 0 || overdueCount > 2) {
      return {
        label: "CRITICAL",
        color: "bg-rose-500",
        icon: <Flame size={16} />,
      };
    }

    if (overdueCount > 0 || isDelayed) {
      return {
        label: "AT RISK",
        color: "bg-amber-500",
        icon: <ShieldAlert size={16} />,
      };
    }

    return {
      label: "HEALTHY",
      color: "bg-emerald-500",
      icon: <Target size={16} />,
    };
  }, [tasks, isDelayed]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {project.name}
            </h1>
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[10px] font-black uppercase ${healthScore.color}`}
            >
              {healthScore.icon}
              {healthScore.label}
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              Timeline: {project.startDate} — {project.calculatedEndDate}
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 size={16} />
              {tasks.length} Total Tasks
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main */}
        <div className="lg:col-span-3 space-y-10">
          <section className="bg-white rounded-3xl p-2 shadow-sm border border-slate-200">
            <TaskListView
              title="Project Backlog"
              tasks={tasks}
              projects={projects}
              onStatusChange={onStatusChange}
              onUpdateBlocker={onUpdateBlocker}
              onAddDependency={onAddDependency}
              onRemoveDependency={onRemoveDependency}
              onAddTask={onAddTask}
              fixedProjectId={project.id}
            />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <History size={18} className="text-indigo-600" />
              Related Decisions
            </h3>

            {decisions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No formal decisions recorded for this project yet.
              </p>
            ) : (
              <div className="space-y-4">
                {decisions.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors"
                  >
                    <p className="text-xs font-bold text-slate-400 mb-1">
                      {d.date}
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {d.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />

            <h3 className="font-bold text-lg mb-4">Strategic Summary</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-400">Task Completion</span>
                <span>{project.progress}%</span>
              </div>

              <div className="w-full h-1.5 bg-slate-800 rounded-full">
                <div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 pt-2 leading-relaxed">
                {isDelayed
                  ? "Critical attention required on timeline slippage. Dependencies are impacting target end-date."
                  : "On track for current milestones. Focus remains on upcoming integration points."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailView;
