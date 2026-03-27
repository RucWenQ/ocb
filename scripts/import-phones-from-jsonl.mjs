import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const sourcePath = process.argv[2];
const projectRoot = process.cwd();
const dataDir = path.join(projectRoot, "data");
const targetPath = path.join(dataDir, "registered-phones.json");

if (!sourcePath) {
  console.error("Usage: node scripts/import-phones-from-jsonl.mjs <path-to-jsonl>");
  process.exit(1);
}

function normalizePhone(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\D/g, "");
}

function loadExistingPhones() {
  try {
    const raw = fs.readFileSync(targetPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => typeof item === "string")
      .map((item) => normalizePhone(item))
      .filter((item) => item.length === 11);
  } catch {
    return [];
  }
}

async function collectPhonesFromJsonl(filePath) {
  const phones = new Set();
  const stream = fs.createReadStream(filePath, { encoding: "utf-8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let lines = 0;
  let matches = 0;

  for await (const line of rl) {
    lines += 1;
    if (!line.trim()) continue;

    let phone = "";
    try {
      const row = JSON.parse(line);
      phone = normalizePhone(row?.demographics?.phone ?? "");
    } catch {
      const regexMatched = line.match(/"phone"\s*:\s*"(\d{11})"/);
      phone = regexMatched?.[1] ?? "";
    }

    if (phone.length === 11) {
      matches += 1;
      phones.add(phone);
    }
  }

  return { phones: [...phones], lines, matches };
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const existing = loadExistingPhones();
  const { phones: imported, lines, matches } =
    await collectPhonesFromJsonl(sourcePath);

  const merged = [...new Set([...existing, ...imported])].sort();
  fs.writeFileSync(targetPath, `${JSON.stringify(merged, null, 2)}\n`, "utf-8");

  console.log(`lines=${lines}`);
  console.log(`matched_phone_rows=${matches}`);
  console.log(`existing_phones=${existing.length}`);
  console.log(`imported_unique_phones=${imported.length}`);
  console.log(`merged_unique_phones=${merged.length}`);
  console.log(`output=${targetPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
