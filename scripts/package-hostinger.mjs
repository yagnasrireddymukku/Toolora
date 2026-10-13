// Creates toolora-hostinger.zip from the CONTENTS of out/ (hidden files such as .htaccess included).
// Upload the zip to public_html in Hostinger File Manager and choose Extract.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { zipSync } from "fflate";

const out = "out";
if (!existsSync(join(out, "index.html"))) {
  console.error(
    "out/ is missing. Run `npm run build:prod` first (or use `npm run package:hostinger`).",
  );
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const files = {};
for (const path of walk(out)) {
  files[relative(out, path).split(sep).join("/")] = readFileSync(path);
}
if (!(".htaccess" in files)) {
  console.error("out/.htaccess is missing. The build did not copy public/.htaccess.");
  process.exit(1);
}

const zip = zipSync(files, { level: 9 });
writeFileSync("toolora-hostinger.zip", zip);
console.log(
  `Created toolora-hostinger.zip: ${Object.keys(files).length} files, ${(zip.length / 1024 / 1024).toFixed(1)} MB (includes .htaccess).`,
);
console.log(
  "Upload it to public_html in Hostinger File Manager, then choose Extract. index.html must end up directly in public_html.",
);
