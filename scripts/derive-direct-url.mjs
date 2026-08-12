import fs from "fs";

const path = ".env";
let env = fs.readFileSync(path, "utf8");

if (/^DIRECT_URL=/m.test(env)) {
  console.log("DIRECT_URL already present");
  process.exit(0);
}

const match = env.match(/^DATABASE_URL=(.*)$/m);
if (!match) {
  console.error("No DATABASE_URL");
  process.exit(1);
}

let db = match[1].trim();
if (
  (db.startsWith('"') && db.endsWith('"')) ||
  (db.startsWith("'") && db.endsWith("'"))
) {
  db = db.slice(1, -1);
}

const url = new URL(db);
if (!url.hostname.includes("-pooler")) {
  console.error("DATABASE_URL host has no -pooler; cannot derive DIRECT_URL safely");
  process.exit(1);
}

url.hostname = url.hostname.replace("-pooler", "");
url.searchParams.delete("pgbouncer");
url.searchParams.delete("connection_limit");

const direct = url.toString();
const line = `DIRECT_URL="${direct}"`;
const insertAt = env.indexOf("\n", env.indexOf("DATABASE_URL="));
const next = env.slice(0, insertAt + 1) + line + "\n" + env.slice(insertAt + 1);
fs.writeFileSync(path, next);

console.log("DIRECT_URL derived and written");
console.log(
  JSON.stringify({
    directHasPooler: direct.includes("-pooler"),
    directLen: direct.length,
  })
);
