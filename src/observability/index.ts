import { NodeSDK } from "@opentelemetry/sdk-node"
import { MeterProvider } from "@opentelemetry/sdk-metrics"
import { initTracing, getTracer, tracer } from "./tracing.js"
import {
  initMetrics,
  getMeter,
  observabilityMetrics,
  recordRequest,
  incrementActiveSessions,
  decrementActiveSessions,
} from "./metrics.js"
import { claudeLog } from "../logger.js"

let initialized = false

export function initObservability(): { tracing: NodeSDK; metrics: MeterProvider } {
  if (initialized) {
    return { tracing: null as unknown as NodeSDK, metrics: null as unknown as MeterProvider }
  }
  initialized = true

  const tracingSdk = initTracing()
  const metricsProvider = initMetrics()

  process.on("SIGTERM", async () => {
    try {
      await tracingSdk?.shutdown()
      await metricsProvider?.shutdown()
      claudeLog("observability.shutdown", {})
    } catch (error) {
      claudeLog("observability.shutdown_error", {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  process.on("SIGINT", async () => {
    try {
      await tracingSdk?.shutdown()
      await metricsProvider?.shutdown()
      claudeLog("observability.shutdown", {})
    } catch (error) {
      claudeLog("observability.shutdown_error", {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  claudeLog("observability.initialized", {
    service: process.env.OTEL_SERVICE_NAME || "opencode-claude-max-proxy",
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318",
  })

  return { tracing: tracingSdk, metrics: metricsProvider }
}

export { tracer, observabilityMetrics, recordRequest, incrementActiveSessions, decrementActiveSessions }
