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
    "[host-ui] DEEPSEEK_API_KEY is not set. Add your DeepSeek key to .env before chatting."
  );
}

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: deepseek.chat(model),
      prompt: [
        "You are an investment journey assistant for a demo web app.",
        "Use all provided shell and remote feature context to understand the current journey.",
        "When the user asks to change application data, call the available frontend tools instead of only explaining the change.",
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

const server = app.listen(port, host, () => {
  console.log(`[host-ui] CopilotKit runtime listening on http://${host}:${port}/api/copilotkit`);
});

server.on("error", async (error) => {
  if (error.code !== "EADDRINUSE") {
    throw error;
  }

  const healthHost = host === "0.0.0.0" || host === "::" ? "127.0.0.1" : host;
  const healthUrl = `http://${healthHost}:${port}/health`;

  try {
    const response = await fetch(healthUrl);
    const health = await response.json();

    if (!response.ok || !health?.ok) {
      throw new Error("The existing service did not return a healthy runtime response.");
    }

    console.warn(
      `[host-ui] Port ${port} already has a healthy CopilotKit runtime. Reusing the existing service.`
    );

    // Keep this supervised command alive so concurrently does not stop the
    // three frontend development servers while the existing runtime is reused.
    const keepAlive = setInterval(() => {}, 2 ** 30);
    const stop = () => {
      clearInterval(keepAlive);
      process.exit(0);
    };

    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  } catch (healthError) {
    console.error(
      `[host-ui] Port ${port} is already in use by another service. Stop that process or set a different PORT in .env.`,
      healthError
    );
    process.exit(1);
  }
});
