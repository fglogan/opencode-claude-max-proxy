import type { ProxyConfig } from "../proxy/types";
import type { ProviderAdapter } from "./base";
import OpenAI from "openai";
import { claudeLog } from "../logger";
import { opencodeMcpServer } from "../mcpTools";
import { createPassthroughMcpServer } from "../proxy/passthroughTools";

export class GrokAdapter implements ProviderAdapter {
  name = "grok";

  createQueryHandler(config: ProxyConfig) {
    const apiKey = process.env.XAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("XAI_API_KEY environment variable is required for Grok provider");
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: "https://api.x.ai/v1",
    });

    // Returns a handler compatible with server.ts expectations (yields assistant messages)
    return async function* (queryArgs: any) {
      const { prompt, options = {} } = queryArgs;
      const model = options.model?.includes("grok") ? options.model : "grok-beta";
      
      claudeLog?.("upstream.start", { 
        mode: options.stream ? "stream" : "non_stream", 
        model, 
        provider: "grok" 
      });

      try {
        const stream = await openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: "You are Grok, a helpful and maximally truthful AI." },
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
            // Yield in format expected by server.ts loop
            yield {
              type: "assistant",
              message: {
                content: [{
                  type: "text",
                  text: delta
                }]
              },
              session_id: "grok-" + Date.now()
            };
          }
        }

        // Final completion message
        yield {
          type: "assistant",
          message: {
            content: [{
              type: "text",
              text: ""
            }]
          },
          session_id: "grok-" + Date.now()
        };

        claudeLog?.("upstream.completed", { 
          mode: options.stream ? "stream" : "non_stream", 
          model, 
          provider: "grok",
          tokens: fullContent.length 
        });
      } catch (error) {
        claudeLog?.("upstream.failed", { 
          model, 
          provider: "grok", 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw error;
      }
    };
  }

  supportsPassthrough(): boolean {
    return false; // Grok implementation has limited MCP/tool support compared to Claude
  }

  getMcpServer(tools?: any) {
    // Delegate to shared logic where possible (basic fallback)
    if (tools && tools.length > 0) {
      return createPassthroughMcpServer(tools);
    }
    return opencodeMcpServer;
  }
}

// Note: claudeLog is from logger - assumed available in scope or will be handled in server
// This is a translation layer from xAI OpenAI-compatible API to the expected Claude SDK message shapes
