import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();
app.use("/api/*", cors());

const uid = () => crypto.randomUUID();

// ── Auto-migration: create tables if missing ──────────────────
const SCHEMA = `
CREATE TABLE IF NOT EXISTS applicants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  passport_no TEXT NOT NULL UNIQUE,
  nationality TEXT NOT NULL,
  dob TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  applicant_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  prev_completion_percentage INTEGER NOT NULL DEFAULT 0,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(applicant_id, version)
);
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  applicant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  version INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS document_logs (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  details TEXT
);
`;

app.use("/api/*", async (c, next) => {
  const db = c.env.DB;
  if (db) {
    try {
      const check = await db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='applicants'"
      ).first();
      if (!check) {
        for (const stmt of SCHEMA.split(";").filter(s => s.trim())) {
          await db.prepare(stmt + ";").run();
        }
      }
    } catch { /* ignore migration errors */ }
  }
  await next();
});

// ── Diagnostic ────────────────────────────────────────────────
app.get("/api/health", async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ ok: false, error: "DB binding not found" }, 500);
  try {
    const tables = await db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all();
    return c.json({ ok: true, tables: tables.results.map((r: any) => r.name) });
  } catch (e) {
    return c.json({ ok: false, error: String(e) }, 500);
  }
});

// ── GET /api/applicants ───────────────────────────────────────
app.get("/api/applicants", async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ error: "DB binding not found" }, 500);

  try {
    const applicants = await db
      .prepare("SELECT * FROM applicants ORDER BY created_at DESC")
      .all();

    const result = [];
    for (const ap of applicants.results as any[]) {
      const submissions = await db
        .prepare("SELECT * FROM submissions WHERE applicant_id = ? ORDER BY version ASC")
        .bind(ap.id)
        .all();

      const enrichedSubmissions = [];
      for (const sub of submissions.results as any[]) {
        const docs = await db
          .prepare("SELECT * FROM documents WHERE submission_id = ?")
          .bind(sub.id)
          .all();

        const enrichedDocs = [];
        for (const doc of docs.results as any[]) {
          const logs = await db
            .prepare("SELECT * FROM document_logs WHERE document_id = ? ORDER BY rowid ASC")
            .bind(doc.id)
            .all();
          enrichedDocs.push({
            id: doc.id,
            name: doc.name,
            category: doc.category,
            status: doc.status,
            version: doc.version,
            logs: logs.results.map((l: any) => ({
              id: l.id,
              timestamp: l.timestamp,
              type: l.type,
              message: l.message,
              details: l.details,
            })),
          });
        }

        enrichedSubmissions.push({
          id: sub.id,
          version: sub.version,
          submittedAt: sub.submitted_at,
          completion: {
            percentage: sub.completion_percentage,
            previousPercentage: sub.prev_completion_percentage,
          },
          documents: enrichedDocs,
        });
      }

      result.push({
        id: ap.id,
        profile: {
          name: ap.name,
          passportNo: ap.passport_no,
          nationality: ap.nationality,
          dob: ap.dob,
          sponsorName: ap.sponsor_name,
        },
        submissions: enrichedSubmissions,
      });
    }

    return c.json(result);
  } catch (e: any) {
    return c.json({ error: String(e), stack: e?.stack }, 500);
  }
});

