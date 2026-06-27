import "dotenv/config";
import { Readable } from "node:stream";
import express from "express";
import cors from "cors";
import { createOpenAI } from "@ai-sdk/openai";
import { BuiltInAgent, CopilotRuntime, createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";

const app = express();
const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || "127.0.0.1";
const model = process.env.COPILOT_MODEL || "deepseek-v4-flash";
const deepseekBaseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: deepseekBaseUrl
});

if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY.includes("paste-your")) {
  console.warn(
    "[copilotkit-demo] DEEPSEEK_API_KEY is not set. Add your DeepSeek key to .env before chatting."
  );
}

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: deepseek.chat(model),
      prompt: [
        "You are an investment journey assistant for a demo web app.",
        "Use the provided app context to understand the active route, financial profile, product search criteria, and visible fund results.",
        "When the user asks to change data in the journey UI, call the available frontend tools instead of only explaining the change.",
        "Keep responses concise, practical, and aware of the current page style."
      ].join(" "),
      maxSteps: 5
    })
  }
});

const copilotHandler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit"
});

app.use(cors({ origin: true }));
app.get("/health", (_req, res) => {
  res.json({ ok: true, provider: "deepseek", model, baseUrl: deepseekBaseUrl });
});

app.all(["/api/copilotkit", "/api/copilotkit/*"], async (req, res, next) => {
  try {
    const webReq = new Request(new URL(req.originalUrl, `http://${req.headers.host}`), {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
      duplex: "half"
    });

    const webRes = await copilotHandler(webReq);
    res.status(webRes.status);
    webRes.headers.forEach((value, key) => res.setHeader(key, value));

    if (webRes.body) {
      Readable.fromWeb(webRes.body).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    next(error);
  }
});

app.listen(port, host, () => {
  console.log(`[copilotkit-demo] Runtime listening on http://${host}:${port}/api/copilotkit`);
});
