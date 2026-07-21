import { handleStoryApiRequest } from "../../server/router";

const DEFAULT_BODY_LIMIT = 100_000;
const COMMENTARY_BODY_LIMIT = 5_500_000;

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export default async function storyApi(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "");
  const method = request.method.toUpperCase();

  if (method === "POST" && !request.headers.get("content-type")?.includes("application/json")) {
    return json(415, { code: "invalid_content_type", message: "Send JSON.", retryable: false });
  }

  try {
    let body: unknown = {};
    if (method === "POST") {
      const text = await request.text();
      const limit = path === "/api/story/commentary" ? COMMENTARY_BODY_LIMIT : DEFAULT_BODY_LIMIT;
      if (text.length > limit) return json(413, { code: "payload_too_large", message: "Request body is too large.", retryable: false });
      body = JSON.parse(text || "{}");
    }

    const response = await handleStoryApiRequest(path, method, body, {
      apiKey: process.env.OPENAI_API_KEY?.trim() || undefined,
      model: process.env.OPENAI_MODEL?.trim() || "gpt-5.6",
    });
    return json(response.status, response.payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return json(400, { code: "invalid_json", message, retryable: false });
  }
}

export const config = {
  path: "/api/story/*",
};