// ── POST /api/verify ──────────────────────────────────────────
app.post("/api/verify", async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ error: "DB binding not found" }, 500);

  try {
    const body = await c.req.json().catch(() => ({}));
    const files: string[] = body.files || [];
    const existingApplicantId: string | null = body.applicantId || null;
    const now = new Date().toLocaleTimeString("en-US", { hour12: false });
    const submittedAt = new Date().toLocaleString("en-US");

    const mockProfile = {
      name: "Amarajeewa Bandara Silva",
      passportNo: "N1234567",
      nationality: "Sri Lanka",
      dob: "2002-05-14",
      sponsorName: "Sunil Silva",
    };

    let applicantId = existingApplicantId;

    if (!applicantId) {
      const existing = await db
        .prepare("SELECT id FROM applicants WHERE passport_no = ?")
        .bind(mockProfile.passportNo)
        .first();

      if (existing) {
        applicantId = (existing as any).id;
      } else {
        applicantId = uid();
        await db
          .prepare("INSERT INTO applicants (id, name, passport_no, nationality, dob, sponsor_name) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(applicantId, mockProfile.name, mockProfile.passportNo, mockProfile.nationality, mockProfile.dob, mockProfile.sponsorName)
          .run();
      }
    }

    const versionRow = await db
      .prepare("SELECT MAX(version) as max_v FROM submissions WHERE applicant_id = ?")
      .bind(applicantId)
      .first();
    const actualVersion = (((versionRow as any)?.max_v) ?? 0) + 1;
    const isV2 = actualVersion >= 2;

    const mockCompletion = {
      percentage: isV2 ? 100 : 75,
      previousPercentage: isV2 ? 75 : 0,
    };

    const submissionId = uid();
    await db
      .prepare("INSERT INTO submissions (id, applicant_id, version, completion_percentage, prev_completion_percentage, submitted_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(submissionId, applicantId, actualVersion, mockCompletion.percentage, mockCompletion.previousPercentage, submittedAt)
      .run();

    const mockDocuments: { name: string; category: string; status: string; logs: { type: string; message: string; details?: string }[] }[] = [
      {
        name: "Commercial_Bank_Statement.pdf",
        category: "Financial",
        status: "success",
        logs: [
          { type: "success", message: "Bank Statement verification passed.", details: "3-year history analyzed. Closing balance: 9.2M LKR." },
        ],
      },
      {
        name: isV2 ? "Birth_Certificate_V2.pdf" : "Birth_Certificate.pdf",
        category: "Identity",
        status: isV2 ? "success" : "error",
        logs: isV2
          ? [{ type: "success", message: "Name cross-check passed.", details: "Affidavit accepted." }]
          : [{ type: "error", message: "Name Mismatch: Passport vs Birth Certificate.", details: "Submit affidavit to resolve." }],
      },
      {
        name: isV2 ? "AL_Certificate_Stamped.pdf" : "AL_Certificate.pdf",
        category: "Educational",
        status: isV2 ? "success" : "error",
        logs: isV2
          ? [{ type: "success", message: "Foreign Ministry stamp detected." }]
          : [{ type: "error", message: "Missing: Foreign Ministry stamp not found.", details: "Resubmit with stamp." }],
      },
      ...files.map((fname, i) => ({
        name: fname,
        category: "Uploaded",
        status: "neutral" as const,
        logs: [{ type: "info", message: `File "${fname}" received.`, details: `File ${i + 1} of ${files.length} queued.` }],
      })),
    ];

    const savedDocs = [];
    for (const doc of mockDocuments) {
      const docId = uid();
      await db
        .prepare("INSERT INTO documents (id, submission_id, applicant_id, name, category, status, version) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(docId, submissionId, applicantId, doc.name, doc.category, doc.status, actualVersion)
        .run();

      const savedLogs = [];
      for (const log of doc.logs) {
        const logId = uid();
        await db
          .prepare("INSERT INTO document_logs (id, document_id, timestamp, type, message, details) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(logId, docId, now, log.type, log.message, log.details ?? null)
          .run();
        savedLogs.push({ id: logId, timestamp: now, type: log.type, message: log.message, details: log.details });
      }
      savedDocs.push({ id: docId, name: doc.name, category: doc.category, status: doc.status, version: actualVersion, logs: savedLogs });
    }

    return c.json({
      applicantId,
      profile: mockProfile,
      completion: mockCompletion,
      documents: savedDocs,
      submission: { id: submissionId, version: actualVersion, submittedAt },
    });
  } catch (e: any) {
    return c.json({ error: String(e), stack: e?.stack }, 500);
  }
});

// ── DELETE /api/applicants/:id ────────────────────────────────
app.delete("/api/applicants/:id", async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ error: "DB binding not found" }, 500);

  try {
    const id = c.req.param("id");
    await db.prepare("DELETE FROM applicants WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: String(e) }, 500);
  }
});

app.get("/api/", (c) => c.json({ name: "Smart Validator", version: "2.0" }));

// ── GET /api/dashboard/stats ──────────────────────────────────
app.get("/api/dashboard/stats", async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ error: "DB binding not found" }, 500);

  try {
    // Total Applicants
    const applicantsRes = await db.prepare("SELECT COUNT(*) as count FROM applicants").first();
    const totalApplicants = applicantsRes?.count || 0;

    // Total Documents
    const docsRes = await db.prepare("SELECT COUNT(*) as count FROM documents").first();
    const totalDocuments = docsRes?.count || 0;

    // Passed Documents (Status = VERIFIED)
    const passedRes = await db.prepare("SELECT COUNT(*) as count FROM documents WHERE status = 'VERIFIED'").first();
    const passedDocuments = passedRes?.count || 0;

    const passRate = Number(totalDocuments) > 0 ? Math.round((Number(passedDocuments) / Number(totalDocuments)) * 100) : 0;

    // Recent Activity (Last 5 processed documents joined with applicant info)
    const { results: recentActivity } = await db.prepare(`
      SELECT 
        d.id as documentId,
        d.name as documentName,
        d.status,
        s.submitted_at as date,
        a.name as applicantName
      FROM documents d
      JOIN submissions s ON d.submission_id = s.id
      JOIN applicants a ON s.applicant_id = a.id
      ORDER BY s.submitted_at DESC
      LIMIT 5
    `).all();

    // Mock Trends for Line Chart
    const trends = [
      { name: "Jan-24", value: 120 },
      { name: "Feb-24", value: 150 },
      { name: "Mar-24", value: 180 },
      { name: "Apr-24", value: 220 },
      { name: "May-24", value: 270 },
      { name: "Jun-24", value: 310 }
    ];

    // Mock Issue Breakdown for Bar Chart
    const issueBreakdown = [
      { name: "Missing Signature", value: 45 },
      { name: "Low Resolution", value: 30 },
      { name: "Expired ID", value: 20 },
      { name: "Name Mismatch", value: 15 }
    ];

    return c.json({
      totalApplicants,
      totalDocuments,
      passRate,
      recentActivity,
      trends,
      issueBreakdown
    });
  } catch (e: any) {
    console.error("Failed to load dashboard stats", e);
    return c.json({ error: String(e) }, 500);
  }
});

export default app;
