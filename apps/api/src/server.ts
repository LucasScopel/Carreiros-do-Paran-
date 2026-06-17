import fs from "node:fs/promises";
import { app } from "./app";
import CONFIG from "./config";
import jobs from "./jobs";

function startJobs() {
  for (const job of jobs) {
    setInterval(job.run, job.interval);
  }
}

async function makeUploadFolders() {
  await fs.mkdir(CONFIG.AVATARS_DIR, { recursive: true });
}

app.listen(CONFIG.API_PORT, async () => {
  await makeUploadFolders();
  console.log(`API running on port ${CONFIG.API_PORT}`);
  startJobs();
});
