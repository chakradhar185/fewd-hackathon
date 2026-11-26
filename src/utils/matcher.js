/**
 * Transparent skill-weighted algorithmic matching for WorkSphere.
 * Computes deterministic scores (0-100) from employee skill proficiencies,
 * selected skill importance weights, and experience requirements.
 */
export function rankEmployeesForProject(employees, criteria) {
  const {
    selectedSkills = [],
    minExperience = 0,
    department = 'All',
    onlyActive = false,
  } = criteria;

  if (!selectedSkills.length) return [];

  const totalWeight = selectedSkills.reduce((sum, s) => sum + (Number(s.weight) || 1), 0);

  const filtered = employees.filter((emp) => {
    if (onlyActive && emp.status !== 'Active') return false;
    if (department && department !== 'All' && emp.department !== department) return false;
    return true;
  });

  const scored = filtered.map((emp) => {
    const breakdown = selectedSkills.map((req) => {
      const proficiency = Number(emp.skills?.[req.name] ?? 0);
      const weight = Number(req.weight) || 1;
      return {
        skill: req.name,
        proficiency,
        weight,
        status: proficiency >= 75 ? 'Strong' : proficiency >= 55 ? 'Moderate' : 'Gap',
      };
    });

    const weightedSum = breakdown.reduce(
      (sum, item) => sum + item.proficiency * item.weight,
      0
    );
    const rawSkillScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Experience fit adjustment: slight penalty only when below requested years
    const expDiff = Number(emp.experience || 0) - Number(minExperience || 0);
    const expPenalty = expDiff < 0 ? Math.min(12, Math.abs(expDiff) * 3.5) : 0;
    const matchScore = Math.max(0, Math.min(100, Math.round(rawSkillScore - expPenalty)));

    const sortedByStrength = [...breakdown].sort((a, b) => b.proficiency - a.proficiency);
    const matchedSkills = sortedByStrength.filter((b) => b.proficiency >= 60);
    const skillGaps = [...breakdown]
      .filter((b) => b.proficiency < 65)
      .sort((a, b) => a.proficiency - b.proficiency);

    const topStrengths = sortedByStrength.slice(0, 2).filter((s) => s.proficiency > 0);
    const firstName = emp.name.split(' ')[0];

    let explanation = '';
    if (topStrengths.length >= 2) {
      explanation = `${firstName} is recommended because of strong ${topStrengths[0].skill} (${topStrengths[0].proficiency}%) and ${topStrengths[1].skill} (${topStrengths[1].proficiency}%) proficiency with ${emp.experience} yrs experience.`;
    } else if (topStrengths.length === 1) {
      explanation = `${firstName} shows capability in ${topStrengths[0].skill} (${topStrengths[0].proficiency}%) with ${emp.experience} yrs experience.`;
    } else {
      explanation = `${firstName} currently has minimal overlap with the selected technical skills.`;
    }

    if (skillGaps.length > 0) {
      explanation += ` ${skillGaps[0].skill} (${skillGaps[0].proficiency}%) is the primary skill gap.`;
    } else {
      explanation += ' Covers all requested skills above threshold.';
    }

    if (expDiff < 0) {
      explanation += ` Note: ${Math.abs(expDiff).toFixed(1)} yrs below target experience.`;
    }

    let availability = 'Available';
    if (emp.status === 'On Leave') {
      availability = 'On Leave';
    } else if (emp.workload >= 75) {
      availability = 'High Workload';
    } else if (emp.workload >= 55) {
      availability = 'Balanced';
    }

    let suitabilityLabel = 'Partial Fit';
    if (matchScore >= 82) suitabilityLabel = 'Top Match';
    else if (matchScore >= 68) suitabilityLabel = 'Strong Fit';
    else if (matchScore >= 50) suitabilityLabel = 'Moderate Fit';

    return {
      employee: emp,
      matchScore,
      breakdown,
      matchedSkills,
      skillGaps,
      topStrengths,
      explanation,
      availability,
      suitabilityLabel,
    };
  });

  return scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return (a.employee.workload || 0) - (b.employee.workload || 0);
  });
}
