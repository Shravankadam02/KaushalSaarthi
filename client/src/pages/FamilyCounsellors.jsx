import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function FamilyCounsellors() {
  const [counsellors, setCounsellors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [contact, setContact] = useState("call");
  const [time, setTime] = useState("Evening");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/families/me")
      .then(({ data }) =>
        api.get("/counsellors", {
          params: {
            district: data.family.district,
            language: data.family.preferredLanguage,
          },
        }),
      )
      .then(({ data }) => setCounsellors(data))
      .catch(() =>
        setStatus("Counsellor availability is temporarily unavailable."),
      )
      .finally(() => setLoading(false));
  }, []);

  const requestCall = async () => {
    setSubmitting(true);
    try {
      await api.post("/counsellors/request", {
        counsellorCode: selected.counsellorCode,
        preferredContact: contact,
        preferredTime: time,
        note,
      });
      setStatus("Your request is open. A counsellor will contact your family.");
      setSelected(null);
      setNote("");
    } catch (error) {
      setStatus(error.response?.data?.message || "Could not send the request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-6 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/family"
          className="mb-8 inline-flex items-center gap-2 font-bold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={18} /> Back to family space
        </Link>
        <header className="rounded-4xl bg-slate-900 p-7 text-white sm:p-10">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-500 p-3 text-slate-950">
              <HeartHandshake />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300">
                Human support
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight">
                Talk with a counsellor
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Choose a counsellor who covers your district and language. Your
                family decides how and when they should contact you.
              </p>
            </div>
          </div>
        </header>
        {status && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-800">
            <CheckCircle2 size={19} />
            {status}
          </div>
        )}
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-slate-500 sm:col-span-2">
              Finding counsellors near your family...
            </div>
          ) : counsellors.length ? (
            counsellors.map((counsellor) => (
              <article
                key={counsellor._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">
                      {counsellor.username}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-amber-700">
                      {counsellor.specialization || "Career counselling"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                    <HeartHandshake size={21} />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {counsellor.languages?.map((language) => (
                    <span
                      key={language}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                    >
                      {language}
                    </span>
                  ))}
                  {counsellor.districts?.map((district) => (
                    <span
                      key={district}
                      className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                    >
                      <MapPin size={12} />
                      {district}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setSelected(counsellor)}
                  className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 font-bold text-white hover:bg-slate-700"
                >
                  Request support <ArrowLeft className="rotate-180" size={17} />
                </button>
              </article>
            ))
          ) : (
            <div className="rounded-3xl bg-white p-10 text-center text-slate-600 sm:col-span-2">
              No matching counsellor is available yet. You can request support
              from the chat.
            </div>
          )}
        </section>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="text-2xl font-black">Request support</h2>
            <p className="mt-2 text-sm text-slate-500">
              Tell us how this counsellor should reach your family.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                ["call", Phone, "Call"],
                ["whatsapp", MessageCircle, "WhatsApp"],
                ["visit", MapPin, "Visit"],
              ].map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setContact(value)}
                  className={`rounded-xl border p-3 text-xs font-bold ${contact === value ? "border-amber-500 bg-amber-50 text-amber-900" : "border-slate-200 text-slate-600"}`}
                >
                  <Icon size={18} className="mx-auto mb-1" />
                  {label}
                </button>
              ))}
            </div>
            <label className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
              Preferred time
              <select
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-3"
              >
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
            </label>
            <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
              Optional note
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows="3"
                className="rounded-xl border border-slate-300 p-3 font-normal outline-none focus:border-amber-500"
                placeholder="What would you like help with?"
              />
            </label>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={requestCall}
                disabled={submitting}
                className="flex-1 rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-950 disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
