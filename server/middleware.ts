import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { handleStoryApiRequest, type StoryApiConfig } from "./router";

const DEFAULT_BODY_LIMIT = 100_000;
const COMMENTARY_BODY_LIMIT = 5_500_000;

async function readJson(req: IncomingMessage, limit: number): Promise<unknown> {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > limit) throw new Error("Request body is too large.");
  }
  return JSON.parse(body || "{}");
}

function send(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

export function storyApiPlugin(config: StoryApiConfig): Plugin {
  return {
    name: "storydna-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split("?", 1)[0] || "";
        if (!path.startsWith("/api/story/")) return next();
        if (req.method === "POST" && !req.headers["content-type"]?.includes("application/json")) {
          return send(res, 415, { code: "invalid_content_type", message: "Send JSON.", retryable: false });
        }

        try {
          const limit = path === "/api/story/commentary" ? COMMENTARY_BODY_LIMIT : DEFAULT_BODY_LIMIT;
          const body = req.method === "POST" ? await readJson(req, limit) : {};
          const requestConfig = req.headers["x-storydna-demo"] === "true" ? { ...config, apiKey: undefined } : config;
          const response = await handleStoryApiRequest(path, req.method || "GET", body, requestConfig);
          return send(res, response.status, response.payload);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown server error.";
          return send(res, message === "Request body is too large." ? 413 : 400, {
            code: message === "Request body is too large." ? "payload_too_large" : "invalid_json",
            message,
            retryable: false,
          });
        }
      });
    },
  };
}
