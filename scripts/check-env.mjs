import fs from "fs";

const env = fs.readFileSync(".env", "utf8");
const keys = ["DATABASE_URL", "DIRECT_URL", "AUTH_SECRET", "AUTH_URL", "UPLOAD_DIR"];

for (const key of keys) {
  const match = env.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) {
    console.log(`${key}: MISSING`);
    continue;
  }
  let value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  const looksPlaceholder =
    /USER:PASSWORD|<pooled|<direct|<generated|HOST-pooler|HOST\.REGION/.test(value);
  console.log(
    `${key}:`,
    JSON.stringify({
      set: value.length > 0,
      len: value.length,
      looksPlaceholder,
      hasPooler: value.includes("-pooler"),
      pg: value.startsWith("postgresql://"),
    })
  );
}
