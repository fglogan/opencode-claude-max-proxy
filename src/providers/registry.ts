import type { ProviderAdapter } from "./base";
import type { ProxyConfig } from "../proxy/types";
import { ClaudeAdapter } from "./claude";
import { GrokAdapter } from "./grok";
import { OpenAICompatibleAdapter } from "./openaiCompatible";

export { OpenAICompatibleAdapter };

const providers = new Map<string, ProviderAdapter>();

export function registerProvider(name: string, adapter: ProviderAdapter): void {
  providers.set(name.toLowerCase(), adapter);
}

export function getProviderAdapter(name: string = "claude"): ProviderAdapter {
  const key = name.toLowerCase();
  if (providers.has(key)) {
    return providers.get(key)!;
  }
  
  if (key === "grok" || key === "xai") {
    const grok = new GrokAdapter();
    registerProvider(key, grok);
    return grok;
  }

  if (key === "openai" || key === "groq" || key === "ollama" || key === "bedrock") {
    const adapter = new OpenAICompatibleAdapter();
    registerProvider(key, adapter);
    return adapter;
  }
  
  // Default to Claude if not registered or unknown
  if (key !== "claude") {
    console.warn(`Provider ${name} not found, falling back to Claude`);
  }
  
  const claude = new ClaudeAdapter();
  registerProvider("claude", claude);
  return claude;
}

export function initializeProviders(): void {
  if (!providers.has("claude")) {
    registerProvider("claude", new ClaudeAdapter());
  }
}

// Clean imports and no more require() hacks or duplicate type exports
// Adapters are lightweight with no internal state, so new instances are fine and types resolve cleanly
