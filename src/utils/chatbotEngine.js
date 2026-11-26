import {
  formatCurrency,
  formatDate,
  formatTime12h,
  getLocalDateStr,
} from './formatters';

export const OWNER_SUGGESTED_PROMPTS = [
  'How many employees are present today?',
  'Show pending leave requests.',
  'Which department has the most employees?',
  "Summarize today's workforce.",
  'Who has not checked in today?',
  'Give me a workforce summary.',
];

export const EMPLOYEE_SUGGESTED_PROMPTS = [
  'How many leave days do I have?',
  'Show my attendance this month.',
  'What tasks are assigned to me?',
  'Summarize my performance.',
  'Show my latest payslip.',
  'How do I apply for leave?',
  'What are the upcoming holidays?',
];

export function generateChatbotReply(query, { role, data, currentEmployee }) {
  const q = query.trim().toLowerCase();
  const today = getLocalDateStr(0);

  if (!q) {
    return {
      text: 'Please type a question or pick one of the suggested prompts below.',
      followUps: role === 'owner' ? OWNER_SUGGESTED_PROMPTS.slice(0, 3) : EMPLOYEE_SUGGESTED_PROMPTS.slice(0, 3),
    };
  }

  if (role === 'owner') {
    const employees = data.employees || [];
    const todayAttendance = (data.attendance || []).filter((a) => a.date === today);
    const presentRecords = todayAttendance.filter(
      (a) => a.status === 'Present' || a.status === 'Late'
    );
    const lateRecords = todayAttendance.filter((a) => a.status === 'Late');
    const onLeaveRecords = todayAttendance.filter((a) => a.status === 'On Leave');
    const absentRecords = todayAttendance.filter((a) => a.status === 'Absent');

    const checkedInIds = new Set(todayAttendance.map((a) => a.employeeId));
    const notCheckedIn = employees.filter(
      (e) => e.status === 'Active' && !checkedInIds.has(e.id)
    );
    const pendingLeaves = (data.leaveRequests || []).filter((l) => l.status === 'Pending');

    // Department headcounts
    const deptCounts = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});
    const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

    // 1. Who has not checked in today?
    if (q.includes('not checked') || q.includes('missing') || q.includes('haven\'t checked')) {
      if (notCheckedIn.length === 0) {
        return {
          text: `All active employees have logged attendance or have a recorded status for today (${formatDate(today)}).`,
          links: [{ label: 'Open Attendance', path: '/admin/attendance' }],
          followUps: ['How many employees are present today?', 'Show pending leave requests.'],
        };
      }
      const names = notCheckedIn.map((e) => `• **${e.name}** (${e.department})`).join('\n');
      return {
        text: `**${notCheckedIn.length} active employee(s)** have not checked in yet today (${formatDate(today)}):\n${names}`,
        links: [{ label: 'View Attendance Logs', path: '/admin/attendance' }],
        followUps: ['How many employees are present today?', "Summarize today's workforce."],
      };
    }

    // 2. Present today / attendance
    if (q.includes('present') || q.includes('attendance')) {
      const rate = employees.length
        ? Math.round((presentRecords.length / employees.length) * 100)
        : 0;
      return {
        text: `Today's Attendance Snapshot (${formatDate(today)}):\n• **Present:** ${presentRecords.length} employees (${lateRecords.length} late)\n• **On Leave:** ${onLeaveRecords.length}\n• **Absent:** ${absentRecords.length}\n• **Not Checked In Yet:** ${notCheckedIn.length}\n• **Attendance Rate:** ${rate}% of ${employees.length} total employees.`,
        links: [{ label: 'Manage Attendance', path: '/admin/attendance' }],
        followUps: ['Who has not checked in today?', 'Show pending leave requests.'],
      };
    }

    // 3. Pending leave requests
    if (q.includes('leave')) {
      if (pendingLeaves.length === 0) {
        return {
          text: 'There are currently **0 pending leave requests**. All leave applications have been reviewed.',
          links: [{ label: 'Open Leave Management', path: '/admin/leaves' }],
          followUps: ["Summarize today's workforce.", 'Which department has the most employees?'],
        };
      }
      const list = pendingLeaves
        .slice(0, 5)
        .map((lv) => {
          const emp = employees.find((e) => e.id === lv.employeeId);
          return `• **${emp ? emp.name : lv.employeeId}** — ${lv.leaveType} (${lv.days}d, ${formatDate(lv.startDate)})`;
        })
        .join('\n');
      return {
        text: `There are **${pendingLeaves.length} pending leave request(s)** awaiting review:\n${list}`,
        links: [{ label: 'Review Leave Requests', path: '/admin/leaves' }],
        followUps: ['How many employees are present today?', 'Give me a workforce summary.'],
      };
    }

    // 4. Department stats / most employees
    if (q.includes('department') || q.includes('most employees') || q.includes('team')) {
      const top = sortedDepts[0];
      const breakdown = sortedDepts
        .map(([dept, count]) => `• **${dept}:** ${count} employees`)
        .join('\n');
      return {
        text: `**${top?.[0] || 'Engineering'}** has the largest headcount with **${top?.[1] || 0} employees**.\n\nDepartment breakdown:\n${breakdown}`,
        links: [{ label: 'View Departments', path: '/admin/departments' }],
        followUps: ['Give me a workforce summary.', 'Show employee statistics.'],
      };
    }

    // 5. Payroll
    if (q.includes('payroll') || q.includes('salary') || q.includes('budget')) {
      const monthlyPayroll = employees.reduce((s, e) => s + Number(e.salary || 0), 0);
      const avgSalary = employees.length ? Math.round(monthlyPayroll / employees.length) : 0;
      return {
        text: `Monthly Payroll Overview:\n• **Total Monthly Gross Payroll:** ${formatCurrency(monthlyPayroll)}\n• **Average Salary:** ${formatCurrency(avgSalary)}/month\n• **Covered Employees:** ${employees.length}`,
        links: [{ label: 'Open Payroll', path: '/admin/payroll' }],
        followUps: ['Give me a workforce summary.', 'Which department has the most employees?'],
      };
    }

    // 6. Workforce summary / statistics
    if (
      q.includes('summary') ||
      q.includes('workforce') ||
      q.includes('statistic') ||
      q.includes('overview') ||
      q.includes('hello') ||
      q.includes('hi')
    ) {
      const activeCount = employees.filter((e) => e.status === 'Active').length;
      const monthlyPayroll = employees.reduce((s, e) => s + Number(e.salary || 0), 0);
      const activeProjects = (data.projects || []).filter((p) => p.status !== 'Completed').length;
      return {
        text: `WorkSphere Executive Summary:\n• **Total Workforce:** ${employees.length} employees (${activeCount} Active)\n• **Present Today:** ${presentRecords.length} | **Not Checked In:** ${notCheckedIn.length}\n• **Pending Leaves:** ${pendingLeaves.length} request(s)\n• **Active Projects:** ${activeProjects}\n• **Monthly Payroll:** ${formatCurrency(monthlyPayroll)}\n• **Largest Dept:** ${sortedDepts[0]?.[0]} (${sortedDepts[0]?.[1]})`,
        links: [
          { label: 'Smart Project Matcher', path: '/admin/matcher' },
          { label: 'Leave Approvals', path: '/admin/leaves' },
        ],
        followUps: ['Who has not checked in today?', 'Show pending leave requests.'],
      };
    }

    // 7. Holidays
    if (q.includes('holiday')) {
      const nextHols = (data.holidays || []).slice(0, 3);
      return {
        text: `Upcoming Company Holidays:\n${nextHols
          .map((h) => `• **${h.name}** — ${formatDate(h.date)} (${h.type})`)
          .join('\n')}`,
        followUps: ["Summarize today's workforce.", 'Show pending leave requests.'],
      };
    }

    return {
      text: `I'm the simulated WorkSphere Owner Assistant. I can help you inspect live workforce counts (${employees.length} employees), today's attendance (${presentRecords.length} present), pending leaves (${pendingLeaves.length}), department breakdowns, and payroll metrics.`,
      followUps: OWNER_SUGGESTED_PROMPTS.slice(0, 3),
    };
  }

  // ================= EMPLOYEE ROLE =================
  const emp = currentEmployee || data.employees?.[0];
  if (!emp) {
    return { text: 'Unable to locate your employee profile in the current demo session.' };
  }
  const firstName = emp.name.split(' ')[0];
  const myAttendance = (data.attendance || []).filter((a) => a.employeeId === emp.id);
  const todayAtt = myAttendance.find((a) => a.date === today);
  const myLeaves = (data.leaveRequests || []).filter((l) => l.employeeId === emp.id);
  const myTasks = (data.tasks || []).filter((t) => t.assigneeId === emp.id);
  const myReview = (data.performanceReviews || []).find((r) => r.employeeId === emp.id);
  const myPayslips = (data.payslips || [])
    .filter((p) => p.employeeId === emp.id)
    .sort((a, b) => b.month.localeCompare(a.month));

  // 1. How to apply for leave
  if (q.includes('how') && q.includes('leave')) {
    return {
      text: `To apply for leave:\n1. Open **My Leaves** from the left sidebar.\n2. Click **Apply for Leave**.\n3. Select Leave Type (*Casual*, *Sick*, or *Earned*), pick Start & End dates, add a brief reason, and submit.\nYour request appears immediately in the Owner's Leave Management panel.`,
      links: [{ label: 'Go to My Leaves', path: '/employee/leaves' }],
      followUps: ['How many leave days do I have?', 'What are the upcoming holidays?'],
    };
  }

  // 2. Remaining leave days
  if (q.includes('leave') || q.includes('vacation') || q.includes('pto')) {
    const lb = emp.leaveBalance || { casual: 0, sick: 0, earned: 0 };
    const total = lb.casual + lb.sick + lb.earned;
    const pending = myLeaves.filter((l) => l.status === 'Pending').length;
    return {
      text: `Hi ${firstName}, you have **${total} total leave days** remaining:\n• **Casual Leave:** ${lb.casual} days\n• **Sick Leave:** ${lb.sick} days\n• **Earned Leave:** ${lb.earned} days\n\nYou currently have **${pending} pending** leave request(s).`,
      links: [{ label: 'Open My Leaves', path: '/employee/leaves' }],
      followUps: ['How do I apply for leave?', 'What are the upcoming holidays?'],
    };
  }

  // 3. Attendance
  if (q.includes('attendance') || q.includes('check') || q.includes('hours')) {
    const presentDays = myAttendance.filter(
      (a) => a.status === 'Present' || a.status === 'Late'
    ).length;
    const lateDays = myAttendance.filter((a) => a.status === 'Late').length;
    const todayLine = todayAtt
      ? `Today (${formatDate(today)}): **${todayAtt.status}** — Check-in: ${formatTime12h(todayAtt.checkIn)}, Check-out: ${formatTime12h(todayAtt.checkOut)}`
      : `Today (${formatDate(today)}): You have **not checked in yet**.`;
    return {
      text: `${todayLine}\n\nRecent Attendance Summary:\n• **Days Worked (logged):** ${presentDays}\n• **Late Check-ins:** ${lateDays}`,
      links: [{ label: 'Open My Attendance', path: '/employee/attendance' }],
      followUps: ['What tasks are assigned to me?', 'How many leave days do I have?'],
    };
  }

  // 4. Tasks
  if (q.includes('task') || q.includes('project') || q.includes('work')) {
    const pendingTasks = myTasks.filter((t) => t.status !== 'Completed');
    const completedCount = myTasks.filter((t) => t.status === 'Completed').length;
    if (myTasks.length === 0) {
      return {
        text: `You have no tasks assigned right now, ${firstName}.`,
        links: [{ label: 'View My Tasks', path: '/employee/tasks' }],
      };
    }
    const taskLines = pendingTasks
      .slice(0, 4)
      .map((t) => `• **${t.title}** — *${t.status}* (${t.priority} priority, due ${formatDate(t.deadline)})`)
      .join('\n');
    return {
      text: `You have **${pendingTasks.length} active task(s)** (${completedCount} completed):\n${taskLines || 'All assigned tasks are completed!'}`,
      links: [{ label: 'Open My Tasks & Projects', path: '/employee/tasks' }],
      followUps: ['Summarize my performance.', 'Show my attendance this month.'],
    };
  }

  // 5. Performance
  if (q.includes('performance') || q.includes('review') || q.includes('goal') || q.includes('score')) {
    const score = myReview?.score ?? emp.performanceScore ?? 88;
    const goalsText = (myReview?.goals || [])
      .map((g) => `• ${g.title} (**${g.progress}%**)`)
      .join('\n');
    return {
      text: `Performance Summary (${myReview?.cycle || 'Q4 2026'}):\n• **Overall Score:** ${score}/100 (${myReview?.reviewStatus || 'Completed'})\n• **Manager Feedback:** "${myReview?.feedback || 'Consistent delivery and strong collaboration.'}"\n${goalsText ? `\n**Active Goals:**\n${goalsText}` : ''}`,
      links: [{ label: 'View My Performance', path: '/employee/performance' }],
      followUps: ['What tasks are assigned to me?', 'Show my latest payslip.'],
    };
  }

  // 6. Payslip / salary
  if (q.includes('payslip') || q.includes('salary') || q.includes('pay')) {
    const latest = myPayslips[0];
    if (!latest) {
      return {
        text: `Your monthly base compensation is **${formatCurrency(emp.salary)}**. No generated payslip records were found yet.`,
        links: [{ label: 'Open My Payslips', path: '/employee/payslips' }],
      };
    }
    return {
      text: `Latest Payslip (**${latest.month}**):\n• **Basic Salary:** ${formatCurrency(latest.basicSalary)}\n• **Allowances:** ${formatCurrency(latest.allowances)}\n• **Deductions:** -${formatCurrency(latest.deductions)}\n• **Net Pay:** **${formatCurrency(latest.netSalary)}** (${latest.status})`,
      links: [{ label: 'View & Print Payslip', path: '/employee/payslips' }],
      followUps: ['How many leave days do I have?', 'Summarize my performance.'],
    };
  }

  // 7. Holidays
  if (q.includes('holiday')) {
    const upcoming = (data.holidays || []).slice(0, 4);
    return {
      text: `Upcoming Company Holidays:\n${upcoming
        .map((h) => `• **${h.name}** — ${formatDate(h.date)} (${h.type})`)
        .join('\n')}`,
      followUps: ['How many leave days do I have?', 'How do I apply for leave?'],
    };
  }

  return {
    text: `Hi ${firstName}! I'm the simulated WorkSphere Assistant. Ask me about your **leave balance**, **attendance**, **assigned tasks**, **performance review**, **latest payslip**, or **upcoming holidays**.`,
    followUps: EMPLOYEE_SUGGESTED_PROMPTS.slice(0, 4),
  };
}
