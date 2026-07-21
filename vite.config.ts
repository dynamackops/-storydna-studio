import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { storyApiPlugin } from "./server/middleware";
import { resolveOpenAIModel } from "./server/model";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      storyApiPlugin({
        apiKey: env.OPENAI_API_KEY,
        model: resolveOpenAIModel(env.OPENAI_MODEL),
      }),
    ],
    server: {
      host: "127.0.0.1",
      port: 4173,
    },
    preview: {
      host: "127.0.0.1",
      port: 4173,
    },
  };
});
