import { useEffect, useState } from 'react';
import { FiUser, FiMail } from 'react-icons/fi';
import api from '../api/axios';

export default function MentorCard() {
  const [mentor, setMentor] = useState(undefined); // undefined = loading, null = none assigned

  useEffect(() => {
    api.get('/mentors/mine')
      .then((res) => setMentor(res.data.mentor))
      .catch(() => setMentor(null));
  }, []);

  if (mentor === undefined) {
    return <div className="bg-white rounded-xl border border-slate-200 p-5 h-24 animate-pulse" />;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500 mb-3">Your Mentor</p>
      {mentor ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <FiUser size={17} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{mentor.username.split('@')[0].replace('.', ' ')}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
              <FiMail size={11} /> {mentor.username}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">No mentor assigned yet — check back soon.</p>
      )}
    </div>
  );
}