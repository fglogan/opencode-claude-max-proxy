import type { ProxyConfig } from "../proxy/types";
import type { ProviderAdapter } from "./base";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { buildAgentDefinitions } from "../proxy/agentDefs";
import { opencodeMcpServer } from "../mcpTools";
import { createPassthroughMcpServer } from "../proxy/passthroughTools";

export class ClaudeAdapter implements ProviderAdapter {
  name = "claude";

  createQueryHandler(config: ProxyConfig) {
    // Encapsulates SDK query logic (moved from server.ts per modular refactor)
    // PreToolUse hook, agentDefs, passthrough logic to be moved here in future iterations
    // Keeps session, streaming, error logic in shared server.ts as required
    return (queryArgs: any) => {
      // TODO: merge config into queryArgs for provider-specific settings
      return query(queryArgs);
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
