import type { ProviderAdapter } from "./base";
import type { ProxyConfig } from "../proxy/types";

const providers = new Map<string, ProviderAdapter>();

export function registerProvider(name: string, adapter: ProviderAdapter): void {
  providers.set(name.toLowerCase(), adapter);
}

export function getProviderAdapter(name: string = "claude"): ProviderAdapter {
  const key = name.toLowerCase();
  if (providers.has(key)) {
    return providers.get(key)!;
  }
  
  // Default to Claude if not registered or unknown
  if (key !== "claude") {
    console.warn(`Provider ${name} not found, falling back to Claude`);
  }
  
  // Lazy init Claude
  const claude = getClaudeAdapter();
  registerProvider("claude", claude);
  return claude;
}

import type { ClaudeAdapter } from "./claude";

// Lazy load Claude adapter 
let claudeAdapterInstance: ProviderAdapter | null = null;

export function getClaudeAdapter(): ProviderAdapter {
  if (!claudeAdapterInstance) {
    // Use import for class (TS will handle)
    const ClaudeAdapterClass = require("./claude").ClaudeAdapter as new () => ProviderAdapter;
    claudeAdapterInstance = new ClaudeAdapterClass();
  }
  return claudeAdapterInstance!;
}

// Register default on first use
export function initializeProviders(): void {
  if (!providers.has("claude")) {
    registerProvider("claude", getClaudeAdapter());
  }
}

export type { ClaudeAdapter } from "./claude";
