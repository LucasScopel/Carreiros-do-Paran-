import express from "express";

const app = express();

app.use(express.json());

app.get("/", (_, res) => {
  res.send({
    version: "1.0.0",
    name: "Carreiros do Parana API"
  });
});

app.get("/hello", (_, res) => {
  res.json({ message: "Hello world" });
});

app.listen(process.env.API_PORT, () => {
  console.log(`API running on port ${process.env.API_PORT}`);
});
