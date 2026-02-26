const fs = require("fs");
const path = require("path");

function ensureFile(examplePath, targetPath) {
  if (!fs.existsSync(examplePath)) {
    throw new Error(`Missing example env file: ${examplePath}`);
  }
  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(examplePath, targetPath);
    console.log(`[env] created ${path.relative(process.cwd(), targetPath)}`);
  } else {
    console.log(`[env] exists ${path.relative(process.cwd(), targetPath)}`);
  }
}

const root = process.cwd();
ensureFile(path.join(root, ".env.example"), path.join(root, ".env"));
ensureFile(path.join(root, "worker", ".env.example"), path.join(root, "worker", ".env"));
