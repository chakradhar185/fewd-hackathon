import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Columns3,
  Eye,
  Info,
  Sliders,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SKILL_OPTIONS } from '../../data/mockData';
import { rankEmployeesForProject } from '../../utils/matcher';
import {
  Avatar,
  EmptyState,
  Modal,
  PageHeader,
  ProgressBar,
  StatusBadge,
} from '../../components/UI';

const IMPORTANCE_LABELS = {
  1: 'Nice to Have',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Critical',
};

export default function ProjectMatcher() {
  const { data, assignEmployeeToProject, showToast } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState('Build a modern e-commerce web application');
  const [description, setDescription] = useState(
    'Design and build a fast, responsive e-commerce storefront with product discovery, cart/checkout APIs, and polished UI/UX.'
  );
  const [selectedSkills, setSelectedSkills] = useState([
    { name: 'React', weight: 5 },
    { name: 'JavaScript', weight: 5 },
    { name: 'API Development', weight: 4 },
    { name: 'UI/UX', weight: 3 },
  ]);
  const [minExperience, setMinExperience] = useState(3);
  const [department, setDepartment] = useState('All');
  const [duration, setDuration] = useState('8 weeks');
  const [appliedCriteria, setAppliedCriteria] = useState({
    selectedSkills: [
      { name: 'React', weight: 5 },
      { name: 'JavaScript', weight: 5 },
      { name: 'API Development', weight: 4 },
      { name: 'UI/UX', weight: 3 },
    ],
    minExperience: 3,
    department: 'All',
  });

  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleSkill = (skillName) => {
    setSelectedSkills((prev) => {
      const exists = prev.some((s) => s.name === skillName);
      if (exists) return prev.filter((s) => s.name !== skillName);
      return [...prev, { name: skillName, weight: 3 }];
    });
  };

  const updateSkillWeight = (skillName, weight) => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, weight: Number(weight) } : s))
    );
  };

  const handleFindMatches = (e) => {
    e.preventDefault();
    if (selectedSkills.length === 0) {
      showToast('Select at least one required skill to run matching.', 'error');
      return;
    }
    setAppliedCriteria({
      selectedSkills: [...selectedSkills],
      minExperience: Number(minExperience),
      department,
    });
    setCompareIds([]);
    showToast('Candidate match rankings updated');
  };

  const rankedMatches = useMemo(
    () => rankEmployeesForProject(data.employees, appliedCriteria),
    [data.employees, appliedCriteria]
  );

  const targetProject = useMemo(
    () =>
      data.projects.find(
        (p) => p.title.toLowerCase() === title.trim().toLowerCase()
      ),
    [data.projects, title]
  );

  const toggleCompare = (empId) => {
    setCompareIds((prev) => {
      if (prev.includes(empId)) return prev.filter((id) => id !== empId);
      if (prev.length >= 3) {
        showToast('You can compare up to 3 candidates side-by-side.', 'info');
        return prev;
      }
      return [...prev, empId];
    });
  };

  const comparedCandidates = useMemo(
    () => rankedMatches.filter((m) => compareIds.includes(m.employee.id)),
    [rankedMatches, compareIds]
  );

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Smart Employee–Project Matcher"
        subtitle="Rank employees by weighted skill alignment, experience fit, and workload availability"
        breadcrumbs={['Owner', 'Smart Project Matcher']}
        actions={
          compareIds.length >= 2 && (
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold shadow-sm"
            >
              <Columns3 className="h-4 w-4" />
              Compare Selected ({compareIds.length})
            </button>
          )
        }
      />

      {/* Transparent Algorithm Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200">
        <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Transparent Skill-Weighted Matching Algorithm:</span>{' '}
          Scores are computed deterministically in JavaScript from each employee&apos;s skill proficiencies (0–100), your assigned skill importance weights (1–5), and experience fit — no opaque scoring or external AI API inference.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Project Requirements Form */}
        <form
          onSubmit={handleFindMatches}
          className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-4 lg:sticky lg:top-24"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-600" />
              Project Requirements
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              {selectedSkills.length} skills selected
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Project Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold mb-1">Min Exp (Yrs)</label>
              <input
                type="number"
                min={0}
                max={15}
                step={0.5}
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value="All">All Teams</option>
                {data.departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option>4 weeks</option>
                <option>6 weeks</option>
                <option>8 weeks</option>
                <option>12 weeks</option>
                <option>6 months</option>
              </select>
            </div>
          </div>

          {/* Skill Selector */}
          <div>
            <label className="block text-xs font-semibold mb-2">
              Required Skills (click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_OPTIONS.map((sk) => {
                const active = selectedSkills.some((s) => s.name === sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    {sk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skill Weights */}
          {selectedSkills.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Skill Importance Weights
              </p>
              {selectedSkills.map((sk) => (
                <div key={sk.name} className="flex items-center gap-2.5 text-xs">
                  <span className="w-28 truncate font-semibold">{sk.name}</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={sk.weight}
                    onChange={(e) => updateSkillWeight(sk.name, e.target.value)}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="w-20 text-right text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                    {IMPORTANCE_LABELS[sk.weight]} ({sk.weight})
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Find Best Matches
          </button>
        </form>

        {/* Right: Ranked Results */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ranked Candidate Matches ({rankedMatches.length})
              </h3>
              <p className="text-xs text-slate-500">
                Project: <span className="font-semibold text-slate-700 dark:text-slate-300">{title}</span> • {duration}
              </p>
            </div>
            {compareIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCompareIds([])}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  disabled={compareIds.length < 2}
                  onClick={() => setCompareOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 disabled:opacity-40 text-white text-xs font-semibold"
                >
                  Compare ({compareIds.length}/3)
                </button>
              </div>
            )}
          </div>

          {rankedMatches.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No matching employees found"
              description="Try expanding your department filter or adjusting selected skills."
            />
          ) : (
            rankedMatches.map((match, idx) => {
              const { employee: emp } = match;
              const isAssigned = targetProject?.assignedEmployees?.includes(emp.id);
              const isCompared = compareIds.includes(emp.id);

              return (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(idx * 0.03, 0.2) }}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-card transition-all ${
                    idx === 0
                      ? 'border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {/* Card Top */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <Avatar name={emp.name} color={emp.avatarColor} size="lg" />
                        <span className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {emp.name}
                          </h4>
                          <StatusBadge status={match.suitabilityLabel} />
                          <StatusBadge status={match.availability} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {emp.designation} • {emp.department} • {emp.experience} yrs exp
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        {match.matchScore}%
                      </p>
                      <p className="text-[11px] text-slate-400">Weighted Match</p>
                    </div>
                  </div>

                  {/* Overall Match Progress Bar */}
                  <div className="mt-3">
                    <ProgressBar value={match.matchScore} color="auto" height="h-2.5" />
                  </div>

                  {/* Explanation */}
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    {match.explanation}
                  </p>

                  {/* Skill Breakdown Bars */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {match.breakdown.map((b) => (
                      <div key={b.skill} className="text-xs">
                        <div className="flex justify-between mb-0.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {b.skill}
                          </span>
                          <span
                            className={`font-semibold ${
                              b.proficiency >= 75
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : b.proficiency >= 55
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {b.proficiency}% match
                          </span>
                        </div>
                        <ProgressBar
                          value={b.proficiency}
                          color={b.proficiency >= 75 ? 'emerald' : b.proficiency >= 55 ? 'indigo' : 'amber'}
                          height="h-1.5"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Matched vs Gap Chips */}
                  <div className="mt-3.5 flex flex-wrap gap-2 text-[11px]">
                    {match.matchedSkills.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Matched: {match.matchedSkills.map((s) => s.skill).join(', ')}
                      </span>
                    )}
                    {match.skillGaps.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Gaps: {match.skillGaps.map((s) => s.skill).join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/employees/${emp.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCompare(emp.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                          isCompared
                            ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Columns3 className="h-3.5 w-3.5" />
                        {isCompared ? 'Selected for Compare' : 'Compare Candidates'}
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isAssigned}
                      onClick={() =>
                        assignEmployeeToProject({
                          projectId: targetProject?.id,
                          projectTitle: title,
                          projectDescription: description,
                          requiredSkills: selectedSkills.map((s) => s.name),
                          department,
                          duration,
                          employeeId: emp.id,
                        })
                      }
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        isAssigned
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {isAssigned ? 'Assigned to Project' : 'Assign to Project'}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Candidate Side-by-Side Comparison Modal */}
      <Modal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        title="Side-by-Side Candidate Comparison"
        subtitle={`Comparing ${comparedCandidates.length} shortlisted candidates for "${title}"`}
        maxWidth="max-w-4xl"
      >
        {comparedCandidates.length < 2 ? (
          <p className="text-xs text-slate-500">Select at least 2 candidates to compare.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-3 text-slate-400 uppercase tracking-wider text-[11px]">
                    Criteria
                  </th>
                  {comparedCandidates.map((c) => (
                    <th key={c.employee.id} className="py-3 px-4 min-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.employee.name} color={c.employee.avatarColor} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{c.employee.name}</p>
                          <p className="text-[11px] font-normal text-slate-500">
                            {c.employee.designation}
                          </p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-500">Match Score</td>
                  {comparedCandidates.map((c) => (
                    <td key={c.employee.id} className="py-3 px-4">
                      <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                        {c.matchScore}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-500">Experience</td>
                  {comparedCandidates.map((c) => (
                    <td key={c.employee.id} className="py-3 px-4 font-medium">
                      {c.employee.experience} years ({c.employee.department})
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-500">Current Workload</td>
                  {comparedCandidates.map((c) => (
                    <td key={c.employee.id} className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={c.availability} />
                        <span className="text-slate-500">{c.employee.workload}%</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-500">Skill Breakdown</td>
                  {comparedCandidates.map((c) => (
                    <td key={c.employee.id} className="py-3 px-4 space-y-1.5">
                      {c.breakdown.map((b) => (
                        <div key={b.skill} className="flex justify-between">
                          <span>{b.skill}</span>
                          <span className="font-semibold">{b.proficiency}%</span>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-500">Strengths</td>
                  {comparedCandidates.map((c) => (
                    <td key={c.employee.id} className="py-3 px-4 text-emerald-700 dark:text-emerald-300">
                      {c.matchedSkills.length
                        ? c.matchedSkills.map((s) => `${s.skill} (${s.proficiency}%)`).join(', ')
                        : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-500">Skill Gaps</td>
                  {comparedCandidates.map((c) => (
                    <td key={c.employee.id} className="py-3 px-4 text-amber-700 dark:text-amber-300">
                      {c.skillGaps.length
                        ? c.skillGaps.map((s) => `${s.skill} (${s.proficiency}%)`).join(', ')
                        : 'No major gaps'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-500">Action</td>
                  {comparedCandidates.map((c) => {
                    const assigned = targetProject?.assignedEmployees?.includes(c.employee.id);
                    return (
                      <td key={c.employee.id} className="py-3 px-4">
                        <button
                          type="button"
                          disabled={assigned}
                          onClick={() =>
                            assignEmployeeToProject({
                              projectId: targetProject?.id,
                              projectTitle: title,
                              projectDescription: description,
                              requiredSkills: selectedSkills.map((s) => s.name),
                              department,
                              duration,
                              employeeId: c.employee.id,
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 disabled:opacity-40 text-white font-semibold"
                        >
                          {assigned ? 'Assigned' : 'Assign to Project'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
