/**
 * Structured Logger
 *
 * Production-grade structured JSON logger that is:
 *   - Environment-aware (silent in test, pretty in dev, JSON in production)
 *   - Sentry-ready (structured fields for easy integration)
 *   - Context-enriched (requestId, userId, path, duration)
 *   - Non-throwing (never crashes the app)
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("Entry created", { requestId: "req_abc", userId: "usr_123", kgCo2e: 3.5 });
 *   logger.error("Database error", { error: err, path: "/api/entries" });
 */

/* ─── Types ─── */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  /** Unique request identifier for tracing */
  requestId?: string;
  /** User ID performing the action */
  userId?: string;
  /** API path or page route */
  path?: string;
  /** Duration in milliseconds */
  durationMs?: number;
  /** Error object (for error-level logs) */
  error?: unknown;
  /** Any additional structured fields */
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
}

/* ─── Configuration ─── */

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  if (process.env.NODE_ENV === "test") return "error"; // Only errors in tests
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL as LogLevel;
  if (process.env.NODE_ENV === "production") return "info";
  return "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[getMinLevel()];
}

/* ─── Formatters ─── */

function formatError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    };
  }
  return { message: String(err) };
}

function formatEntry(entry: LogEntry): string {
  const { timestamp, level, message, context } = entry;

  // Production: structured JSON for log aggregators
  if (process.env.NODE_ENV === "production") {
    const serialized: Record<string, unknown> = {
      timestamp,
      level,
      message,
      ...context,
    };
    if (context.error) {
      serialized.error = formatError(context.error);
    }
    return JSON.stringify(serialized);
  }

  // Development: human-readable format
  const prefix = `[${level.toUpperCase().padEnd(5)}]`;
  const reqId = context.requestId ? ` (${context.requestId})` : "";
  const duration = context.durationMs ? ` ${context.durationMs}ms` : "";
  return `${prefix}${reqId} ${message}${duration}`;
}

/* ─── Logger Instance ─── */

function log(level: LogLevel, message: string, context: LogContext = {}): void {
  if (!shouldLog(level)) return;

  try {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    const formatted = formatEntry(entry);

    switch (level) {
      case "debug":
        // eslint-disable-next-line no-console
        console.debug(formatted);
        break;
      case "info":
        // eslint-disable-next-line no-console
        console.info(formatted);
        break;
      case "warn":
        // eslint-disable-next-line no-console
        console.warn(formatted);
        break;
      case "error":
        // eslint-disable-next-line no-console
        console.error(formatted);
        break;
    }
  } catch {
    // Never throw from logger — silent fallback
  }
}

/**
 * Structured logger for GreenStep India.
 *
 * @example
 * logger.info("Entry created", { requestId, userId, kgCo2e: 3.5 });
 * logger.error("DB query failed", { error: err, path: "/api/entries" });
 * logger.warn("Rate limit approached", { requestId, remaining: 2 });
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
} as const;
