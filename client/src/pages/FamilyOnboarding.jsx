import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HeartHandshake,
  Languages,
  MapPin,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const copy = {
  en: {
    title: "Start together",
    subtitle: "A simple first step for families exploring skill careers.",
    next: "Continue",
    back: "Back",
    finish: "Create family account",
    signIn: "Already have an account? Sign in",
    language: "Choose your language",
    users: "Who will use this?",
    location: "Where does your family live?",
    education: "What is the learner's education?",
    income: "Optional: household income",
    details: "A few details to finish",
    learner: "Learner",
    parent: "Parent",
    both: "Both together",
    area: "Area type",
    rural: "Rural",
    semiurban: "Town",
    urban: "City",
    phone: "Phone number",
    learnerName: "Learner name",
    parentName: "Parent name",
    username: "Email or username",
    password: "Password",
    consent:
      "I agree that this information can be used to personalise career guidance.",
    required: "Please complete the required fields.",
    languageNames: { en: "English", mr: "मराठी", hi: "हिंदी" },
    districts: [
      "Nashik",
      "Pune",
      "Nagpur",
      "Chhatrapati Sambhajinagar",
      "Kolhapur",
      "Jalgaon",
    ],
    educationOptions: {
      class8: "Class 8",
      class10: "Class 10",
      class12: "Class 12",
      dropout: "Left school early",
      graduate: "Graduate",
    },
    incomeOptions: {
      below_1L: "Below ₹1 lakh",
      "1_3L": "₹1–3 lakh",
      "3_6L": "₹3–6 lakh",
      above_6L: "Above ₹6 lakh",
    },
    error: "Registration failed. Please try again.",
  },
  mr: {
    title: "एकत्र सुरुवात करा",
    subtitle: "कौशल्याच्या करिअरसाठी कुटुंबाची सोपी पहिली पायरी.",
    next: "पुढे",
    back: "मागे",
    finish: "कुटुंबाचे खाते तयार करा",
    signIn: "आधीच खाते आहे? प्रवेश करा",
    language: "तुमची भाषा निवडा",
    users: "हे कोण वापरणार?",
    location: "तुमचे कुटुंब कुठे राहते?",
    education: "विद्यार्थ्याचे शिक्षण काय आहे?",
    income: "पर्यायी: कुटुंबाचे उत्पन्न",
    details: "खाते पूर्ण करण्यासाठी माहिती",
    learner: "विद्यार्थी",
    parent: "पालक",
    both: "दोघे मिळून",
    area: "ठिकाणाचा प्रकार",
    rural: "गाव",
    semiurban: "शहराजवळ",
    urban: "शहर",
    phone: "फोन नंबर",
    learnerName: "विद्यार्थ्याचे नाव",
    parentName: "पालकांचे नाव",
    username: "ईमेल किंवा युजरनेम",
    password: "पासवर्ड",
    consent:
      "करिअर मार्गदर्शन वैयक्तिक करण्यासाठी ही माहिती वापरण्यास माझी संमती आहे.",
    required: "कृपया आवश्यक माहिती भरा.",
    languageNames: { en: "English", mr: "मराठी", hi: "हिंदी" },
    districts: [
      "नाशिक",
      "पुणे",
      "नागपूर",
      "छत्रपती संभाजीनगर",
      "कोल्हापूर",
      "जळगाव",
    ],
    educationOptions: {
      class8: "इयत्ता ८",
      class10: "इयत्ता १०",
      class12: "इयत्ता १२",
      dropout: "शाळा लवकर सोडली",
      graduate: "पदवीधर",
    },
    incomeOptions: {
      below_1L: "१ लाखापेक्षा कमी",
      "1_3L": "१–३ लाख",
      "3_6L": "३–६ लाख",
      above_6L: "६ लाखांपेक्षा जास्त",
    },
    error: "नोंदणी अयशस्वी झाली. पुन्हा प्रयत्न करा.",
  },
  hi: {
    title: "साथ शुरू करें",
    subtitle: "कौशल करियर चुनने वाले परिवारों के लिए आसान पहला कदम।",
    next: "आगे",
    back: "पीछे",
    finish: "परिवार का खाता बनाएं",
    signIn: "पहले से खाता है? साइन इन करें",
    language: "अपनी भाषा चुनें",
    users: "इसे कौन इस्तेमाल करेगा?",
    location: "आपका परिवार कहाँ रहता है?",
    education: "शिक्षार्थी की शिक्षा क्या है?",
    income: "वैकल्पिक: परिवार की आय",
    details: "खाता पूरा करने के लिए जानकारी",
    learner: "शिक्षार्थी",
    parent: "माता-पिता",
    both: "दोनों साथ",
    area: "क्षेत्र का प्रकार",
    rural: "गाँव",
    semiurban: "कस्बा",
    urban: "शहर",
    phone: "फोन नंबर",
    learnerName: "शिक्षार्थी का नाम",
    parentName: "माता-पिता का नाम",
    username: "ईमेल या यूजरनेम",
    password: "पासवर्ड",
    consent:
      "मैं सहमत हूँ कि इस जानकारी का उपयोग व्यक्तिगत करियर मार्गदर्शन के लिए किया जा सकता है।",
    required: "कृपया जरूरी जानकारी भरें।",
    languageNames: { en: "English", mr: "मराठी", hi: "हिंदी" },
    districts: [
      "नासिक",
      "पुणे",
      "नागपुर",
      "छत्रपति संभाजीनगर",
      "कोल्हापुर",
      "जलगाँव",
    ],
    educationOptions: {
      class8: "कक्षा ८",
      class10: "कक्षा १०",
      class12: "कक्षा १२",
      dropout: "स्कूल जल्दी छोड़ा",
      graduate: "स्नातक",
    },
    incomeOptions: {
      below_1L: "₹१ लाख से कम",
      "1_3L": "₹१–३ लाख",
      "3_6L": "₹३–६ लाख",
      above_6L: "₹६ लाख से अधिक",
    },
    error: "पंजीकरण विफल हुआ। फिर कोशिश करें।",
  },
};

