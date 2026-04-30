/**
 * seedProjects.js — Seeds the FoundersForge database with sample projects
 * including proper 512-dim embeddings for semantic search.
 *
 * Usage: node --env-file=.env scripts/seedProjects.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

// ─── Inline embedding (no external service needed) ───────────────────────────
const VECTOR_DIM = 512;

function generateEmbedding(text) {
  const vec = new Array(VECTOR_DIM).fill(0);
  if (!text) return vec;
  const words = text.toLowerCase().match(/\w+/g) || [];
  for (const word of words) {
    let hash = 2166136261;
    for (let i = 0; i < word.length; i++) {
      hash ^= word.charCodeAt(i);
      hash = (hash * 16777619) >>> 0;
    }
    vec[hash % VECTOR_DIM] += 1;
  }
  let norm = 0;
  for (let i = 0; i < VECTOR_DIM; i++) norm += vec[i] * vec[i];
  if (norm > 0) {
    const s = Math.sqrt(norm);
    for (let i = 0; i < VECTOR_DIM; i++) vec[i] /= s;
  }
  return vec;
}

function projectEmbeddingText(p) {
  const title = p.title || "";
  const tagline = p.tagline || "";
  const skills = (p.requiredSkills || []).join(" ");
  const roles = (p.rolesNeeded || []).join(" ");
  return [title, title, title, tagline, tagline, skills, skills, roles, p.summary || "", p.problem || ""].join(" ");
}

// ─── Sample Project Data ──────────────────────────────────────────────────────
const SAMPLE_PROJECTS = [
  {
    title: "BioMind — AI Bioinformatics Platform",
    tagline: "Accelerating drug discovery with genomic sequence AI analysis",
    summary: "BioMind is a cloud-based platform that applies machine learning to analyze genomic sequences, protein folding patterns, and clinical trial data to accelerate drug discovery pipelines.",
    problem: "Pharmaceutical researchers waste months manually analyzing genomic data and protein structures, slowing drug discovery by years.",
    solution: "BioMind uses transformer-based models fine-tuned on biological sequences to predict protein-drug interactions and flag promising compounds 10x faster.",
    targetAudience: "Biotech researchers, pharmaceutical companies, academic labs",
    revenueModel: "SaaS subscription for research institutions, per-analysis API pricing for companies",
    objectives: [
      "Build a genomic sequence ingestion pipeline",
      "Train a protein-drug interaction prediction model",
      "Launch beta with 5 research institutions",
      "Achieve 80% accuracy on benchmark datasets",
    ],
    requiredSkills: ["Python", "Machine Learning", "Bioinformatics", "PyTorch", "NumPy", "AWS", "Docker", "FastAPI", "React"],
    rolesNeeded: ["ML Engineer", "Bioinformatics Scientist", "Backend Developer", "Frontend Developer", "Research Partner"],
  },
  {
    title: "EcoTrack — Carbon Footprint Intelligence",
    tagline: "Real-time corporate carbon tracking with automated ESG reporting",
    summary: "EcoTrack integrates with enterprise systems to automatically measure, track, and reduce carbon footprints across supply chains, with AI-generated ESG compliance reports.",
    problem: "Companies struggle to accurately measure their carbon emissions across complex supply chains, leading to greenwashing and compliance failures.",
    solution: "EcoTrack connects to ERP and IoT systems to pull real-time emissions data and uses AI to generate audit-ready ESG reports.",
    targetAudience: "Mid to large enterprises, sustainability teams, ESG compliance officers",
    revenueModel: "Annual SaaS licensing, premium reporting add-ons",
    objectives: [
      "Integrate with SAP and Oracle ERP systems",
      "Build carbon calculation engine",
      "Create automated ESG PDF report generator",
      "Partner with 10 enterprise pilot customers",
    ],
    requiredSkills: ["Node.js", "React", "PostgreSQL", "Data Analytics", "ESG Reporting", "REST API", "Docker", "AWS"],
    rolesNeeded: ["Full-Stack Developer", "Data Engineer", "Sustainability Consultant", "Enterprise Sales"],
  },
  {
    title: "SkillBridge — Developer Mentorship Marketplace",
    tagline: "Connecting junior developers with senior mentors for real project experience",
    summary: "SkillBridge is a mentorship platform where junior developers get matched with senior engineers for paid 1:1 coaching, code reviews, and real project collaboration.",
    problem: "Junior developers graduate with theoretical knowledge but lack real project experience. Senior engineers have no monetized platform for structured mentorship.",
    solution: "AI matching pairs mentors and mentees based on tech stack, goals, and availability. Built-in session booking, code review tools, and project portfolio tracking.",
    targetAudience: "Junior developers, bootcamp graduates, senior engineers who want to teach",
    revenueModel: "15% commission on mentor session fees, premium mentor profiles",
    objectives: [
      "Build mentor-mentee matching algorithm",
      "Create video session integration",
      "Launch with 50 beta mentors",
      "Hit 500 sessions in month 1",
    ],
    requiredSkills: ["React", "Node.js", "MongoDB", "WebRTC", "Socket.IO", "Stripe API", "TypeScript"],
    rolesNeeded: ["Full-Stack Developer", "UX Designer", "Machine Learning Engineer", "Community Manager"],
  },
  {
    title: "MediChain — Decentralized Health Records",
    tagline: "Patient-owned medical records on blockchain with instant provider access",
    summary: "MediChain gives patients full ownership of their medical history using blockchain, allowing them to grant hospitals, clinics, and labs instant secure access without paperwork.",
    problem: "Patients' medical records are siloed across hospitals, leading to repeated tests, misdiagnoses, and emergency room errors.",
    solution: "MediChain creates an encrypted, patient-controlled health record on Ethereum with zero-knowledge proofs for privacy-preserving access grants.",
    targetAudience: "Patients, hospitals, clinics, insurance providers",
    revenueModel: "Subscription for healthcare providers, freemium for patients",
    objectives: [
      "Build smart contract for record ownership",
      "Integrate with HL7 FHIR standard",
      "Get 3 hospital pilot partnerships",
      "Complete HIPAA compliance audit",
    ],
    requiredSkills: ["Solidity", "Ethereum", "React", "Node.js", "IPFS", "Zero-Knowledge Proofs", "Healthcare IT", "AWS"],
    rolesNeeded: ["Blockchain Developer", "Healthcare IT Specialist", "Backend Engineer", "Legal Compliance", "UI Developer"],
  },
  {
    title: "AgriSense — Smart Farming IoT Dashboard",
    tagline: "AI-powered crop monitoring and yield prediction for smallholder farmers",
    summary: "AgriSense deploys affordable IoT sensors across farmland and uses satellite imagery with ML models to predict crop yields, detect diseases early, and optimize irrigation.",
    problem: "Smallholder farmers in developing regions lose 30-40% of crops to preventable diseases and poor irrigation due to lack of real-time field data.",
    solution: "Low-cost solar-powered IoT sensors + satellite data + ML models provide real-time alerts, disease detection, and yield forecasts via a simple mobile app.",
    targetAudience: "Smallholder farmers, agricultural cooperatives, government agriculture departments",
    revenueModel: "Hardware sensor kit sales, monthly data subscription, government contracts",
    objectives: [
      "Design and manufacture low-cost IoT sensor prototype",
      "Build ML crop disease detection model",
      "Launch pilot in 100 farms",
      "Partner with 2 NGOs for distribution",
    ],
    requiredSkills: ["IoT", "Python", "Machine Learning", "React Native", "PostgreSQL", "AWS", "Satellite Imagery", "Computer Vision"],
    rolesNeeded: ["IoT Hardware Engineer", "ML Engineer", "Mobile Developer", "Agronomist", "Field Operations Manager"],
  },
  {
    title: "LegalAI — Contract Analysis Copilot",
    tagline: "Review any legal contract in 60 seconds with AI-powered risk detection",
    summary: "LegalAI lets startups and SMEs upload contracts and get instant plain-English summaries, risk flags, missing clauses detection, and negotiation suggestions without a lawyer.",
    problem: "Startups and SMEs sign contracts they don't fully understand, leading to costly disputes. Hiring lawyers for routine contracts is prohibitively expensive.",
    solution: "GPT-powered contract analysis trained on 10M+ legal documents identifies risky clauses, unusual terms, and missing protections in seconds.",
    targetAudience: "Startups, SMEs, freelancers, HR teams",
    revenueModel: "Freemium: 3 free reviews/month, paid subscription for unlimited",
    objectives: [
      "Fine-tune LLM on legal contract corpus",
      "Build PDF/DOCX upload and parsing pipeline",
      "Launch beta with 200 startups",
      "Achieve NPS > 60",
    ],
    requiredSkills: ["Python", "LLM Fine-tuning", "NLP", "FastAPI", "React", "PostgreSQL", "PDF Parsing", "Legal Domain Knowledge"],
    rolesNeeded: ["ML Engineer", "Legal Advisor", "Frontend Developer", "Backend Developer", "Growth Marketer"],
  },
  {
    title: "EduForge — Personalized Learning Paths",
    tagline: "AI tutor that builds personalized curriculum from YouTube, docs, and books",
    summary: "EduForge aggregates free learning resources and uses AI to create personalized learning paths for any skill, tracking progress and adapting the path based on quiz performance.",
    problem: "Self-learners are overwhelmed by information overload. They don't know which resources to use in what order, leading to dropout.",
    solution: "EduForge builds a learning graph of topics and resources, then uses AI to create an optimized, personalized study path with spaced repetition and progress tracking.",
    targetAudience: "Self-learners, bootcamp students, corporate training departments",
    revenueModel: "Freemium, B2B licensing for corporate training, premium AI tutoring",
    objectives: [
      "Build content aggregation pipeline from YouTube/Docs",
      "Create knowledge graph of skills and topics",
      "Train adaptive learning recommendation model",
      "Launch with 1000 beta users",
    ],
    requiredSkills: ["Python", "React", "NLP", "Knowledge Graphs", "Recommendation Systems", "MongoDB", "FastAPI"],
    rolesNeeded: ["ML Engineer", "Full-Stack Developer", "Instructional Designer", "Product Manager"],
  },
  {
    title: "FinFlow — SME Cash Flow Intelligence",
    tagline: "AI-powered cash flow forecasting and invoice automation for small businesses",
    summary: "FinFlow connects to accounting software to analyze transaction patterns and predict cash flow problems 90 days in advance, while automating invoice follow-ups.",
    problem: "67% of SME failures are due to cash flow mismanagement. Business owners lack real-time financial visibility and spend hours chasing unpaid invoices.",
    solution: "Bank-grade financial intelligence for SMEs: automated invoice tracking, cash flow forecasting with ML, and one-click payment reminders via WhatsApp/Email.",
    targetAudience: "Small business owners, freelancers, finance managers at SMEs",
    revenueModel: "Monthly subscription tiers based on revenue size",
    objectives: [
      "Integrate with QuickBooks and Xero APIs",
      "Build cash flow prediction LSTM model",
      "Automate invoice reminder system",
      "Onboard 100 SME customers in 3 months",
    ],
    requiredSkills: ["Python", "React", "Node.js", "PostgreSQL", "Stripe API", "Accounting API Integration", "Time Series ML", "WhatsApp API"],
    rolesNeeded: ["Backend Developer", "ML Data Scientist", "Frontend Developer", "Financial Domain Expert", "Sales"],
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────
async function seed() {
  console.log("[Seed] Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || "foundersforge",
    serverSelectionTimeoutMS: 15000,
  });
  console.log("[Seed] Connected.");

  // Dynamically import models to avoid ESM issues
  const { default: Project } = await import("../src/models/Project.js");
  const { default: User } = await import("../src/models/User.js");
  const { default: ChatRoom } = await import("../src/models/ChatRoom.js");

  // Find or create a seed founder user
  let founder = await User.findOne({ email: "seed-founder@foundersforge.dev" });
  if (!founder) {
    console.log("[Seed] Creating seed founder user...");
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.default.hash("SeedPass123!", 10);
    founder = await User.create({
      fullName: "FoundersForge Seed",
      email: "seed-founder@foundersforge.dev",
      passwordHash: hash,
      role: "founder",
    });
    console.log(`[Seed] Created seed user: ${founder._id}`);
  } else {
    console.log(`[Seed] Using existing seed user: ${founder._id}`);
  }

  let created = 0;
  let skipped = 0;

  for (const data of SAMPLE_PROJECTS) {
    const existing = await Project.findOne({ title: data.title });
    if (existing) {
      console.log(`[Seed] SKIP (already exists): "${data.title}"`);
      skipped++;
      continue;
    }

    const projectDoc = {
      ...data,
      founder: founder._id,
      rawIdea: data.summary,
      status: "published",
      fundingGoal: Math.floor(Math.random() * 900000) + 100000,
      fundingRaised: 0,
      members: [{ user: founder._id, role: "founder" }],
      structuredVersion: { provider: "seed", generatedAt: new Date() },
    };

    const embText = projectEmbeddingText(projectDoc);
    projectDoc.embedding = generateEmbedding(embText);

    const project = await Project.create(projectDoc);
    await ChatRoom.create({ project: project._id, members: [founder._id] });

    console.log(`[Seed] CREATED: "${project.title}" (${project._id}) — embedding dim: ${project.embedding.length}`);
    created++;
  }

  console.log(`\n[Seed] Done! Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
  console.log("[Seed] Disconnected.");
}

seed().catch((err) => {
  console.error("[Seed] FATAL:", err);
  process.exit(1);
});
