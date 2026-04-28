import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();
app.use("/api/*", cors());

// ── Helpers ──────────────────────────────────────────────────
const uid = () => crypto.randomUUID();

// ── GET /api/applicants ── List all applicants with latest stats ──
app.get("/api/applicants", async (c) => {
  const db = c.env.DB;
  const applicants = await db
    .prepare(`SELECT * FROM applicants ORDER BY created_at DESC`)
    .all();

  const result = [];
  for (const ap of applicants.results as any[]) {
    const submissions = await db
      .prepare(`SELECT * FROM submissions WHERE applicant_id = ? ORDER BY version ASC`)
      .bind(ap.id)
      .all();

    const enrichedSubmissions = [];
    for (const sub of submissions.results as any[]) {
      const docs = await db
        .prepare(`SELECT * FROM documents WHERE submission_id = ?`)
        .bind(sub.id)
        .all();

      const enrichedDocs = [];
      for (const doc of docs.results as any[]) {
        const logs = await db
          .prepare(`SELECT * FROM document_logs WHERE document_id = ? ORDER BY rowid ASC`)
          .bind(doc.id)
          .all();
        enrichedDocs.push({ ...doc, logs: logs.results });
      }

      enrichedSubmissions.push({
        id: sub.id,
        version: sub.version,
        submittedAt: sub.submitted_at,
        completion: {
          percentage: sub.completion_percentage,
          previousPercentage: sub.prev_completion_percentage,
        },
        documents: enrichedDocs.map(d => ({
          id: d.id,
          name: d.name,
          category: d.category,
          status: d.status,
          version: d.version,
          logs: d.logs.map((l: any) => ({
            id: l.id,
            timestamp: l.timestamp,
            type: l.type,
            message: l.message,
            details: l.details,
          })),
        })),
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
});

// ── POST /api/verify ── Run verification, save to DB ──────────────
app.post("/api/verify", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json().catch(() => ({}));
  const files: string[] = body.files || [];
  const version: number = body.version || 1;
  const existingApplicantId: string | null = body.applicantId || null;

  const isV2 = version >= 2;
  const now = new Date().toLocaleTimeString("en-US", { hour12: false });
  const submittedAt = new Date().toLocaleString("en-US");

  // ── Mock AI Extraction ────────────────────
  const mockProfile = {
    name: "Amarajeewa Bandara Silva",
    passportNo: "N1234567",
    nationality: "Sri Lanka",
    dob: "2002-05-14",
    sponsorName: "Sunil Silva",
  };

  const mockCompletion = {
    percentage: isV2 ? 100 : 75,
    previousPercentage: isV2 ? 75 : 0,
  };

  const mockDocuments = [
    {
      name: "Commercial_Bank_Statement.pdf",
      category: "Financial",
      status: "success",
      logs: [
        { type: "success", message: "Bank Statement verification passed.", details: "3-year history analyzed. Closing balance: 9.2M LKR." },
        { type: "success", message: "Balance requirement met.", details: "Balance exceeds minimum JPY 2,000,000 equivalent." },
      ],
    },
    {
      name: isV2 ? "Birth_Certificate_V2.pdf" : "Birth_Certificate.pdf",
      category: "Identity",
      status: isV2 ? "success" : "error",
      logs: isV2
        ? [
            { type: "success", message: "Name cross-check passed.", details: "Name matches Passport exactly after affidavit submission." },
            { type: "success", message: "Affidavit accepted.", details: "Legal declaration resolved initial name discrepancy." },
          ]
        : [
            { type: "error", message: "Name Mismatch: Passport vs Birth Certificate.", details: "Passport: 'Silva A.B.' — Birth Certificate: 'Silva Amarajeewa Bandara'. Action: Submit affidavit." },
          ],
    },
    {
      name: isV2 ? "AL_Certificate_Stamped.pdf" : "AL_Certificate.pdf",
      category: "Educational",
      status: isV2 ? "success" : "error",
      logs: isV2
        ? [{ type: "success", message: "Foreign Ministry stamp detected.", details: "Certification stamp verified on A/L Certificate v2." }]
        : [{ type: "error", message: "Missing: Foreign Ministry Certify stamp not found.", details: "A/L Certificate must be certified by the Foreign Ministry. Resubmit with stamp." }],
    },
    ...files.map((fname, i) => ({
      name: fname,
      category: "Uploaded",
      status: "neutral" as const,
      logs: [{ type: "info", message: `File "${fname}" received for processing.`, details: `File ${i + 1} of ${files.length} queued for AI extraction.` }],
    })),
  ];

  // ── Persist to D1 ─────────────────────────
  let applicantId = existingApplicantId;

  if (!applicantId) {
    // Check if applicant with same passport already exists
    const existing = await db
      .prepare(`SELECT id FROM applicants WHERE passport_no = ?`)
      .bind(mockProfile.passportNo)
      .first();

    if (existing) {
      applicantId = (existing as any).id;
    } else {
      applicantId = uid();
      await db
        .prepare(`INSERT INTO applicants (id, name, passport_no, nationality, dob, sponsor_name) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(applicantId, mockProfile.name, mockProfile.passportNo, mockProfile.nationality, mockProfile.dob, mockProfile.sponsorName)
        .run();
    }
  }

  // Determine actual version number
  const versionRow = await db
    .prepare(`SELECT MAX(version) as max_v FROM submissions WHERE applicant_id = ?`)
    .bind(applicantId)
    .first();
  const actualVersion = ((versionRow as any)?.max_v ?? 0) + 1;

  const submissionId = uid();
  await db
    .prepare(`INSERT INTO submissions (id, applicant_id, version, completion_percentage, prev_completion_percentage, submitted_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(submissionId, applicantId, actualVersion, mockCompletion.percentage, mockCompletion.previousPercentage, submittedAt)
    .run();

  const savedDocs = [];
  for (const doc of mockDocuments) {
    const docId = uid();
    await db
      .prepare(`INSERT INTO documents (id, submission_id, applicant_id, name, category, status, version) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(docId, submissionId, applicantId, doc.name, doc.category, doc.status, actualVersion)
      .run();

    const savedLogs = [];
    for (const log of doc.logs) {
      const logId = uid();
      await db
        .prepare(`INSERT INTO document_logs (id, document_id, timestamp, type, message, details) VALUES (?, ?, ?, ?, ?, ?)`)
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
});

// ── DELETE /api/applicants/:id ─────────────────────────────────
app.delete("/api/applicants/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db.prepare(`DELETE FROM applicants WHERE id = ?`).bind(id).run();
  return c.json({ success: true });
});

app.get("/api/", (c) => c.json({ name: "Smart Validator", version: "2.0" }));

export default app;
