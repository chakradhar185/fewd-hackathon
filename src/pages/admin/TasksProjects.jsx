import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, FolderKanban, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SKILL_OPTIONS } from '../../data/mockData';
import { Avatar, Modal, PageHeader, StatusBadge } from '../../components/UI';
import { formatDate, getLocalDateStr } from '../../utils/formatters';

const COLUMNS = ['To Do', 'In Progress', 'Completed'];

export default function TasksProjects() {
  const { data, createProject, createTask, updateTaskStatus } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projectOpen, setProjectOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    department: 'Engineering',
    priority: 'High',
    deadline: getLocalDateStr(30),
    requiredSkills: ['React', 'JavaScript'],
    assignedEmployees: [],
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: data.projects[0]?.id || '',
    assigneeId: data.employees[1]?.id || data.employees[0]?.id || '',
    priority: 'Medium',
    deadline: getLocalDateStr(7),
  });

  useEffect(() => {
    if (searchParams.get('newProject') === '1') {
      setProjectOpen(true);
      setSearchParams({}, { replace: true });
    } else if (searchParams.get('newTask') === '1') {
      setTaskOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;
    createProject(projectForm);
    setProjectForm({
      title: '',
      description: '',
      department: 'Engineering',
      priority: 'High',
      deadline: getLocalDateStr(30),
      requiredSkills: ['React', 'JavaScript'],
      assignedEmployees: [],
    });
    setProjectOpen(false);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    createTask(taskForm);
    setTaskForm({
      title: '',
      description: '',
      projectId: data.projects[0]?.id || '',
      assigneeId: data.employees[1]?.id || '',
      priority: 'Medium',
      deadline: getLocalDateStr(7),
    });
    setTaskOpen(false);
  };

  const toggleProjectSkill = (sk) => {
    setProjectForm((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(sk)
        ? prev.requiredSkills.filter((s) => s !== sk)
        : [...prev.requiredSkills, sk],
    }));
  };

  const toggleProjectMember = (empId) => {
    setProjectForm((prev) => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.includes(empId)
        ? prev.assignedEmployees.filter((id) => id !== empId)
        : [...prev.assignedEmployees, empId],
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & Projects"
        subtitle="Manage active initiatives and drag-and-drop Kanban tasks across the organization"
        breadcrumbs={['Owner', 'Tasks & Projects']}
        actions={
          <>
            <button
              type="button"
              onClick={() => setProjectOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <FolderKanban className="h-4 w-4 text-indigo-600" />
              Create Project
            </button>
            <button
              type="button"
              onClick={() => setTaskOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Assign Task
            </button>
          </>
        }
      />

      {/* Active Projects Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.projects.map((proj) => {
          const members = data.employees.filter((e) => proj.assignedEmployees.includes(e.id));
          return (
            <div
              key={proj.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <StatusBadge status={proj.priority} />
                  <StatusBadge status={proj.status} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(proj.requiredSkills || []).slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {members.slice(0, 4).map((m) => (
                    <Avatar key={m.id} name={m.name} color={m.avatarColor} size="xs" />
                  ))}
                  {members.length === 0 && (
                    <span className="text-[11px] text-slate-400">Unassigned</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(proj.deadline)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {COLUMNS.map((col) => {
          const colTasks = data.tasks.filter((t) => t.status === col);
          return (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedTaskId) {
                  updateTaskStatus(draggedTaskId, col, 'Owner');
                  setDraggedTaskId(null);
                }
              }}
              className="bg-slate-100/80 dark:bg-slate-900/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 min-h-[380px]"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{col}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {colTasks.map((task) => {
                  const assignee = data.employees.find((e) => e.id === task.assigneeId);
                  const project = data.projects.find((p) => p.id === task.projectId);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggedTaskId(task.id)}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-sm cursor-grab active:cursor-grabbing space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                          {project?.title || 'General'}
                        </span>
                        <StatusBadge status={task.priority} />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Avatar
                            name={assignee?.name || task.assigneeId}
                            color={assignee?.avatarColor}
                            size="xs"
                          />
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            {assignee?.name?.split(' ')[0] || 'Unassigned'}
                          </span>
                        </div>
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value, 'Owner')}
                          className="text-[11px] px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      <Modal
        open={projectOpen}
        onClose={() => setProjectOpen(false)}
        title="Create New Project"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              placeholder="e.g., Customer Mobile App v2"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Department</label>
              <select
                value={projectForm.department}
                onChange={(e) => setProjectForm({ ...projectForm, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {data.departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Priority</label>
              <select
                value={projectForm.priority}
                onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Deadline</label>
              <input
                type="date"
                value={projectForm.deadline}
                onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Required Skills
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_OPTIONS.map((sk) => {
                const active = projectForm.requiredSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleProjectSkill(sk)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {sk}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">Assign Team Members</label>
            <div className="max-h-32 overflow-y-auto grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              {data.employees.map((e) => (
                <label key={e.id} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectForm.assignedEmployees.includes(e.id)}
                    onChange={() => toggleProjectMember(e.id)}
                  />
                  <span className="truncate">{e.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setProjectOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Task Modal */}
      <Modal open={taskOpen} onClose={() => setTaskOpen(false)} title="Assign New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g., Implement OAuth callback handler"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Project</label>
            <select
              value={taskForm.projectId}
              onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              {data.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Assignee</label>
              <select
                value={taskForm.assigneeId}
                onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {data.employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Deadline</label>
              <input
                type="date"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setTaskOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Assign Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
