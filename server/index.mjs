import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT ?? process.env.BACKEND_PORT ?? 8787);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "";
const PROJECT_ROOT = process.cwd();
const DIST_DIR = path.join(PROJECT_ROOT, "dist");
const DATA_DIR = path.resolve(process.env.DATA_DIR ?? path.join(PROJECT_ROOT, "data"));
const PHONE_REGISTRY_FILE = path.join(DATA_DIR, "registered-phones.json");
const SUBMISSION_LOG_FILE = path.join(DATA_DIR, "submissions.jsonl");
const FINAL_SUBMISSION_LOG_FILE = path.join(DATA_DIR, "final-submissions.jsonl");
const DEFAULT_QWEN_ENDPOINT =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PHONE_REGISTRY_FILE)) {
    fs.writeFileSync(PHONE_REGISTRY_FILE, "[]\n", "utf-8");
  }
  if (!fs.existsSync(SUBMISSION_LOG_FILE)) {
    fs.writeFileSync(SUBMISSION_LOG_FILE, "", "utf-8");
  }
  if (!fs.existsSync(FINAL_SUBMISSION_LOG_FILE)) {
    fs.writeFileSync(FINAL_SUBMISSION_LOG_FILE, "", "utf-8");
  }
}

function normalizePhone(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\D/g, "");
}

function isValidPhone(value) {
  return /^\d{11}$/.test(value);
}

function readRegisteredPhones() {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(PHONE_REGISTRY_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => typeof item === "string")
      .map((item) => normalizePhone(item))
      .filter((item) => isValidPhone(item));
  } catch {
    return [];
  }
}

function writeRegisteredPhones(phones) {
  const uniqueSorted = [...new Set(phones)]
    .map((item) => normalizePhone(item))
    .filter((item) => isValidPhone(item))
    .sort();
  fs.writeFileSync(
    PHONE_REGISTRY_FILE,
    `${JSON.stringify(uniqueSorted, null, 2)}\n`,
    "utf-8",
  );
}

function addRegisteredPhone(phone) {
  const normalized = normalizePhone(phone);
  if (!isValidPhone(normalized)) return;
  const phones = readRegisteredPhones();
  if (phones.includes(normalized)) return;
  phones.push(normalized);
  writeRegisteredPhones(phones);
}

function appendJsonl(filePath, payload) {
  ensureDataFiles();
  fs.appendFileSync(filePath, `${JSON.stringify(payload)}\n`, "utf-8");
}

function safeExtractConsentPhone(payload) {
  if (!payload || typeof payload !== "object") return "";
  const maybePageId = payload.pageId;
  if (maybePageId !== "consent") return "";
  const data = payload.data;
  if (!data || typeof data !== "object") return "";
  const demographics = data.demographics;
  if (!demographics || typeof demographics !== "object") return "";
  return normalizePhone(demographics.phone);
}

function safeExtractAnyPhone(payload) {
  if (!payload || typeof payload !== "object") return "";
  const demographics = payload.demographics;
  if (!demographics || typeof demographics !== "object") return "";
  return normalizePhone(demographics.phone);
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

function getQwenApiConfig() {
  const apiKey = process.env.QWEN_API_KEY ?? process.env.VITE_QWEN_API_KEY ?? "";
  const endpoint =
    process.env.QWEN_API_ENDPOINT ??
    process.env.VITE_QWEN_API_ENDPOINT ??
    DEFAULT_QWEN_ENDPOINT;
  const defaultModel = process.env.QWEN_MODEL ?? process.env.VITE_QWEN_MODEL ?? "qwen-plus";
  return { apiKey, endpoint, defaultModel };
}

ensureDataFiles();

if (CORS_ORIGIN) {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });
}

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  sendJson(res, 200, { ok: true });
});

app.get("/api/participants/check-phone", (req, res) => {
  const phone = normalizePhone(String(req.query.phone ?? ""));
  if (!isValidPhone(phone)) {
    sendJson(res, 200, { exists: false });
    return;
  }
  const exists = readRegisteredPhones().includes(phone);
  sendJson(res, 200, { exists });
});

app.post("/api/submit", (req, res) => {
  try {
    const payload = req.body ?? {};
    const entry = {
      receivedAt: new Date().toISOString(),
      ...payload,
    };
    appendJsonl(SUBMISSION_LOG_FILE, entry);

    const consentPhone = safeExtractConsentPhone(payload);
    if (isValidPhone(consentPhone)) {
      addRegisteredPhone(consentPhone);
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 400, {
      ok: false,
      error: error instanceof Error ? error.message : "invalid-request",
    });
  }
});

app.post("/api/final-submit", (req, res) => {
  try {
    const payload = req.body ?? {};
    const entry = {
      receivedAt: new Date().toISOString(),
      ...payload,
    };
    appendJsonl(FINAL_SUBMISSION_LOG_FILE, entry);

    const phone = safeExtractAnyPhone(payload);
    if (isValidPhone(phone)) {
      addRegisteredPhone(phone);
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 400, {
      ok: false,
      error: error instanceof Error ? error.message : "invalid-request",
    });
  }
});

app.post("/api/chat/completions", async (req, res) => {
  try {
    const { apiKey, endpoint, defaultModel } = getQwenApiConfig();
    if (!apiKey) {
      sendJson(res, 500, { ok: false, error: "QWEN_API_KEY missing on server" });
      return;
    }

    const body = req.body ?? {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const model = typeof body.model === "string" && body.model ? body.model : defaultModel;
    const temperature =
      typeof body.temperature === "number" ? body.temperature : 0.7;
    const maxTokens =
      typeof body.max_tokens === "number" ? body.max_tokens : 500;

    const qwenResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!qwenResponse.ok) {
      const raw = await qwenResponse.text();
      sendJson(res, qwenResponse.status, {
        ok: false,
        error: "qwen-request-failed",
        detail: raw.slice(0, 500),
      });
      return;
    }

    const payload = (await qwenResponse.json()) ?? {};
    const text =
      payload?.choices?.[0]?.message?.content ??
      payload?.output?.text ??
      "";

    sendJson(res, 200, { text: String(text ?? "") });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "chat-completion-failed",
    });
  }
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      next();
      return;
    }
    if (req.method !== "GET") {
      next();
      return;
    }
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

app.use("/api", (_req, res) => {
  sendJson(res, 404, { ok: false, error: "not-found" });
});

const server = app.listen(PORT);

server.on("listening", () => {
  console.log(`[server] listening on http://127.0.0.1:${PORT}`);
});

server.on("error", (error) => {
  console.error("[server] failed to start", error);
  process.exit(1);
});
