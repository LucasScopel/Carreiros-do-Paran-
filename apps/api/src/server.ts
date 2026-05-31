import { app } from "./app";
import jobs from "./jobs";

function startJobs() {
  for (const job of jobs) {
    setInterval(job.run, job.interval);
  }
}

if (process.env.API_PORT) {
  app.listen(process.env.API_PORT, () => {
    console.log(`API running on port ${process.env.API_PORT}`);
    startJobs();
  });
} else {
  const defaultPort = 4000;

  app.listen(defaultPort, () => {
    console.log(`API running on default port ${defaultPort}`);
    startJobs();
  });
}
