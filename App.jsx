import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  GanttChartSquare,
  CalendarClock,
  ShieldAlert,
  Users,
  FileText,
  Search,
  Menu,
  X,
  Plus,
  Briefcase,
  BarChart2,
  Bell,
  Settings,
  Target,
  Zap,
} from "lucide-react";

import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_DECISIONS,
  INITIAL_RISKS,
} from "./mockData";

import DashboardView from "./components/DashboardView";
import TimelineView from "./components/TimelineView";
import TaskListView from "./components/TaskListView";
import ManagerView from "./components/ManagerView";
import DecisionLogView from "./components/DecisionLogView";
import ProjectDetailView from "./components/ProjectDetailView";
import RiskRegistryView from "./components/RiskRegistryView";
import ReportsView from "./components/ReportsView";
import TodayView from "./components/TodayView";
import BlockedView from "./components/BlockedView";

const STORAGE_KEY = "PM_COMMAND_CENTER_V5";

const App = () => {
  const [activeView, setActiveView] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [projectSearch, setProjectSearch] = useState("");

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
    return saved
      ? JSON.parse(saved)
      : { name: "Alex Rivera", title: "Director of Engineering" };
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [risks, setRisks] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_risks`);
    return saved ? JSON.parse(saved) : INITIAL_RISKS;
  });

  const [decisions, setDecisions] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_decisions`);
    return saved ? JSON.parse(saved) : INITIAL_DECISIONS;
  });

  useEffect(() => {
    // push first state
    window.history.replaceState({ view: "Dashboard" }, "");

    const handlePopState = (event) => {
      if (event.state?.view) {
        setActiveView(event.state.view);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "1",
            title: "System Healthy",
            message: "Command Center initialized successfully.",
            type: "success",
            time: "Just now",
            read: false,
          },
          {
            id: "2",
            title: "Timeline Slippage",
            message: "Mobile App Refresh is now 5 days delayed.",
            type: "alert",
            time: "2h ago",
            read: false,
          },
        ];
  });

  const [blockingModal, setBlockingModal] = useState(null);

  const [newProjectForm, setNewProjectForm] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
    localStorage.setItem(`${STORAGE_KEY}_risks`, JSON.stringify(risks));
    localStorage.setItem(`${STORAGE_KEY}_decisions`, JSON.stringify(decisions));
    localStorage.setItem(
      `${STORAGE_KEY}_notifications`,
      JSON.stringify(notifications)
    );
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(userProfile));
  }, [projects, tasks, risks, decisions, notifications, userProfile]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const processedProjects = useMemo(() => {
    return projects.map((project) => {
      const projTasks = tasks.filter((t) => t.projectId === project.id);
      const latestTaskDate = projTasks.reduce(
        (latest, task) =>
          new Date(task.dueDate) > new Date(latest) ? task.dueDate : latest,
        project.originalEndDate
      );
      const doneCount = projTasks.filter((t) => t.status === "Done").length;
      const progress =
        projTasks.length > 0
          ? Math.round((doneCount / projTasks.length) * 100)
          : 0;

      let status = "On Track";
      if (latestTaskDate > project.originalEndDate) status = "Delayed";
      else if (
        projTasks.some((t) => t.status === "Blocked" || t.status === "At Risk")
      )
        status = "At Risk";
      else if (progress === 100 && projTasks.length > 0) status = "Completed";

      return {
        ...project,
        calculatedEndDate: latestTaskDate,
        progress,
        status,
      };
    });
  }, [projects, tasks]);

  const updateTaskStatus = useCallback((taskId, newStatus) => {
    setTasks((prev) => {
      const currentTask = prev.find((t) => t.id === taskId);
      if (!currentTask) return prev;

      if (newStatus === "Done") {
        const openPrereqs = currentTask.dependencies
          .map((depId) => prev.find((t) => t.id === depId))
          .filter((t) => t && t.status !== "Done");

        if (openPrereqs.length > 0) {
          setBlockingModal({
            task: currentTask,
            dependencies: openPrereqs,
          });
          return prev;
        }
      }

      return prev.map((task) => {
        if (task.id === taskId) {
          const updatedTask = {
            ...task,
            status: newStatus,
          };
          if (task.status === "Blocked" && newStatus !== "Blocked") {
            delete updatedTask.blockerDetails;
          }
          return updatedTask;
        }
        return task;
      });
    });
  }, []);

  const updateTaskBlocker = useCallback((taskId, details) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              blockerDetails: details,
              status: details ? "Blocked" : "In Progress",
            }
          : task
      )
    );
  }, []);

  const handleAddTask = useCallback((newTask) => {
    setTasks((prev) => [...prev, { ...newTask, id: `t-${Date.now()}` }]);
  }, []);

  const handleAddDependency = useCallback((taskId, depId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId && !task.dependencies.includes(depId)
          ? {
              ...task,
              dependencies: [...task.dependencies, depId],
            }
          : task
      )
    );
  }, []);

  const handleRemoveDependency = useCallback((taskId, depId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              dependencies: task.dependencies.filter((id) => id !== depId),
            }
          : task
      )
    );
  }, []);

  const handleAddProject = (e) => {
    e.preventDefault();
    const project = {
      id: `p-${Date.now()}`,
      name: newProjectForm.name,
      description: newProjectForm.description,
      startDate: newProjectForm.startDate,
      originalEndDate: newProjectForm.endDate,
      calculatedEndDate: newProjectForm.endDate,
      progress: 0,
      status: "On Track",
    };
    setProjects((prev) => [...prev, project]);
    setShowAddProjectModal(false);
    setNewProjectForm({
      name: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
  };

  const handleSelectProject = (id) => {
    setSelectedProjectId(id);
    setActiveView("ProjectDetail");
    // if (window.innerWidth < 1024) setSidebarOpen(false);
    // setSelectedProjectId(id);
    // setActiveView("ProjectDetail");
    window.history.pushState({ view: "ProjectDetail", projectId: id }, "");
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleNavigate = (view) => {
    setActiveView(view);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const clearPortfolio = useCallback(() => {
    localStorage.clear();
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setRisks(INITIAL_RISKS);
    setDecisions(INITIAL_DECISIONS);
    setUserProfile({
      name: "Alex Rivera",
      title: "Director of Engineering",
    });
    setIsSettingsOpen(false);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case "Dashboard":
        return (
          <DashboardView
            projects={processedProjects}
            tasks={tasks}
            onSelectProject={handleSelectProject}
            onNavigate={handleNavigate}
            onAddProjectClick={() => setShowAddProjectModal(true)}
          />
        );
      case "Today":
        return (
          <TodayView
            tasks={tasks}
            projects={processedProjects}
            onStatusChange={updateTaskStatus}
          />
        );
      case "Blocked":
        return (
          <BlockedView
            tasks={tasks}
            projects={processedProjects}
            onStatusChange={updateTaskStatus}
          />
        );
      case "Projects":
        let filteredProjects = processedProjects.filter(
          (p) =>
            !projectSearch ||
            p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
            p.description.toLowerCase().includes(projectSearch.toLowerCase())
        );
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Portfolio
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                  Strategic multi-project oversight.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search Projects..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium text-sm transition-all shadow-sm"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> New Project
                </button>
              </div>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProject(p.id)}
                  className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group hover:border-indigo-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-lg lg:text-xl text-slate-900 group-hover:text-indigo-600 truncate mr-2">
                      {p.name}
                    </h3>
                    <span
                      className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 ${
                        p.status === "On Track"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-8 line-clamp-2 h-10">
                    {p.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                      <span>{p.progress}% Complete</span>
                      <span>Ends {p.calculatedEndDate}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                  <p className="font-bold text-slate-400">
                    No projects found matching "{projectSearch}"
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case "Tasks":
        return (
          <TaskListView
            title="Task Inventory"
            tasks={tasks}
            projects={processedProjects}
            decisions={decisions}
            onStatusChange={updateTaskStatus}
            onUpdateBlocker={updateTaskBlocker}
            onAddDependency={handleAddDependency}
            onRemoveDependency={handleRemoveDependency}
            onAddTask={handleAddTask}
          />
        );
      case "Timeline":
        return <TimelineView projects={processedProjects} />;
      case "Risks":
        return (
          <RiskRegistryView
            risks={risks}
            projects={processedProjects}
            tasks={tasks}
          />
        );
      case "Team":
        return <ManagerView tasks={tasks} />;
      case "Decisions":
        return (
          <DecisionLogView
            decisions={decisions}
            projects={processedProjects}
            tasks={tasks}
            onAddDecision={(nd) =>
              setDecisions((prev) => [
                ...prev,
                { ...nd, id: `d-${Date.now()}` },
              ])
            }
          />
        );
      case "Reports":
        return (
          <ReportsView
            projects={processedProjects}
            tasks={tasks}
            risks={risks}
          />
        );
      case "ProjectDetail":
        const pr = processedProjects.find((p) => p.id === selectedProjectId);
        if (!pr) return null;
        return (
          <ProjectDetailView
            project={pr}
            tasks={tasks.filter((t) => t.projectId === pr.id)}
            decisions={decisions.filter((d) =>
              d.impactedProjectIds.includes(pr.id)
            )}
            projects={processedProjects}
            onStatusChange={updateTaskStatus}
            onUpdateBlocker={updateTaskBlocker}
            onAddDependency={handleAddDependency}
            onRemoveDependency={handleRemoveDependency}
            onAddTask={handleAddTask}
          />
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: "Dashboard", label: "Command Center", icon: LayoutDashboard },
    { id: "Today", label: "Today", icon: Target },
    { id: "Blocked", label: "Blocked", icon: ShieldAlert },
    { id: "Timeline", label: "Timeline", icon: GanttChartSquare },
    { id: "Tasks", label: "Tasks", icon: CalendarClock },
    { id: "Projects", label: "Portfolio", icon: Briefcase },
    { id: "Team", label: "Team", icon: Users },
    { id: "Decisions", label: "Decisions", icon: FileText },
    { id: "Reports", label: "Reports", icon: BarChart2 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 relative">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 lg:static z-50 ${
          sidebarOpen
            ? "w-64 translate-x-0"
            : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"
        } bg-slate-900 text-slate-400 flex flex-col transition-all duration-300 shrink-0 shadow-2xl overflow-hidden`}
      >
        <div className="p-6 lg:p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
            <Zap size={22} />
          </div>
          {sidebarOpen && (
            <span
              onClick={() => {
                setActiveView("Dashboard");
                setSelectedProjectId(null);
                window.history.pushState({ view: "Dashboard" }, "");
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className="text-white font-black text-xl tracking-tight uppercase whitespace-nowrap cursor-pointer"
            >
              PM CMD
            </span>
          )}
        </div>
        <nav className="flex-1 mt-4 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                activeView === item.id
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={22} className="shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-bold tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-3 hover:bg-slate-800 rounded-2xl transition-all"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 lg:h-24 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:block">
              System Status: Optimal
            </h2>
          </div>
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2 lg:gap-4">
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
              >
                <Bell size={20} />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                )}
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
              >
                <Settings size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3 lg:gap-4 border-l border-slate-100 pl-4 lg:pl-8">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none">
                  {userProfile.name}
                </p>
                <p className="text-[10px] text-slate-400 font-black uppercase mt-1.5 tracking-tighter">
                  {userProfile.title}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs lg:text-sm shadow-xl shadow-indigo-100">
                {userProfile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12 bg-slate-50 scroll-smooth">
          {renderContent()}
        </main>
      </div>

      {/* New Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            onClick={() => setShowAddProjectModal(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black mb-8 text-slate-900">
              Initiate New Strategy
            </h2>
            <form onSubmit={handleAddProject} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Project Identifier
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Project Phoenix"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                  value={newProjectForm.name}
                  onChange={(e) =>
                    setNewProjectForm({
                      ...newProjectForm,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Strategic Overview
                </label>
                <textarea
                  required
                  placeholder="Define scope and objectives..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm h-24 resize-none"
                  value={newProjectForm.description}
                  onChange={(e) =>
                    setNewProjectForm({
                      ...newProjectForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Commencement
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                    value={newProjectForm.startDate}
                    onChange={(e) =>
                      setNewProjectForm({
                        ...newProjectForm,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Target EOD
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                    value={newProjectForm.endDate}
                    onChange={(e) =>
                      setNewProjectForm({
                        ...newProjectForm,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                >
                  Launch Initiative
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsNotificationOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black">Notifications</h2>
              <button
                onClick={() => setIsNotificationOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    n.read
                      ? "bg-white opacity-60 border-slate-100"
                      : "bg-slate-50 border-indigo-100"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-black text-sm text-slate-900">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            onClick={() => setIsSettingsOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 lg:p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black mb-8 text-slate-900">
              CMD Center Settings
            </h2>
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  System Display Name
                </label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, name: e.target.value })
                  }
                  className="bg-transparent border-none outline-none font-bold w-full text-slate-900"
                />
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                  Corporate Title
                </label>
                <input
                  type="text"
                  value={userProfile.title}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, title: e.target.value })
                  }
                  className="bg-transparent border-none outline-none font-bold w-full text-slate-900"
                />
              </div>
              <div className="pt-4 space-y-4">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={clearPortfolio}
                  className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-100 transition-all"
                >
                  Reset All Local Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blocking Alert Modal */}
      {blockingModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/95 backdrop-blur-md"
            onClick={() => setBlockingModal(null)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 lg:p-12 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              Critical Blocker Identified
            </h2>
            <p className="text-slate-500 mb-10 text-sm leading-relaxed">
              Objective{" "}
              <span className="text-slate-900 font-bold">
                "{blockingModal.task.title}"
              </span>{" "}
              has {blockingModal.dependencies.length} unresolved prerequisites.
              Completing this now will break the logical critical path.
            </p>
            <button
              onClick={() => setBlockingModal(null)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all"
            >
              Acknowledge Constraint
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
