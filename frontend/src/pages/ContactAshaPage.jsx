import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Heart,
  Baby,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  Phone,
  MapPin,
  Sparkles,
  Check,
  Building2,
  Calendar,
  Clock
} from "lucide-react";
import { Navbar } from "../components/landing/Navbar.jsx";
import { FooterSection } from "../components/landing/FooterSection.jsx";
import { useTranslation } from "../context/AuthContext.jsx";
import { api } from "../utils/api.js";

const DOCTORS_DATABASE = {
  "General Physician": {
    name: "Dr. Rajesh Patil",
    title: "Chief Medical Officer",
    qualifications: "MBBS, MD (General Medicine)",
    hospital: "Rampur Block Primary Health Centre",
    experience: "12 years experience",
    specialty: "General Physician",
    languages: "Hindi, Marathi, English",
    available: true,
    consultationsToday: 18,
    avatarColor: "bg-blue-600",
    badge: "Government Medical Officer"
  },
  "Gynecologist/Obstetrician": {
    name: "Dr. Kavita Deshmukh",
    title: "Senior OB-GYN & Maternal Health Lead",
    qualifications: "MBBS, MS (Obstetrics & Gynecology)",
    hospital: "District Women's Hospital, Pune",
    experience: "15 years experience",
    specialty: "Gynecologist/Obstetrician",
    languages: "Marathi, Hindi, English",
    available: true,
    consultationsToday: 24,
    avatarColor: "bg-teal-600",
    badge: "Maternal Care Specialist"
  },
  "Pediatrician": {
    name: "Dr. Arun Mehta",
    title: "Child Health & Neonatology Consultant",
    qualifications: "MBBS, MD (Pediatrics), DCH",
    hospital: "Sub-District Hospital, Baramati",
    experience: "10 years experience",
    specialty: "Pediatrician",
    languages: "Hindi, English",
    available: true,
    consultationsToday: 15,
    avatarColor: "bg-indigo-600",
    badge: "Child Health Specialist"
  },
  "Dermatologist": {
    name: "Dr. Priya Kulkarni",
    title: "Consultant Dermatologist & Leprosy Officer",
    qualifications: "MBBS, MD (Dermatology, Venereology & Leprosy)",
    hospital: "District Civil Hospital",
    experience: "8 years experience",
    specialty: "Dermatologist",
    languages: "Marathi, Hindi, English",
    available: false,
    consultationsToday: 21,
    avatarColor: "bg-amber-600",
    badge: "Skin & Allergy Specialist"
  },
  "Orthopedic Surgeon": {
    name: "Dr. Vikram Singh",
    title: "Orthopedic & Trauma Care Surgeon",
    qualifications: "MBBS, MS (Orthopedics), DNB",
    hospital: "District Emergency Trauma Centre",
    experience: "14 years experience",
    specialty: "Orthopedic Surgeon",
    languages: "Hindi, English",
    available: true,
    consultationsToday: 12,
    avatarColor: "bg-emerald-600",
    badge: "Bone & Joint Surgeon"
  }
};

const QUICK_TAGS = [
  { en: "High Fever & Chills", hi: "तेज बुखार और ठंड", mr: "तीव्र ताप आणि थंडी" },
  { en: "Pregnancy Vomiting / Cramps", hi: "गर्भावस्था में उल्टी / दर्द", mr: "गरोदरपणात उलट्या व पोटदुखी" },
  { en: "Child Severe Cough & Wheezing", hi: "बच्चे को तेज खांसी व सांस फूलना", mr: "बाळाला तीव्र खोकला व धाप" },
  { en: "Skin Red Rash & Itching", hi: "त्वचा पर लाल चकत्ते व खुजली", mr: "त्वचेवर लाल पुरळ व खाज" },
  { en: "Severe Joint / Knee Pain", hi: "जोड़ों या घुटनों में तेज दर्द", mr: "सांधेदुखी किंवा गुडघेदुखी" },
  { en: "Dizziness & Weakness", hi: "चक्कर आना और कमजोरी", mr: "चक्कर येणे व अशक्तपणा" }
];

