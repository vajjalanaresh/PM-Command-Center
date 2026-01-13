import React, { useState, useMemo } from "react";
import { GoogleGenAI } from "@google/genai";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  ShieldX,
  Calendar,
  GitBranch,
  Plus,
  Target,
  FileText,
  Unlink,
  Link as LinkIcon,
  Search,
  MessageSquare,
  User,
  Edit2,
} from "lucide-react";

const TaskListView = ({
  title,
  tasks,
  projects,
  decisions = [],
  onStatusChange,
  onUpdateBlocker,
  onAddDependency,
  onRemoveDependency,
  onAddTask,
  fixedProjectId,
}) => {
  const [activePerspective, setActivePerspective] = useState("All");
  const [taskSearch, setTaskSearch] = useState("");
  const [inspectedTaskId, setInspectedTaskId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [aiAdvice, setAiAdvice] = useState({});
  const [loadingAi, setLoadingAi] = useState(null);

  const [editingBlockerId, setEditingBlockerId] = useState(null);
  const [blockerForm, setBlockerForm] = useState({
    reason: "",
    owner: "",
    eta: "",
  });

  const [selectedDepToAdd, setSelectedDepToAdd] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    assignee: "",
    projectId: fixedProjectId || (projects.length > 0 ? projects[0].id : ""),
    dueDate: new Date().toISOString().split("T")[0],
    status: "Todo",
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "Done":
        return <CheckCircle2 className="text-emerald-500" size={20} />;
      case "Todo":
        return <Circle className="text-slate-300" size={20} />;
      case "In Progress":
        return <Circle className="text-indigo-500 fill-indigo-50" size={20} />;
      case "Blocked":
        return <ShieldX className="text-rose-500" size={20} />;
      case "At Risk":
        return <AlertTriangle className="text-amber-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Done":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Todo":
        return "bg-slate-50 text-slate-600 border-slate-100";
      case "In Progress":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Blocked":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "At Risk":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "";
    }
  };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    const today = new Date().toISOString().split("T")[0];

    if (taskSearch) {
      const q = taskSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q)
      );
    }

    if (activePerspective === "Active")
      result = result.filter((t) => t.status !== "Done");
    else if (activePerspective === "Blocked")
      result = result.filter((t) => t.status === "Blocked");
    else if (activePerspective === "Overdue")
      result = result.filter((t) => t.dueDate < today && t.status !== "Done");

    if (fixedProjectId)
      result = result.filter((t) => t.projectId === fixedProjectId);

    return result.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [tasks, taskSearch, activePerspective, fixedProjectId]);

  const handleGetAiAdvice = async (task) => {
    if (!task.blockerDetails?.reason) return;
    setLoadingAi(task.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Project Context: A task titled "${task.title}" is currently blocked. Reported Blocker: "${task.blockerDetails.reason}". As a Senior PM, suggest 3 highly practical mitigation steps to unblock this or reduce impact.`,
      });
      setAiAdvice((prev) => ({
        ...prev,
        [task.id]: response.text || "Advice unavailable.",
      }));
    } catch (e) {
      setAiAdvice((prev) => ({
        ...prev,
        [task.id]: "AI strategy engine offline.",
      }));
    } finally {
      setLoadingAi(null);
    }
  };

  const startEditingBlocker = (task) => {
    setBlockerForm(task.blockerDetails || { reason: "", owner: "", eta: "" });
    setEditingBlockerId(task.id);
    setInspectedTaskId(task.id);
  };

  const saveBlocker = (taskId) => {
    if (onUpdateBlocker) {
      onUpdateBlocker(taskId, blockerForm);
    }
    setEditingBlockerId(null);
  };

  const handleStatusChangeClick = (taskId, newStatus) => {
    if (newStatus === "Blocked") {
      const task = tasks.find((t) => t.id === taskId);
      if (task) startEditingBlocker(task);
    } else {
      onStatusChange(taskId, newStatus);
    }
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (onAddTask) {
      onAddTask({ ...formData, dependencies: [] });
      // Reset form state for next use
      setFormData({
        title: "",
        assignee: "",
        projectId:
          fixedProjectId || (projects.length > 0 ? projects[0].id : ""),
        dueDate: new Date().toISOString().split("T")[0],
        status: "Todo",
      });
      setShowAddModal(false);
    }
  };

  const handleLinkDependency = (taskId) => {
    if (selectedDepToAdd) {
      onAddDependency(taskId, selectedDepToAdd);
      setSelectedDepToAdd("");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-4 md:px-6 pt-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            Review and prioritize {filteredTasks.length} active items.
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
              placeholder="Filter tasks..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium text-sm transition-all"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200 w-full sm:w-auto">
            {["All", "Active", "Blocked", "Overdue"].map((p) => (
              <button
                key={p}
                onClick={() => setActivePerspective(p)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest ${
                  activePerspective === p
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm mx-4 md:mx-6 mb-12 overflow-hidden">
        <div className="overflow-x-auto scroll-smooth">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Objective
                </th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Health
                </th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Owner
                </th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Due Date
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Dependency
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => {
                const isInspected = inspectedTaskId === task.id;
                const isEditingBlocker = editingBlockerId === task.id;

                // Tasks that could potentially be dependencies
                const availableDeps = tasks.filter(
                  (t) =>
                    t.id !== task.id &&
                    t.projectId === task.projectId &&
                    !task.dependencies.includes(t.id)
                );

                return (
                  <React.Fragment key={task.id}>
                    <tr
                      className={`group transition-all ${
                        isInspected ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                      } ${task.status === "Blocked" ? "bg-rose-50/20" : ""}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              handleStatusChangeClick(
                                task.id,
                                task.status === "Done" ? "Todo" : "Done"
                              )
                            }
                            className="shrink-0 transition-transform hover:scale-110"
                          >
                            {getStatusIcon(task.status)}
                          </button>
                          <div className="min-w-0">
                            <p
                              className={`font-bold text-slate-900 text-sm truncate ${
                                task.status === "Done"
                                  ? "line-through opacity-30"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            <p className="text-[9px] text-slate-400 font-black uppercase mt-0.5">
                              {
                                projects.find((p) => p.id === task.projectId)
                                  ?.name
                              }
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChangeClick(task.id, e.target.value)
                          }
                          className={`text-[9px] font-black px-3 py-1.5 rounded-lg border-2 outline-none cursor-pointer uppercase tracking-widest shadow-sm ${getStatusStyles(
                            task.status
                          )}`}
                        >
                          <option value="Todo">TODO</option>
                          <option value="In Progress">ACTIVE</option>
                          <option value="At Risk">RISKY</option>
                          <option value="Blocked">BLOCKED</option>
                          <option value="Done">DONE</option>
                        </select>
                      </td>
                      <td className="px-6 py-6 text-xs font-bold text-slate-600 truncate max-w-[150px]">
                        {task.assignee}
                      </td>
                      <td className="px-6 py-6 text-xs font-black text-slate-400 flex items-center gap-2">
                        <Calendar size={14} className="shrink-0" />{" "}
                        {task.dueDate}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() =>
                            setInspectedTaskId(isInspected ? null : task.id)
                          }
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            isInspected
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-white border-slate-100 text-slate-400 hover:border-indigo-100 hover:text-indigo-600"
                          }`}
                        >
                          <GitBranch size={16} /> {task.dependencies.length}{" "}
                          Linked
                        </button>
                      </td>
                    </tr>
                    {isInspected && (
                      <tr className="bg-slate-50 animate-in slide-in-from-top-2 duration-300 border-x border-slate-100">
                        <td colSpan={5} className="p-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Target size={16} className="text-indigo-600" />{" "}
                                Prerequisites
                              </h4>

                              {/* Add Dependency Control */}
                              <div className="flex gap-2 mb-4">
                                <select
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                                  value={selectedDepToAdd}
                                  onChange={(e) =>
                                    setSelectedDepToAdd(e.target.value)
                                  }
                                >
                                  <option value="">Link Prerequisite...</option>
                                  {availableDeps.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.title}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleLinkDependency(task.id)}
                                  disabled={!selectedDepToAdd}
                                  className="p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-30 transition-opacity"
                                >
                                  <LinkIcon size={16} />
                                </button>
                              </div>

                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {task.dependencies.length > 0 ? (
                                  task.dependencies.map((depId) => {
                                    const depTask = tasks.find(
                                      (t) => t.id === depId
                                    );
                                    return (
                                      <div
                                        key={depId}
                                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          {depTask &&
                                            getStatusIcon(depTask.status)}
                                          <span className="text-xs font-bold text-slate-700 truncate">
                                            {depTask?.title}
                                          </span>
                                        </div>
                                        <button
                                          onClick={() =>
                                            onRemoveDependency(task.id, depId)
                                          }
                                          className="text-slate-300 hover:text-rose-500 shrink-0 ml-2"
                                        >
                                          <Unlink size={14} />
                                        </button>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-xs text-slate-400 italic">
                                    No dependencies linked.
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <ShieldX
                                    size={16}
                                    className="text-rose-500"
                                  />{" "}
                                  Risk Mitigation
                                </h4>
                                {task.status === "Blocked" &&
                                  !isEditingBlocker && (
                                    <button
                                      onClick={() => startEditingBlocker(task)}
                                      className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1 hover:underline"
                                    >
                                      <Edit2 size={10} /> Edit
                                    </button>
                                  )}
                              </div>

                              {isEditingBlocker ? (
                                <div className="bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-xl space-y-4 animate-in zoom-in-95">
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                      <MessageSquare size={10} /> Root Cause
                                    </label>
                                    <textarea
                                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500 h-20"
                                      placeholder="Why is this objective stalled?"
                                      value={blockerForm.reason}
                                      onChange={(e) =>
                                        setBlockerForm({
                                          ...blockerForm,
                                          reason: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <User size={10} /> Owner
                                      </label>
                                      <input
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500"
                                        placeholder="Point of contact"
                                        value={blockerForm.owner}
                                        onChange={(e) =>
                                          setBlockerForm({
                                            ...blockerForm,
                                            owner: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Calendar size={10} /> ETA
                                      </label>
                                      <input
                                        type="date"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-500"
                                        value={blockerForm.eta}
                                        onChange={(e) =>
                                          setBlockerForm({
                                            ...blockerForm,
                                            eta: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => saveBlocker(task.id)}
                                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
                                    >
                                      Save Details
                                    </button>
                                    <button
                                      onClick={() => setEditingBlockerId(null)}
                                      className="py-3 px-4 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : task.status === "Blocked" ? (
                                <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                      Root Cause
                                    </p>
                                    <p className="text-xs font-bold text-rose-800 italic">
                                      "
                                      {task.blockerDetails?.reason ||
                                        "Documentation pending..."}
                                      "
                                    </p>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 border-t border-slate-50 pt-3">
                                    <span>
                                      {task.blockerDetails?.owner ||
                                        "Unassigned"}
                                    </span>
                                    <span>
                                      ETA: {task.blockerDetails?.eta || "TBD"}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleGetAiAdvice(task)}
                                    disabled={loadingAi === task.id}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 mt-2"
                                  >
                                    {loadingAi === task.id
                                      ? "Analyzing..."
                                      : "Mitigation Strategy"}
                                  </button>
                                  {aiAdvice[task.id] && (
                                    <p className="text-[11px] text-indigo-700 bg-indigo-50 p-3 rounded-lg leading-relaxed border border-indigo-100">
                                      {aiAdvice[task.id]}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">
                                  No active blocks identified.
                                </p>
                              )}
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText
                                  size={16}
                                  className="text-slate-600"
                                />{" "}
                                Audit Trail
                              </h4>
                              <div className="space-y-2">
                                {decisions
                                  .filter((d) =>
                                    d.impactedTaskIds.includes(task.id)
                                  )
                                  .map((d) => (
                                    <div
                                      key={d.id}
                                      className="p-3 bg-white rounded-xl border border-slate-100 text-[11px] font-medium text-slate-500 italic shadow-sm"
                                    >
                                      "{d.description}"
                                    </div>
                                  ))}
                                {decisions.filter((d) =>
                                  d.impactedTaskIds.includes(task.id)
                                ).length === 0 && (
                                  <p className="text-xs text-slate-400 italic">
                                    No related decisions logged.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black mb-8 text-slate-900">
              Initiate New Task
            </h2>
            <form onSubmit={handleTaskSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Objective Title
                </label>
                <input
                  required
                  placeholder="Define the task..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Assignee
                  </label>
                  <input
                    required
                    placeholder="Owner"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                    value={formData.assignee}
                    onChange={(e) =>
                      setFormData({ ...formData, assignee: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Deadline
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Project Alignment
                </label>
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm appearance-none"
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
              >
                Publish Objective
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskListView;