const initialForm = {
  preferredLanguage: "en",
  participation: "both",
  district: "",
  areaType: "",
  learnerEducation: "",
  incomeBracket: "",
  learnerName: "",
  parentName: "",
  phone: "",
  username: "",
  password: "",
  consentGiven: false,
};

export default function FamilyOnboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const text = copy[form.preferredLanguage];
  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const next = () => {
    setError("");
    if (step === 2 && (!form.district || !form.areaType))
      return setError(text.required);
    if (step === 3 && !form.learnerEducation) return setError(text.required);
    setStep((current) => Math.min(current + 1, 5));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (
      !form.learnerName ||
      !form.parentName ||
      !form.phone ||
      !form.username ||
      !form.password ||
      !form.consentGiven
    )
      return setError(text.required);
    setLoading(true);
    try {
      await register({ ...form, role: "family" });
      navigate("/family", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || text.error);
    } finally {
      setLoading(false);
    }
  };

  const cards = (field, values, labels) => (
    <div className="grid grid-cols-2 gap-3">
      {values.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => update(field, value)}
          className={`min-h-20 rounded-2xl border p-4 text-left font-semibold transition ${form[field] === value ? "border-amber-500 bg-amber-50 text-amber-950" : "border-slate-200 bg-white text-slate-700 hover:border-amber-300"}`}
        >
          {labels[value]}
        </button>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-6 text-slate-900 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col">
        <header className="flex items-center justify-between py-3">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-slate-900"
          >
            <HeartHandshake className="text-amber-700" /> KaushalSaarthi
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            {text.signIn}
          </Link>
        </header>
        <section className="my-auto rounded-4xl border border-white bg-white/80 p-6 shadow-xl shadow-slate-900/5 sm:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-700">
                {step + 1} / 6
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                {text.title}
              </h1>
              <p className="mt-2 max-w-xl text-slate-600">{text.subtitle}</p>
            </div>
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-800">
              <Languages />
            </div>
          </div>
          <div className="mb-8 flex gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <span
                key={index}
                className={`h-2 flex-1 rounded-full ${index <= step ? "bg-amber-500" : "bg-slate-200"}`}
              />
            ))}
          </div>
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              <AlertCircle size={17} />
              {error}
            </div>
          )}
          {step === 0 && (
            <div>
              <h2 className="mb-5 text-2xl font-bold">{text.language}</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {Object.entries(text.languageNames).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("preferredLanguage", value)}
                    className={`min-h-24 rounded-2xl border p-5 text-left text-lg font-bold transition ${form.preferredLanguage === value ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-300"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 className="mb-5 text-2xl font-bold">{text.users}</h2>
              {cards("participation", ["learner", "parent", "both"], {
                learner: text.learner,
                parent: text.parent,
                both: text.both,
              })}
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="mb-5 text-2xl font-bold">{text.location}</h2>
              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                {text.districts.map((district, index) => (
                  <button
                    key={district}
                    type="button"
                    onClick={() =>
                      update(
                        "district",
                        [
                          "Nashik",
                          "Pune",
                          "Nagpur",
                          "Chhatrapati Sambhajinagar",
                          "Kolhapur",
                          "Jalgaon",
                        ][index],
                      )
                    }
                    className={`rounded-2xl border p-4 text-left font-semibold ${form.district === ["Nashik", "Pune", "Nagpur", "Chhatrapati Sambhajinagar", "Kolhapur", "Jalgaon"][index] ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white"}`}
                  >
                    <MapPin className="mb-2 text-amber-700" size={20} />
                    {district}
                  </button>
                ))}
              </div>
              <p className="mb-3 font-bold">{text.area}</p>
              {cards("areaType", ["rural", "semiurban", "urban"], {
                rural: text.rural,
                semiurban: text.semiurban,
                urban: text.urban,
              })}
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="mb-5 text-2xl font-bold">{text.education}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(text.educationOptions).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("learnerEducation", value)}
                    className={`min-h-20 rounded-2xl border p-4 text-left font-semibold ${form.learnerEducation === value ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white"}`}
                  >
                    <GraduationCap className="mb-2 text-amber-700" size={20} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <h2 className="mb-5 text-2xl font-bold">{text.income}</h2>
              {cards(
                "incomeBracket",
                Object.keys(text.incomeOptions),
                text.incomeOptions,
              )}
            </div>
          )}
          {step === 5 && (
            <form
              id="family-onboarding"
              onSubmit={submit}
              className="grid gap-4 sm:grid-cols-2"
            >
              <h2 className="sm:col-span-2 text-2xl font-bold">
                {text.details}
              </h2>
              {[
                ["learnerName", text.learnerName],
                ["parentName", text.parentName],
                ["phone", text.phone],
                ["username", text.username],
                ["password", text.password],
              ].map(([field, label]) => (
                <label
                  key={field}
                  className="grid gap-2 text-sm font-bold text-slate-700"
                >
                  <span>{label}</span>
                  <input
                    required
                    value={form[field]}
                    type={field === "password" ? "password" : "text"}
                    onChange={(event) => update(field, event.target.value)}
                    className="min-h-14 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
              ))}
              <label className="sm:col-span-2 flex gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.consentGiven}
                  onChange={(event) =>
                    update("consentGiven", event.target.checked)
                  }
                  className="mt-1 h-5 w-5 accent-amber-600"
                />
                {text.consent}
              </label>
            </form>
          )}
          <div className="mt-8 flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
              className="flex min-h-14 items-center gap-2 rounded-xl px-4 font-bold text-slate-600 disabled:invisible"
            >
              <ArrowLeft size={18} />
              {text.back}
            </button>
            {step < 5 ? (
              <button
                type="button"
                onClick={next}
                className="flex min-h-14 items-center gap-2 rounded-xl bg-slate-900 px-6 font-bold text-white hover:bg-slate-700"
              >
                {text.next}
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                form="family-onboarding"
                disabled={loading}
                className="flex min-h-14 items-center gap-2 rounded-xl bg-amber-500 px-6 font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? "..." : text.finish}
                <Check size={18} />
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