export function ContactAshaPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Female",
    village: "Rampur Sub-Centre",
    phone: "",
    symptoms: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tokenNumber, setTokenNumber] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (tagText) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms ? `${prev.symptoms}, ${tagText}` : tagText
    }));
  };

  const handleAnalyze = async () => {
    if (!formData.symptoms.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.post("/symptom-analysis/analyze", {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        symptoms: formData.symptoms,
        language
      });

      if (res.data?.data) {
        setAnalysisResult(res.data.data);
        setStep(3);
      }
    } catch (err) {
      console.error("Analysis request error:", err);
      // Fallback
      setAnalysisResult({
        specialty: "General Physician",
        urgency: "Priority",
        explanation: "Based on the reported symptoms, an immediate medical consultation with our Primary Care Officer is advised.",
        recommendedAction: "Rest comfortably and keep drinking fluids."
      });
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestConsultation = () => {
    const randomToken = "SETU-" + Math.floor(100000 + Math.random() * 900000);
    setTokenNumber(randomToken);
    setShowSuccessModal(true);
  };

  const currentDoctor =
    (analysisResult?.specialty && DOCTORS_DATABASE[analysisResult.specialty]) ||
    DOCTORS_DATABASE["General Physician"];

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col font-sans text-slate-800 antialiased selection:bg-slate-200">
      <Navbar onNavigate={(path) => navigate(path)} />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 flex flex-col gap-8">
        {/* Page Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-slate-900" />
            <span>AI Rural Teleconsultation Rail</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black text-slate-900 tracking-tight leading-tight">
            {t("contactAshaHeader")}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            {t("contactAshaSub")}
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
          {[
            { num: 1, title: t("step1Title") },
            { num: 2, title: t("step2Title") },
            { num: 3, title: t("step3Title") }
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3 sm:p-4 rounded-2xl transition-all flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left ${
                step === s.num
                  ? "bg-white shadow-md text-slate-900 ring-2 ring-slate-900/10"
                  : step > s.num
                  ? "bg-white shadow-xs text-slate-800"
                  : "bg-slate-100/70 text-slate-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step === s.num
                    ? "bg-slate-900 text-white"
                    : step > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className="text-xs sm:text-sm font-bold truncate">{s.title}</span>
            </div>
          ))}
        </div>

        {/* ─── STEP 1: PATIENT INFORMATION ─── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-6 animate-fadeIn">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-slate-900">{t("step1Title")}</h3>
              <p className="text-xs text-slate-500">
                Please enter basic details so our doctor and ASHA worker can identify you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">{t("fullName")} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("fullNamePlaceholder")}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">{t("age")} *</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder={t("agePlaceholder")}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">{t("gender")}</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all cursor-pointer"
                >
                  <option value="Female">{t("genderFemale")}</option>
                  <option value="Male">{t("genderMale")}</option>
                  <option value="Other">{t("genderOther")}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">{t("contactNumber")}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder={t("contactPlaceholder")}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">{t("village")}</label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => handleInputChange("village", e.target.value)}
                  placeholder={t("villagePlaceholder")}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={!formData.name.trim() || !formData.age}
                onClick={() => setStep(2)}
                className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer border-none ${
                  formData.name.trim() && formData.age
                    ? "bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>{t("btnNext")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: SYMPTOM DESCRIPTION ─── */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-6 animate-fadeIn">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-slate-900">{t("step2Title")}</h3>
              <p className="text-xs text-slate-500">
                You can describe in Hindi, Marathi, or English. Be as detailed as possible.
              </p>
            </div>

            {/* Quick Symptom Helpers */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-600">{t("quickTagsLabel")}</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag, idx) => {
                  const tagText = tag[language] || tag.en;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddTag(tagText)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer border-none text-left"
                    >
                      + {tagText}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symptom Text Box */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">{t("symptomBoxLabel")} *</label>
              <textarea
                rows={5}
                value={formData.symptoms}
                onChange={(e) => handleInputChange("symptoms", e.target.value)}
                placeholder={t("symptomPlaceholder")}
                className="w-full p-4 bg-slate-50 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all leading-relaxed placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t("btnBack")}</span>
              </button>

              <button
                disabled={!formData.symptoms.trim() || isLoading}
                onClick={handleAnalyze}
                className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer border-none ${
                  formData.symptoms.trim() && !isLoading
                    ? "bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t("btnAnalyzing")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("btnAnalyze")}</span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: AI ASSESSMENT & DOCTOR CARD ─── */}
        {step === 3 && analysisResult && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* AI Diagnosis Strip */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {t("aiAssessmentTitle")}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      Evaluated for {formData.name}, {formData.age} yrs ({formData.gender})
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {t("urgencyLevel")}: {analysisResult.urgency || "Priority"}
                  </span>
                </div>
              </div>

              {/* Clinical Explanation */}
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-800 text-sm leading-relaxed">
                {analysisResult.explanation}
              </div>

              {analysisResult.recommendedAction && (
                <div className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                  <span className="font-bold text-slate-900 shrink-0">Immediate Guidance:</span>
                  <span>{analysisResult.recommendedAction}</span>
                </div>
              )}
            </div>

            {/* Recommended Specialist Doctor Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl ${currentDoctor.avatarColor} text-white flex items-center justify-center font-bold text-2xl shadow-sm`}
                  >
                    {currentDoctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {currentDoctor.specialty}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono font-bold text-slate-700">
                        {currentDoctor.badge}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {currentDoctor.name}
                    </h2>
                    <span className="text-xs text-slate-500">{currentDoctor.qualifications}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      currentDoctor.available ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-700">
                    {currentDoctor.available ? t("doctorAvailable") : t("doctorBusy")}
                  </span>
                </div>
              </div>

              {/* Hospital & Credentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="p-3 bg-slate-50 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Attached Facility
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{currentDoctor.hospital}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Clinical Experience
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{currentDoctor.experience}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Languages Spoken
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{currentDoctor.languages}</span>
                  </div>
                </div>
              </div>

              {/* Connect Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Symptoms</span>
                </button>

                <button
                  type="button"
                  onClick={handleRequestConsultation}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <Stethoscope className="w-4 h-4 text-teal-400" />
                  <span>{t("btnRequestConsult")}</span>
                </button>
              </div>
            </div>

            {/* Other Available Specialists in the District */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Other On-Call Specialists in Your District
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(DOCTORS_DATABASE)
                  .filter(([spec]) => spec !== currentDoctor.specialty)
                  .map(([spec, doc]) => (
                    <div
                      key={spec}
                      className="p-4 bg-slate-50 rounded-2xl flex flex-col justify-between gap-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          {spec}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{doc.name}</h4>
                        <span className="text-[11px] text-slate-500">{doc.qualifications}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Available for Referral</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── SUCCESS CONFIRMATION MODAL ─── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl flex flex-col items-center text-center gap-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {t("consultationSuccessTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t("consultationSuccessMsg", {
                  docName: currentDoctor.name,
                  ashaName: "Meera Jadhav"
                })}
              </p>
            </div>

            <div className="w-full p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                {t("tokenNumber")}
              </span>
              <span className="text-xl font-mono font-black text-slate-900 tracking-wider">
                {tokenNumber}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer border-none"
              >
                {t("btnReturnHome")}
              </button>
              <button
                onClick={() => navigate(`/call/${tokenNumber}`)}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer border-none"
              >
                Join Video Waiting Room
              </button>
            </div>
          </div>
        </div>
      )}

      <FooterSection onNavigate={(path) => navigate(path)} />
    </div>
  );
}
