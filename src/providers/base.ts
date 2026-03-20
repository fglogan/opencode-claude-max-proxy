import type { ProxyConfig } from "../proxy/types";

export interface ProviderAdapter {
  name: string;
  createQueryHandler(config: ProxyConfig): any;
  supportsPassthrough(): boolean;
  getMcpServer(tools?: any): any;
}

export interface ProviderConfig extends ProxyConfig {
  provider?: string;
}
