import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { DB_NAME } from "./dbname.js";
import { User } from "../models/user.models.js";
import { Facility } from "../models/facility.models.js";
import { Patient } from "../models/patient.models.js";
import { Triage } from "../models/triage.models.js";
import { Consultation } from "../models/consultation.models.js";
import { Referral } from "../models/referral.models.js";
import { Record } from "../models/record.models.js";
import { Appointment } from "../models/appointment.models.js";
import { Diagnostic } from "../models/diagnostic.models.js";
import { Medicine } from "../models/medicine.models.js";
import { Followup } from "../models/followup.models.js";

async function seedDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log(`Connecting to MongoDB for seeding (${DB_NAME})...`);
    await mongoose.connect(`${uri}/${DB_NAME}`);
    console.log("Connected to MongoDB!");

    // Clear existing collections
    console.log("Clearing existing Setu collections...");
    await Promise.all([
      User.deleteMany({}),
      Facility.deleteMany({}),
      Patient.deleteMany({}),
      Triage.deleteMany({}),
      Consultation.deleteMany({}),
      Referral.deleteMany({}),
      Record.deleteMany({}),
      Appointment.deleteMany({}),
      Diagnostic.deleteMany({}),
      Medicine.deleteMany({}),
      Followup.deleteMany({}),
    ]);

    console.log("1. Seeding Facilities across rural care tiers...");
    const [subCentre, phc, districtHospital] = await Facility.create([
      {
        name: "Rampur Health Sub-Centre (Ayushman Arogya Mandir)",
        facilityCode: "SC-MH-PUN-042",
        tier: "sub-centre",
        location: { village: "Rampur", block: "Maval", district: "Pune", state: "Maharashtra", coordinates: { lat: 18.73, lng: 73.38 } },
        contactPhone: "+91 2114 284102",
        inChargeDoctor: "Meera Jadhav (ASHA Lead)",
        totalBeds: 2,
        availableBeds: 2,
        crowdLevel: "low",
        services: ["Primary Triage", "ANC Check-in", "Child Immunization", "ORS/Iron Distribution", "Teleconsult Relay"],
        equipmentStatus: [
          { name: "Digital BP Apparatus", status: "working" },
          { name: "Pulse Oximeter", status: "working" },
          { name: "Hemoglobinometer", status: "working" },
          { name: "Glucometer", status: "working" },
        ],
        ambulanceAvailable: false,
        teleconsultCapable: true,
      },
      {
        name: "Khandala Primary Health Centre (PHC)",
        facilityCode: "PHC-MH-PUN-018",
        tier: "phc",
        location: { village: "Khandala", block: "Maval", district: "Pune", state: "Maharashtra", coordinates: { lat: 18.75, lng: 73.40 } },
        contactPhone: "+91 2114 273001",
        inChargeDoctor: "Dr. Prakash Sharma, MBBS, DNB",
        totalBeds: 12,
        availableBeds: 5,
        crowdLevel: "moderate",
        services: ["24x7 Delivery Room", "General OPD", "Assisted Telemedicine", "Basic Lab Testing", "Government Pharmacy", "Immunization Hub"],
        equipmentStatus: [
          { name: "Semi-Auto Biochemistry Analyzer", status: "working" },
          { name: "Centrifuge Machine", status: "working" },
          { name: "Radiant Baby Warmer", status: "working" },
          { name: "Phototherapy Unit", status: "working" },
          { name: "ECG 3-Channel", status: "working" },
        ],
        ambulanceAvailable: true,
        teleconsultCapable: true,
      },
      {
        name: "Pune District General Hospital (DH Aundh)",
        facilityCode: "DH-MH-PUN-001",
        tier: "district-hospital",
        location: { village: "Aundh", block: "Haveli", district: "Pune", state: "Maharashtra", coordinates: { lat: 18.56, lng: 73.80 } },
        contactPhone: "+91 20 2729 4500",
        inChargeDoctor: "Dr. Arvind Kulkarni, MS, Civil Surgeon",
        totalBeds: 350,
        availableBeds: 42,
        crowdLevel: "high",
        services: ["Emergency Trauma", "Obstetrics & C-Section OT", "NICU / PICU", "Blood Bank", "Radiology / CT / X-Ray", "Cardiology", "TB Chest Clinic"],
        equipmentStatus: [
          { name: "16-Slice CT Scanner", status: "working" },
          { name: "Digital X-Ray 500mA", status: "working" },
          { name: "Automated Hematology 5-Part", status: "working" },
          { name: "Ultrasound Color Doppler", status: "working" },
          { name: "Ventilator Invasive ICU", status: "working" },
        ],
        ambulanceAvailable: true,
        teleconsultCapable: true,
      },
    ]);

    console.log("2. Seeding Staff Users with standard demo credentials...");
    const hashedPassword = await bcrypt.hash("setu123", 10);

    const [ashaMeera, drSharma, adminUser] = await User.create([
      {
        name: "Meera Jadhav",
        email: "meera.asha@setu.gov.in",
        password: hashedPassword,
        role: "asha",
        facility: subCentre._id,
        facilityName: subCentre.name,
        phone: "+91 98220 14829",
        village: "Rampur",
        district: "Pune",
        state: "Maharashtra",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        qualifications: "Accredited Social Health Activist (ASHA) - 8 yrs exp",
        languages: ["Marathi", "Hindi", "English"],
        incentivePoints: 1850,
        tasksCompletedThisMonth: 38,
      },
      {
        name: "Dr. Prakash Sharma",
        email: "dr.sharma@setu.gov.in",
        password: hashedPassword,
        role: "doctor",
        facility: phc._id,
        facilityName: phc.name,
        phone: "+91 98221 99014",
        village: "Khandala",
        district: "Pune",
        state: "Maharashtra",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
        qualifications: "MBBS, MD (Community Medicine) - Medical Officer",
        languages: ["English", "Hindi", "Marathi"],
        incentivePoints: 0,
        tasksCompletedThisMonth: 142,
      },
      {
        name: "Dr. Sunita Rao (District Health Admin)",
        email: "admin@setu.gov.in",
        password: hashedPassword,
        role: "admin",
        facility: districtHospital._id,
        facilityName: districtHospital.name,
        phone: "+91 98223 44091",
        village: "Pune HQ",
        district: "Pune",
        state: "Maharashtra",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
        qualifications: "District Health Officer (DHO) / Program Officer",
        languages: ["English", "Marathi", "Hindi"],
        incentivePoints: 0,
        tasksCompletedThisMonth: 0,
      },
    ]);

    console.log("3. Seeding Realistic Rural Patients...");
    const [patientSunita, patientRamesh, patientAarav, patientGovind, patientLaxmi] = await Patient.create([
      {
        name: "Sunita Devi",
        abhaId: "91-4829-1029-4821",
        age: 28,
        gender: "female",
        village: "Rampur",
        district: "Pune",
        phone: "+91 98214 77201",
        bloodGroup: "O+",
        conditions: ["ANC - 28th Week Gestation", "Moderate Nutritional Anemia (Hb: 8.8 g/dL)", "Previous LSCS (High-Risk Maternal)"],
        riskTier: "high",
        assignedAsha: ashaMeera._id,
        assignedFacility: subCentre._id,
        isPregnant: true,
        gestationalWeeks: 28,
        isHighRiskMaternal: true,
        emergencyContact: { name: "Suresh Devi (Husband)", phone: "+91 98214 77202", relation: "Husband" },
        vitalsLatest: {
          systolicBP: 134,
          diastolicBP: 86,
          spO2: 98,
          pulseRate: 82,
          temperature: 98.4,
          hemoglobin: 8.8,
          weightKg: 54,
          lastRecorded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      {
        name: "Ramesh Patil",
        abhaId: "91-3829-9182-5501",
        age: 55,
        gender: "male",
        village: "Khandala",
        district: "Pune",
        phone: "+91 94220 33819",
        bloodGroup: "B+",
        conditions: ["Essential Hypertension (Stage 2)", "Type 2 Diabetes Mellitus", "Missed 2 Monthly Drug Refills"],
        riskTier: "moderate",
        assignedAsha: ashaMeera._id,
        assignedFacility: phc._id,
        isPregnant: false,
        emergencyContact: { name: "Anand Patil (Son)", phone: "+91 94220 33820", relation: "Son" },
        vitalsLatest: {
          systolicBP: 158,
          diastolicBP: 98,
          spO2: 97,
          pulseRate: 78,
          temperature: 98.6,
          bloodSugar: 210,
          weightKg: 72,
          lastRecorded: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      },
      {
        name: "Aarav Jadhav (Infant)",
        abhaId: "91-7721-0029-1192",
        age: 1, // 8 months
        gender: "male",
        village: "Rampur",
        district: "Pune",
        phone: "+91 98220 14829",
        bloodGroup: "A+",
        conditions: ["Due for DPT-3 & OPV-3 Immunization", "Mild Stunting Monitor"],
        riskTier: "low",
        assignedAsha: ashaMeera._id,
        assignedFacility: subCentre._id,
        isPregnant: false,
        emergencyContact: { name: "Anita Jadhav (Mother)", phone: "+91 98220 14830", relation: "Mother" },
        vitalsLatest: {
          temperature: 98.2,
          spO2: 99,
          pulseRate: 110,
          weightKg: 7.8,
          lastRecorded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      {
        name: "Govind Thakur",
        abhaId: "91-1829-3382-7720",
        age: 42,
        gender: "male",
        village: "Maval",
        district: "Pune",
        phone: "+91 97650 88219",
        bloodGroup: "AB+",
        conditions: ["Chronic Productive Cough > 3 Weeks", "Low Grade Evening Fever", "Suspected Pulmonary Tuberculosis (DOTS Candidate)"],
        riskTier: "high",
        assignedAsha: ashaMeera._id,
        assignedFacility: phc._id,
        isPregnant: false,
        emergencyContact: { name: "Radha Thakur (Wife)", phone: "+91 97650 88220", relation: "Wife" },
        vitalsLatest: {
          systolicBP: 118,
          diastolicBP: 74,
          spO2: 95,
          pulseRate: 88,
          temperature: 99.8,
          weightKg: 51,
          lastRecorded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      },
      {
        name: "Laxmi Bai Shinde",
        abhaId: "91-6629-4412-8819",
        age: 62,
        gender: "female",
        village: "Shirur",
        district: "Pune",
        phone: "+91 91230 44901",
        bloodGroup: "O-",
        conditions: ["Bilateral Knee Osteoarthritis", "Post-Cataract Surgery Follow-up"],
        riskTier: "low",
        assignedAsha: ashaMeera._id,
        assignedFacility: phc._id,
        isPregnant: false,
        emergencyContact: { name: "Kisan Shinde (Brother)", phone: "+91 91230 44902", relation: "Brother" },
        vitalsLatest: {
          systolicBP: 126,
          diastolicBP: 80,
          spO2: 98,
          pulseRate: 72,
          temperature: 98.4,
          weightKg: 58,
          lastRecorded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      },
    ]);

    console.log("4. Seeding Longitudinal Health Records (FHIR)...");
    await Record.create([
      {
        patient: patientSunita._id,
        author: ashaMeera._id,
        facility: subCentre._id,
        type: "vitals",
        title: "2nd Trimester ANC Assessment & Anemia Screening",
        subtitle: "Conducted at Rampur Sub-Centre by ASHA Meera",
        summary: "Blood Pressure: 134/86 mmHg, Hb: 8.8 g/dL. Mild pedal edema noted. Issued 60 Iron-Folic Acid (IFA) tablets and scheduled USG Doppler referral.",
        fhirResource: {
          resourceType: "Observation",
          status: "final",
          code: { text: "Antenatal Care Visit" },
          valueQuantity: { value: 8.8, unit: "g/dL", code: "Hemoglobin" },
        },
        encounterDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        patient: patientSunita._id,
        author: drSharma._id,
        facility: phc._id,
        type: "prescription",
        title: "Medical Officer ANC Prescription & Calcium Regimen",
        subtitle: "Khandala PHC Telemedicine Hub",
        summary: "Tab. Ferrous Ascorbate 100mg + Folic Acid 1.5mg OD, Tab. Calcium Carbonate 500mg with Vit D3 OD. Advised high-protein dietary intake.",
        encounterDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        patient: patientRamesh._id,
        author: drSharma._id,
        facility: phc._id,
        type: "prescription",
        title: "Hypertension & Diabetes Titration Encounter",
        subtitle: "Khandala PHC OPD Consultation",
        summary: "BP elevated at 158/98 mmHg. Tab. Telmisartan 40mg + Amlodipine 5mg OD, Tab. Metformin 500mg BD. Counseled on salt restriction and daily walking.",
        encounterDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        patient: patientAarav._id,
        author: ashaMeera._id,
        facility: subCentre._id,
        type: "immunization",
        title: "National Immunization Schedule: Pentavalent-2 & Rota-2",
        subtitle: "Rampur Anganwadi Immunization Day",
        summary: "Batch #VAC-PENT-881. Given in left anterolateral thigh. No immediate adverse events. Due for Pentavalent-3 next month.",
        encounterDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log("5. Seeding Closed-Loop Referrals Across Kanban States...");
    await Referral.create([
      // 1. Issued (Sunita Devi -> District Hospital for High-Risk Obstetric USG)
      {
        referralCode: "SETU-REF-849102",
        patient: patientSunita._id,
        issuedBy: drSharma._id,
        fromFacility: phc._id,
        toFacility: districtHospital._id,
        reason: "Obstetric Color Doppler USG & High-Risk Anemia Consultation (Prev C-Section)",
        department: "Obstetrics & Gynecology (Specialist OPD)",
        urgency: "urgent",
        status: "issued",
        transportMode: "Public Bus",
        expectedArrivalTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: "issued",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            updatedBy: drSharma._id,
            updatedByName: "Dr. Prakash Sharma",
            note: "Referral ticket generated. ASHA Meera assigned to accompany patient.",
          },
        ],
      },
      // 2. Traveling (Govind Thakur -> Khandala PHC for Sputum GeneXpert TB Test)
      {
        referralCode: "SETU-REF-192044",
        patient: patientGovind._id,
        issuedBy: ashaMeera._id,
        fromFacility: subCentre._id,
        toFacility: phc._id,
        reason: "Suspected Pulmonary TB: Sputum CBNAAT / GeneXpert Molecular Test Required",
        department: "Pulmonology / TB Clinic",
        urgency: "urgent",
        status: "traveling",
        transportMode: "Auto / Shared Cab",
        expectedArrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: "issued",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            updatedBy: ashaMeera._id,
            updatedByName: "Meera Jadhav (ASHA)",
            note: "Patient flagged with >3 weeks cough. Sputum collection cup provided.",
          },
          {
            status: "traveling",
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            updatedBy: ashaMeera._id,
            updatedByName: "Meera Jadhav (ASHA)",
            note: "Patient boarded shared auto towards Khandala PHC.",
          },
        ],
      },
      // 3. Arrived (Ramesh Patil -> Khandala PHC for Hypertensive Crisis Evaluation)
      {
        referralCode: "SETU-REF-339108",
        patient: patientRamesh._id,
        issuedBy: ashaMeera._id,
        fromFacility: subCentre._id,
        toFacility: phc._id,
        reason: "Severe Uncontrolled Hypertension (BP: 168/104 mmHg) & Headache",
        department: "General Medicine OPD",
        urgency: "urgent",
        status: "arrived",
        transportMode: "Family Two-Wheeler",
        actualArrivalTime: new Date(Date.now() - 30 * 60 * 1000),
        statusHistory: [
          {
            status: "issued",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            updatedBy: ashaMeera._id,
            updatedByName: "Meera Jadhav (ASHA)",
            note: "Home visit detected acute spike in systolic BP.",
          },
          {
            status: "traveling",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            updatedBy: ashaMeera._id,
            updatedByName: "Meera Jadhav (ASHA)",
            note: "Son transporting patient via bike.",
          },
          {
            status: "arrived",
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            updatedBy: drSharma._id,
            updatedByName: "Khandala PHC Receptionist",
            note: "Patient checked-in at PHC triage desk. Token #12 assigned.",
          },
        ],
      },
      // 4. Seen / Closed Loop Feedback Completed (Laxmi Bai -> Post-Op Recovery Verification)
      {
        referralCode: "SETU-REF-918231",
        patient: patientLaxmi._id,
        issuedBy: ashaMeera._id,
        fromFacility: subCentre._id,
        toFacility: phc._id,
        reason: "Post-Cataract 4-Week Eye Examination & Vision Acuity Check",
        department: "Ophthalmology Clinic",
        urgency: "routine",
        status: "seen",
        transportMode: "Public Bus",
        actualArrivalTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        seenTime: new Date(Date.now() - 22 * 60 * 60 * 1000),
        clinicalOutcome: "Cornea clear, IOL in good position. Vision 6/9 corrected. Discharged with lubricating drops.",
        feedbackClosedLoop: true,
        referringAshaNotified: true,
        statusHistory: [
          { status: "issued", timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), updatedByName: "Meera Jadhav (ASHA)" },
          { status: "traveling", timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000), updatedByName: "Meera Jadhav (ASHA)" },
          { status: "arrived", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), updatedByName: "Khandala PHC Nurse" },
          { status: "seen", timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000), updatedByName: "Dr. Eye Surgeon", note: "Closed feedback loop sent to ASHA Meera." },
        ],
      },
    ]);

    console.log("6. Seeding Scheduled High-Risk Follow-ups (ASHA Worklist)...");
    await Followup.create([
      {
        patient: patientSunita._id,
        assignedAsha: ashaMeera._id,
        facility: subCentre._id,
        type: "ANC Visit",
        title: "3rd Trimester Kick-Count & Blood Pressure Verification",
        description: "Verify daily fetal movement record, check for pre-eclampsia edema, ensure IFA compliance.",
        dueDate: new Date(),
        isHighRisk: true,
        status: "pending",
        incentiveAmountInr: 250,
      },
      {
        patient: patientRamesh._id,
        assignedAsha: ashaMeera._id,
        facility: subCentre._id,
        type: "Hypertension / Diabetes",
        title: "Monthly Drug Refill & Fasting Blood Sugar Check",
        description: "Check glucometer fasting sugar and ensure Telmisartan medication compliance.",
        dueDate: new Date(),
        isHighRisk: false,
        status: "pending",
        incentiveAmountInr: 150,
      },
      {
        patient: patientAarav._id,
        assignedAsha: ashaMeera._id,
        facility: subCentre._id,
        type: "Child Immunization",
        title: "9-Month Measles-Rubella (MR-1) & Vit-A Dose 1",
        description: "Administer MR-1 vaccine and Vitamin A 1 Lakh IU syrup at Anganwadi.",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        isHighRisk: false,
        status: "pending",
        incentiveAmountInr: 150,
      },
      {
        patient: patientGovind._id,
        assignedAsha: ashaMeera._id,
        facility: subCentre._id,
        type: "TB DOTS Follow-up",
        title: "GeneXpert Result Verification & Contact Screening",
        description: "Review sputum GeneXpert lab outcome and screen household contacts for chronic cough.",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        isHighRisk: true,
        status: "pending",
        incentiveAmountInr: 300,
      },
    ]);

    console.log("7. Seeding Pharmacy Inventory & Stock-Out Alerts...");
    await Medicine.create([
      {
        facility: phc._id,
        name: "Tab. Ferrous Ascorbate + Folic Acid (IFA Red)",
        genericName: "Iron 100mg + Folic Acid 1.5mg",
        category: "Maternal / Iron-Folic",
        currentStock: 1200,
        minimumThreshold: 200,
        unit: "tablets",
        isStockOut: false,
      },
      {
        facility: phc._id,
        name: "Inj. Oxytocin 10 IU/ml",
        genericName: "Oxytocin Injection",
        category: "Emergency / Life-Saving",
        currentStock: 0, // Critical Stock Out for Maternal Care!
        minimumThreshold: 20,
        unit: "ampoules",
        isStockOut: true,
      },
      {
        facility: phc._id,
        name: "Tab. Telmisartan 40mg",
        genericName: "Telmisartan",
        category: "Antihypertensives",
        currentStock: 450,
        minimumThreshold: 50,
        unit: "tablets",
        isStockOut: false,
      },
      {
        facility: phc._id,
        name: "Tab. Metformin 500mg",
        genericName: "Metformin Hydrochloride",
        category: "Antidiabetic",
        currentStock: 300,
        minimumThreshold: 50,
        unit: "tablets",
        isStockOut: false,
      },
      {
        facility: subCentre._id,
        name: "ORS Sachet (WHO Formula 20.5g)",
        genericName: "Oral Rehydration Salts",
        category: "Pediatric / ORS",
        currentStock: 250,
        minimumThreshold: 30,
        unit: "sachets",
        isStockOut: false,
      },
      {
        facility: subCentre._id,
        name: "Zinc Sulfate Dispersible 20mg",
        genericName: "Zinc Sulfate",
        category: "Pediatric / ORS",
        currentStock: 8, // Stock Out
        minimumThreshold: 50,
        unit: "tablets",
        isStockOut: true,
      },
      {
        facility: districtHospital._id,
        name: "Inj. Magnesium Sulfate 50% (Eclampsia Kit)",
        genericName: "Magnesium Sulfate",
        category: "Emergency / Life-Saving",
        currentStock: 80,
        minimumThreshold: 15,
        unit: "vials",
        isStockOut: false,
      },
    ]);

    console.log("8. Seeding Diagnostic Test Catalog & Equipment Uptime...");
    await Diagnostic.create([
      {
        facility: phc._id,
        testName: "Complete Blood Count (CBC) with Hemoglobin",
        category: "Blood / Hematology",
        isAvailable: true,
        turnaroundHours: 3,
        equipmentStatus: "working",
        costInr: 0,
      },
      {
        facility: phc._id,
        testName: "CBNAAT / GeneXpert Molecular TB Sputum Assay",
        category: "Microbiology / TB",
        isAvailable: true,
        turnaroundHours: 4,
        equipmentStatus: "working",
        costInr: 0,
      },
      {
        facility: phc._id,
        testName: "ECG 12-Lead Rhythm Strip",
        category: "Cardiology / ECG",
        isAvailable: false, // Equipment broken demo
        turnaroundHours: 1,
        equipmentStatus: "broken",
        costInr: 0,
      },
      {
        facility: districtHospital._id,
        testName: "Obstetric Ultrasound Color Doppler (Fetal Well-being)",
        category: "Radiology / Imaging",
        isAvailable: true,
        turnaroundHours: 2,
        equipmentStatus: "working",
        costInr: 0,
      },
      {
        facility: districtHospital._id,
        testName: "Non-Contrast Head CT Scan",
        category: "Radiology / Imaging",
        isAvailable: true,
        turnaroundHours: 1,
        equipmentStatus: "working",
        costInr: 0,
      },
    ]);

    console.log("9. Seeding Virtual Queue Tokens & Appointments...");
    await Appointment.create([
      {
        patient: patientSunita._id,
        facility: phc._id,
        doctor: drSharma._id,
        department: "Antenatal Care Special Clinic",
        date: new Date(),
        slotTime: "10:30 AM - 10:45 AM",
        tokenNumber: 4,
        estimatedWaitMinutes: 12,
        type: "anc-checkup",
        status: "scheduled",
      },
      {
        patient: patientRamesh._id,
        facility: phc._id,
        doctor: drSharma._id,
        department: "NCD & Hypertension Clinic",
        date: new Date(),
        slotTime: "11:15 AM - 11:30 AM",
        tokenNumber: 12,
        estimatedWaitMinutes: 28,
        type: "in-person-opd",
        status: "checked-in",
      },
    ]);

    console.log("==================================================");
    console.log(" SETU DATABASE SEEDED SUCCESSFULLY! ");
    console.log(" 3 Facilities, 3 Demo Staff, 5 Realistic Patients");
    console.log(" Demo Staff Logins:");
    console.log("   - ASHA: meera.asha@setu.gov.in / setu123");
    console.log("   - Doctor: dr.sharma@setu.gov.in / setu123");
    console.log("   - Admin: admin@setu.gov.in / setu123");
    console.log("==================================================");

    process.exit(0);
  } catch (error) {
    console.error("SEEDING FAILED:", error);
    process.exit(1);
  }
}

seedDatabase();
