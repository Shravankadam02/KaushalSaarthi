import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, HeartHandshake, Save, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const districts = ['Nashik', 'Pune', 'Nagpur', 'Chhatrapati Sambhajinagar', 'Kolhapur', 'Jalgaon'];
const interestOptions = ['electrical', 'vehicles', 'computers', 'farming-tech', 'beauty', 'healthcare', 'construction'];

export default function FamilyProfile() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/families/me').then(({ data }) => setForm({ ...data.family, learnerInterests: data.family.learnerInterests || [] })).catch(() => setStatus('Unable to load your profile.')).finally(() => setLoading(false));
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const toggleInterest = (interest) => update('learnerInterests', form.learnerInterests.includes(interest) ? form.learnerInterests.filter((item) => item !== interest) : [...form.learnerInterests, interest]);
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      await api.put('/families/me', form);
      setStatus('Profile updated successfully.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-[#f6f1e8] p-10 text-center text-slate-500">Loading your profile...</main>;
  if (!form) return <main className="min-h-screen bg-[#f6f1e8] p-10 text-center text-rose-700">{status}</main>;

  return <main className="min-h-screen bg-[#f6f1e8] px-4 py-6 text-slate-900 sm:px-8"><div className="mx-auto max-w-4xl"><div className="flex items-center justify-between"><Link to="/family" className="inline-flex items-center gap-2 font-bold text-slate-600 hover:text-slate-950"><ArrowLeft size={18} /> Back to family space</Link><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950"><UserRound /></div></div><header className="py-10"><p className="text-sm font-black uppercase tracking-[0.16em] text-amber-800">Your context</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Family profile</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Keep this information up to date so counselling answers fit your family, learner, language, and district.</p></header>{status && <div className={`mb-5 flex items-center gap-3 rounded-2xl border p-4 font-semibold ${status.includes('successfully') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{status.includes('successfully') && <CheckCircle2 size={19} />}{status}</div>}<form onSubmit={save} className="space-y-6"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-100 p-2 text-amber-800"><HeartHandshake size={20} /></div><h2 className="text-2xl font-black">People and place</h2></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Learner name" value={form.learnerName} onChange={(value) => update('learnerName', value)} /><Field label="Parent name" value={form.parentName} onChange={(value) => update('parentName', value)} /><Field label="Phone number" value={form.phone} onChange={(value) => update('phone', value)} /><label className="grid gap-2 text-sm font-bold text-slate-700">District<select value={form.district} onChange={(event) => update('district', event.target.value)} className="min-h-13 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-amber-500">{districts.map((district) => <option key={district}>{district}</option>)}</select></label></div></section><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">Learner context</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold text-slate-700">Education<select value={form.learnerEducation || ''} onChange={(event) => update('learnerEducation', event.target.value)} className="min-h-13 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-amber-500"><option value="class8">Class 8</option><option value="class10">Class 10</option><option value="class12">Class 12</option><option value="dropout">Left school early</option><option value="graduate">Graduate</option></select></label><label className="grid gap-2 text-sm font-bold text-slate-700">Marks percentage <input type="number" min="0" max="100" value={form.learnerMarksPercent || ''} onChange={(event) => update('learnerMarksPercent', event.target.value ? Number(event.target.value) : undefined)} className="min-h-13 rounded-xl border border-slate-300 px-4 font-normal outline-none focus:border-amber-500" placeholder="Optional" /></label></div><p className="mt-6 text-sm font-bold text-slate-700">Interests</p><div className="mt-3 flex flex-wrap gap-2">{interestOptions.map((interest) => <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`rounded-full border px-4 py-2 text-sm font-bold capitalize ${form.learnerInterests.includes(interest) ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-600'}`}>{interest.replace('-', ' ')}</button>)}</div></section><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">Preferences and privacy</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold text-slate-700">Preferred language<select value={form.preferredLanguage || 'en'} onChange={(event) => update('preferredLanguage', event.target.value)} className="min-h-13 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-amber-500"><option value="en">English</option><option value="mr">Marathi</option><option value="hi">Hindi</option></select></label><label className="grid gap-2 text-sm font-bold text-slate-700">Area type<select value={form.areaType || ''} onChange={(event) => update('areaType', event.target.value)} className="min-h-13 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-amber-500"><option value="rural">Rural</option><option value="semiurban">Semiurban</option><option value="urban">Urban</option></select></label></div><label className="mt-6 flex gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" checked={Boolean(form.consentGiven)} onChange={(event) => update('consentGiven', event.target.checked)} className="mt-1 h-5 w-5 accent-amber-600" />I agree that this information can be used to personalise career guidance.</label></section><button type="submit" disabled={saving} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 font-black text-white hover:bg-slate-700 disabled:opacity-50"><Save size={18} />{saving ? 'Saving...' : 'Save profile'}</button></form></div></main>;
}

function Field({ label, value, onChange }) {
  return <label className="grid gap-2 text-sm font-bold text-slate-700">{label}<input required value={value || ''} onChange={(event) => onChange(event.target.value)} className="min-h-13 rounded-xl border border-slate-300 px-4 font-normal outline-none focus:border-amber-500" /></label>;
}
