import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http"
import { resourceFromAttributes } from "@opentelemetry/resources"
import {
  type Counter,
  type Histogram,
  type UpDownCounter,
  type Meter,
  metrics,
} from "@opentelemetry/api"

const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318"
const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || "opencode-claude-max-proxy"
const OTEL_EXPORTER_OTLP_HEADERS = process.env.OTEL_EXPORTER_OTLP_HEADERS

let meterProvider: MeterProvider | null = null
let _meter: Meter | null = null
let _requestCounter: Counter | null = null
let _requestDuration: Histogram | null = null
let _activeSessions: UpDownCounter | null = null
let _errorCounter: Counter | null = null

export function initMetrics(): MeterProvider {
  const headers: Record<string, string> = {}
  if (OTEL_EXPORTER_OTLP_HEADERS) {
    for (const pair of OTEL_EXPORTER_OTLP_HEADERS.split(",")) {
      const [key, value] = pair.split("=").map(s => s.trim())
      if (key && value) headers[key] = value
    }
  }

  const metricExporter = new OTLPMetricExporter({
    url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  })

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10_000,
  })

  const resource = resourceFromAttributes({
    "service.name": OTEL_SERVICE_NAME,
    "service.version": process.env.npm_package_version || "1.0.0",
  })

  meterProvider = new MeterProvider({
    readers: [metricReader],
    resource,
  })

  metrics.setGlobalMeterProvider(meterProvider)
  _meter = metrics.getMeter(OTEL_SERVICE_NAME)

  _requestCounter = _meter.createCounter("http_requests_total", {
    description: "Total number of HTTP requests",
  })

  _requestDuration = _meter.createHistogram("http_request_duration_ms", {
    description: "HTTP request duration in milliseconds",
    unit: "ms",
  })

  _activeSessions = _meter.createUpDownCounter("active_sessions", {
    description: "Number of currently active sessions",
  })

  _errorCounter = _meter.createCounter("errors_total", {
    description: "Total number of errors",
  })

  return meterProvider
}

export function getMeter(): Meter {
  if (!_meter) {
    _meter = metrics.getMeter(OTEL_SERVICE_NAME)
  }
  return _meter
}

export interface RequestMetrics {
  method: string
  mode: string
  statusCode: number
  durationMs: number
  error?: string
}

export function recordRequest(metrics: RequestMetrics): void {
  const { method, mode, statusCode, durationMs, error } = metrics

  _requestCounter?.add(1, {
    method,
    mode,
    status_code: String(statusCode),
  })

  _requestDuration?.record(durationMs, {
    method,
    mode,
  })

  if (error) {
    _errorCounter?.add(1, {
      type: error,
      mode,
    })
  }
}

export function incrementActiveSessions(mode: string): void {
  _activeSessions?.add(1, { mode })
}

export function decrementActiveSessions(mode: string): void {
  _activeSessions?.add(-1, { mode })
}

export const observabilityMetrics = {
  recordRequest,
  incrementActiveSessions,
  decrementActiveSessions,
}
