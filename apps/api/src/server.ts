import { app } from "./app";
import CONFIG from "./config";
import jobs from "./jobs";

function startJobs() {
  for (const job of jobs) {
    setInterval(job.run, job.interval);
  }
}

app.listen(CONFIG.API_PORT, () => {
  console.log(`API running on port ${CONFIG.API_PORT}`);
  startJobs();
});
