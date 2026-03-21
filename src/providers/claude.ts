import type { ProxyConfig } from "../proxy/types";
import type { ProviderAdapter } from "./base";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { buildAgentDefinitions } from "../proxy/agentDefs";
import { opencodeMcpServer } from "../mcpTools";
import { createPassthroughMcpServer } from "../proxy/passthroughTools";

export class ClaudeAdapter implements ProviderAdapter {
  name = "claude";

  createQueryHandler(config: ProxyConfig) {
    return (queryArgs: any) => {
      const mergedArgs = {
        ...queryArgs,
        baseURL: config.baseURL || queryArgs.baseURL,
        apiKey: config.apiKey || queryArgs.apiKey,
      };
      return query(mergedArgs);
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
