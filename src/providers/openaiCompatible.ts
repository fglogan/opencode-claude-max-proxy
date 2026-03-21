import type { ProxyConfig } from "../proxy/types";
import type { ProviderAdapter } from "./base";
import OpenAI from "openai";
import { claudeLog } from "../logger";
import { opencodeMcpServer } from "../mcpTools";
import { createPassthroughMcpServer } from "../proxy/passthroughTools";

export class OpenAICompatibleAdapter implements ProviderAdapter {
  name = "openai-compatible";

  createQueryHandler(config: ProxyConfig) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("API key is required for OpenAI-compatible provider");
    }

    const baseURL = config.baseURL || "https://api.openai.com/v1";

    const openai = new OpenAI({
      apiKey,
      baseURL,
    });

    return async function* (queryArgs: any) {
      const { prompt, options = {} } = queryArgs;
      const model = options.model || "gpt-4o";

      claudeLog?.("upstream.start", {
        mode: options.stream ? "stream" : "non_stream",
        model,
        provider: "openai-compatible"
      });

      try {
        const stream = await openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: prompt }
          ],
          stream: true,
          max_tokens: 4096,
          temperature: 0.7,
        });

        let fullContent = "";
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullContent += delta;
            yield {
              type: "assistant",
              message: {
                content: [{
                  type: "text",
                  text: delta
                }]
              },
              session_id: "openai-" + Date.now()
            };
          }
        }

        yield {
          type: "assistant",
          message: {
            content: [{
              type: "text",
              text: ""
            }]
          },
          session_id: "openai-" + Date.now()
        };

        claudeLog?.("upstream.completed", {
          mode: options.stream ? "stream" : "non_stream",
          model,
          provider: "openai-compatible",
          tokens: fullContent.length
        });
      } catch (error) {
        claudeLog?.("upstream.failed", {
          model,
          provider: "openai-compatible",
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    };
  }

  supportsPassthrough(): boolean {
    return false;
  }

  getMcpServer(tools?: any) {
    if (tools && tools.length > 0) {
      return createPassthroughMcpServer(tools);
    }
    return opencodeMcpServer;
  }
}
