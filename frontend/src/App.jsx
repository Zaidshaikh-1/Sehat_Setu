import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppLayout } from "./components/layout/AppLayout.jsx";

// Public Pages
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { PrivacyPage } from "./pages/PrivacyPage.jsx";
import { TermsPage } from "./pages/TermsPage.jsx";
import { JoinCallPage } from "./pages/JoinCallPage.jsx";
import { ContactAshaPage } from "./pages/ContactAshaPage.jsx";
import { QrScanPage } from "./pages/QrScanPage.jsx";

// Protected Console Pages
import { PatientListPage } from "./pages/PatientListPage.jsx";
import { PatientRecordPage } from "./pages/PatientRecordPage.jsx";
import { TriagePage } from "./pages/TriagePage.jsx";
import { ConsultationPage } from "./pages/ConsultationPage.jsx";
import { ReferralTrackerPage } from "./pages/ReferralTrackerPage.jsx";
import { AppointmentsPage } from "./pages/AppointmentsPage.jsx";
import { DiagnosticsPage } from "./pages/DiagnosticsPage.jsx";
import { MedicinePage } from "./pages/MedicinePage.jsx";
import { FollowUpPage } from "./pages/FollowUpPage.jsx";
import { EmergencyPage } from "./pages/EmergencyPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { BloodBankPage } from "./pages/BloodBankPage.jsx";
import { AmbulanceTrackingPage } from "./pages/AmbulanceTrackingPage.jsx";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing & Legal Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/contact-asha" element={<ContactAshaPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/call/:roomId" element={<JoinCallPage />} />
          <Route path="/scan/:referralId" element={<QrScanPage />} />

          {/* Protected Console Workspace */}
          <Route element={<AppLayout />}>
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/patient/:patientId" element={<PatientRecordPage />} />
            <Route path="/triage" element={<TriagePage />} />
            <Route path="/triage/:patientId" element={<TriagePage />} />
            <Route path="/consultation" element={<ConsultationPage />} />
            <Route path="/consultation/:patientId" element={<ConsultationPage />} />
            <Route path="/referrals" element={<ReferralTrackerPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/diagnostics" element={<DiagnosticsPage />} />
            <Route path="/medicine" element={<MedicinePage />} />
            <Route path="/followup" element={<FollowUpPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/blood-bank" element={<BloodBankPage />} />
            <Route path="/ambulance-tracking" element={<AmbulanceTrackingPage />} />
            <Route path="/ambulance-tracking/:sosCode" element={<AmbulanceTrackingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
