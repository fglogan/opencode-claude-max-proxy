export interface ProxyConfig {
  port: number
  host: string
  debug: boolean
  idleTimeoutSeconds: number
  provider?: string
}

export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  port: parseInt(process.env.CLAUDE_PROXY_PORT || "3456", 10),
  host: (() => {
    const envHost = process.env.CLAUDE_PROXY_HOST;
    if (envHost) return envHost;
    if (process.env.NODE_ENV === "production") return "0.0.0.0";
    return "127.0.0.1";
  })(),
  debug: process.env.CLAUDE_PROXY_DEBUG === "1",
  idleTimeoutSeconds: parseInt(process.env.CLAUDE_PROXY_IDLE_TIMEOUT_SECONDS || "120", 10)
}
