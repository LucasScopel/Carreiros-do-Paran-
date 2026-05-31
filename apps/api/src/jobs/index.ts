import { cleanupJob } from "./cleanup";

export interface Job {
  run(): Promise<void>;
  interval: number;
}

const jobs = [cleanupJob];

export default jobs;
