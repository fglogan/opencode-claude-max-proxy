import { NodeSDK } from "@opentelemetry/sdk-node"
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { resourceFromAttributes } from "@opentelemetry/resources"
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions"
import { trace, type Span, SpanStatusCode, type Tracer, type SpanKind } from "@opentelemetry/api"

const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318"
const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || "opencode-claude-max-proxy"
const OTEL_EXPORTER_OTLP_HEADERS = process.env.OTEL_EXPORTER_OTLP_HEADERS

let sdk: NodeSDK | null = null
let _tracer: Tracer | null = null

export function initTracing(): NodeSDK {
  const headers: Record<string, string> = {}
  if (OTEL_EXPORTER_OTLP_HEADERS) {
    for (const pair of OTEL_EXPORTER_OTLP_HEADERS.split(",")) {
      const [key, value] = pair.split("=").map(s => s.trim())
      if (key && value) headers[key] = value
    }
  }

  const traceExporter = new OTLPTraceExporter({
    url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  })

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: OTEL_SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version || "1.0.0",
  })

  sdk = new NodeSDK({
    resource,
    spanProcessors: [new BatchSpanProcessor(traceExporter)],
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
    ],
  })

  sdk.start()
  _tracer = trace.getTracer(OTEL_SERVICE_NAME)

  return sdk
}

export function createSpan<R>(
  tracer: Tracer,
  name: string,
  fn: (span: Span) => R,
  kind: SpanKind = 0
): R {
  return tracer.startActiveSpan(name, { kind }, (span) => {
    try {
      const result = fn(span)
      if (result instanceof Promise) {
        return result
          .then((resolved) => {
            span.setStatus({ code: SpanStatusCode.OK })
            span.end()
            return resolved as R
          })
          .catch((error: Error) => {
            span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
            span.recordException(error)
            span.end()
            throw error
          }) as unknown as R
      }
      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
      return result
    } catch (error) {
      if (error instanceof Error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
        span.recordException(error)
      }
      span.end()
      throw error
    }
  })
}

export function getTracer(): Tracer {
  if (!_tracer) {
    _tracer = trace.getTracer(OTEL_SERVICE_NAME)
  }
  return _tracer
}

export const tracer = {
  get createSpan() {
    return (name: string, fn: (span: Span) => unknown, kind?: SpanKind) =>
      createSpan(getTracer(), name, fn as (span: Span) => unknown, kind)
  },
  startSpan: (name: string, kind?: SpanKind) => {
    const s = getTracer().startSpan(name, { kind })
    return {
      span: s,
      end: (attributes?: Record<string, string | number | boolean>) => {
        if (attributes) {
          for (const [k, v] of Object.entries(attributes)) {
            s.setAttribute(k, v)
          }
        }
        s.end()
      },
      recordException: (error: Error) => {
        s.recordException(error)
        s.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
      },
      setStatus: (code: SpanStatusCode, message?: string) => {
        s.setStatus({ code, message })
      },
    }
  },
}
