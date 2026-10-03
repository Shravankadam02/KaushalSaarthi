const LABELS = {
  attendance_percentage: 'Attendance',
  previous_semester_gpa: 'Previous GPA',
  backlogs: 'Backlogs',
  internal_marks_percentage: 'Internal Marks',
  assignment_completion_rate: 'Assignment Completion',
  study_hours_per_week: 'Study Hours',
  failed_subjects: 'Failed Subjects',
  family_income: 'Family Income',
  distance_from_college_km: 'Commute Distance',
  fee_payment_delay: 'Fee Payment Delay',
  scholarship: 'Scholarship',
  extracurricular_participation: 'Extracurriculars',
  age: 'Age',
  gender: 'Gender',
};

export default function RiskFactorBar({ factorKey, value }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? '#DC2626' : pct >= 40 ? '#D97706' : '#059669';

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-slate-600">{LABELS[factorKey] || factorKey}</span>
        <span className="text-xs font-mono font-medium text-slate-500">{(value * 100).toFixed(1)} Impact</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}