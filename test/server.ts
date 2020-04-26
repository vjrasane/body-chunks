import express from "express";
import crypto from "crypto";

const app = express();

app.get("/download/:bytes", (req, res) => {
  const bytes: number = parseInt(req.params.bytes, 10);
  res.end(crypto.randomBytes(bytes), "binary");
});

export default app;
