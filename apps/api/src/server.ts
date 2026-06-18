import fs from "node:fs/promises";
import { app } from "./app";
import CONFIG from "./config";
import jobs from "./jobs";
import path from "node:path";

function startJobs() {
  for (const job of jobs) {
    setInterval(job.run, job.interval);
  }
}

async function makeUploadFolders() {
  console.log(path.join(process.cwd(), CONFIG.AVATARS_DIR));
  await fs.mkdir(CONFIG.AVATARS_DIR, { recursive: true });
}

app.listen(CONFIG.API_PORT, async () => {
  await makeUploadFolders();
  console.log(`API running on port ${CONFIG.API_PORT}`);
  startJobs();
});
