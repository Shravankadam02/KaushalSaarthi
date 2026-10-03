import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  Layers3,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";

const levels = [
  [
    "1",
    "Learn the basics",
    "Build safe, practical foundations with a trainer.",
  ],
  [
    "2",
    "Start skilled work",
    "Use your skill in an apprenticeship or first job.",
  ],
  [
    "3",
    "Grow into a specialist",
    "Take on harder work, better responsibility, and higher skill levels.",
  ],
  [
    "4",
    "Choose the next path",
    "Move toward supervision, a diploma, higher education, or your own business.",
  ],
];

export default function SkillLevels() {
  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-6 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/family"
          className="mb-8 inline-flex items-center gap-2 font-bold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={18} /> Back to family space
        </Link>
        <header className="rounded-4xl bg-slate-900 p-7 text-white sm:p-12">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-300">
            A simple explanation
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            How skill levels become a career.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            A skill course is not a dead end. It is a practical starting point
            that can lead to work, responsibility, study, or a business.
          </p>
        </header>
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {levels.map(([number, title, description]) => (
            <article
              key={number}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-lg font-black text-slate-950">
                  {number}
                </span>
                <div>
                  <h2 className="text-xl font-black">{title}</h2>
                  <p className="mt-2 leading-6 text-slate-500">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black">Where can it lead?</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              [BriefcaseBusiness, "Skilled job"],
              [GraduationCap, "Diploma"],
              [Layers3, "Supervisor"],
              [Store, "Own business"],
            ].map(([Icon, label]) => (
              <div
                key={label}
                className="rounded-2xl bg-slate-50 p-5 text-center"
              >
                <Icon className="mx-auto mb-3 text-amber-700" size={24} />
                <p className="font-black">{label}</p>
              </div>
            ))}
          </div>
        </section>
        <Link
          to="/explore-careers"
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 font-black text-slate-950 hover:bg-amber-400"
        >
          Explore skill careers <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  );
}
