import type { ProxyConfig } from "../proxy/types";
import type { ProviderAdapter } from "./base";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { buildAgentDefinitions } from "../proxy/agentDefs";
import { opencodeMcpServer } from "../mcpTools";
import { createPassthroughMcpServer } from "../proxy/passthroughTools";

export class ClaudeAdapter implements ProviderAdapter {
  name = "claude";

  createQueryHandler(config: ProxyConfig) {
    // TODO: Will encapsulate the SDK query and PreToolUse logic from server.ts
    // For now, placeholder that returns the query function bound to config
    return (messages: any[], options: any = {}) => {
      // This will be replaced with full implementation in task 2
      return query({
        messages,
        ...options,
        // model etc from config
      });
    };
  }

  supportsPassthrough(): boolean {
    return true;
  }

  getMcpServer(tools?: any) {
    if (tools && tools.length > 0) {
      return createPassthroughMcpServer(tools);
    }
    return opencodeMcpServer;
  }
}
