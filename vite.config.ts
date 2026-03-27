import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const DATA_DIR = path.resolve(process.cwd(), "data");
const PHONE_REGISTRY_FILE = path.join(DATA_DIR, "registered-phones.json");
const SUBMISSION_LOG_FILE = path.join(DATA_DIR, "submissions.jsonl");

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
}

function normalizePhone(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\D/g, "");
}

function readRegisteredPhones(): string[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(PHONE_REGISTRY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => normalizePhone(item))
      .filter((item) => item.length === 11);
  } catch {
    return [];
  }
}

function writeRegisteredPhones(phones: string[]) {
  ensureDataFiles();
  const uniqueSorted = [...new Set(phones)]
    .map((phone) => normalizePhone(phone))
    .filter((phone) => phone.length === 11)
    .sort();
  fs.writeFileSync(
    PHONE_REGISTRY_FILE,
    `${JSON.stringify(uniqueSorted, null, 2)}\n`,
    "utf-8",
  );
}

function addRegisteredPhone(phone: string) {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 11) return;
  const phones = readRegisteredPhones();
  if (phones.includes(normalized)) return;
  phones.push(normalized);
  writeRegisteredPhones(phones);
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>,
) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString("utf-8");
  if (!text) return {};
  return JSON.parse(text) as unknown;
}

function localApiPlugin(): Plugin {
  ensureDataFiles();
  return {
    name: "local-phone-dedupe-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const method = req.method?.toUpperCase();
        const url = req.url ? new URL(req.url, "http://localhost") : null;
        if (!method || !url) {
          next();
          return;
        }

        if (method === "GET" && url.pathname === "/api/participants/check-phone") {
          const phone = normalizePhone(url.searchParams.get("phone") ?? "");
          const exists = phone.length === 11 && readRegisteredPhones().includes(phone);
          sendJson(res, 200, { exists });
          return;
        }

        if (method === "POST" && url.pathname === "/api/submit") {
          try {
            const body = await readJsonBody(req);
            fs.appendFileSync(SUBMISSION_LOG_FILE, `${JSON.stringify(body)}\n`, "utf-8");

            if (
              body &&
              typeof body === "object" &&
              "pageId" in body &&
              (body as { pageId?: string }).pageId === "consent"
            ) {
              const data = (body as { data?: unknown }).data;
              const phone = normalizePhone(
                (
                  data as {
                    demographics?: {
                      phone?: unknown;
                    };
                  }
                )?.demographics?.phone ?? "",
              );
              if (phone.length === 11) {
                addRegisteredPhone(phone);
              }
            }

            sendJson(res, 200, { ok: true });
          } catch (error) {
            sendJson(res, 400, {
              ok: false,
              error: error instanceof Error ? error.message : "invalid-request",
            });
          }
          return;
        }

        if (method === "POST" && url.pathname === "/api/final-submit") {
          try {
            const body = await readJsonBody(req);
            fs.appendFileSync(SUBMISSION_LOG_FILE, `${JSON.stringify(body)}\n`, "utf-8");
            sendJson(res, 200, { ok: true });
          } catch (error) {
            sendJson(res, 400, {
              ok: false,
              error: error instanceof Error ? error.message : "invalid-request",
            });
          }
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
});
