import { Hono } from "hono";

type Env = {};

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Smart Validator" }));

app.post("/api/verify", async (c) => {
  const body = await c.req.json().catch(() => ({ files: [], version: 1 }));
  const files: string[] = body.files || [];
  const version: number = body.version || 1;

  const isV2 = version >= 2;

  // Mock Profile Generation
  const profile = {
    name: "Amarajeewa Bandara Silva",
    passportNo: "N1234567",
    nationality: "Sri Lanka",
    dob: "2002-05-14",
    sponsorName: "Sunil Silva",
  };

  // Completion Rate
  const completion = {
    percentage: isV2 ? 100 : 75,
    previousPercentage: isV2 ? 75 : 0,
  };

  const now = new Date().toLocaleTimeString();

  const documents = [
    {
      id: `doc-fin-1-v${version}`,
      name: "Commercial_Bank_Statement.pdf",
      category: "Financial",
      status: "success",
      version,
      logs: [
        { id: "lf1", timestamp: now, type: "success", message: "Bank Statement mathematical verification passed.", details: "3-year transaction history analyzed. Closing balance: 9.2M LKR." },
        { id: "lf2", timestamp: now, type: "success", message: "Bank Balance requirement met.", details: "Balance exceeds minimum JPY 2,000,000 equivalent." },
      ],
    },
    {
      id: `doc-id-1-v${version}`,
      name: isV2 ? "Birth_Certificate_V2.pdf" : "Birth_Certificate.pdf",
      category: "Identity",
      status: isV2 ? "success" : "error",
      version,
      logs: isV2
        ? [
            { id: "li1", timestamp: now, type: "success", message: "Name cross-check passed.", details: "Name matches Passport exactly after affidavit submission." },
            { id: "li2", timestamp: now, type: "success", message: "Affidavit accepted.", details: "Legal declaration resolved initial name discrepancy." },
          ]
        : [
            { id: "li1", timestamp: now, type: "error", message: "Name Mismatch: Passport vs Birth Certificate.", details: "Passport: 'Silva A.B.' — Birth Certificate: 'Silva Amarajeewa Bandara'. Action: Submit affidavit." },
          ],
    },
    {
      id: `doc-edu-1-v${version}`,
      name: "AL_Certificate.pdf",
      category: "Educational",
      status: isV2 ? "success" : "error",
      version,
      logs: isV2
        ? [
            { id: "le1", timestamp: now, type: "success", message: "Foreign Ministry stamp detected.", details: "Certification stamp verified on A/L Certificate v2." },
          ]
        : [
            { id: "le1", timestamp: now, type: "error", message: "Missing Stamp: Foreign Ministry Certify stamp not found.", details: "A/L Certificate must be certified by the Foreign Ministry. Resubmit with stamp." },
          ],
    },
  ];

  const uploadedFiles = files.map((fname, i) => ({
    id: `uploaded-${i}-v${version}`,
    name: fname,
    category: "Uploaded",
    status: "neutral",
    version,
    logs: [{ id: `ulog-${i}`, timestamp: now, type: "info", message: `File "${fname}" received for processing.`, details: `File ${i + 1} of ${files.length} queued for AI extraction.` }],
  }));

  return c.json({ profile, completion, documents: [...documents, ...uploadedFiles] });
});

export default app;
