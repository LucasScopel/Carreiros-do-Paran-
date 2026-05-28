import { app } from "./app";

if (process.env.API_PORT) {
  app.listen(process.env.API_PORT, () => {
    console.log(`API running on port ${process.env.API_PORT}`);
  });
} else {
  const defaultPort = 4000;

  app.listen(defaultPort, () => {
    console.log(`API running on default port ${defaultPort}`);
  });
}
