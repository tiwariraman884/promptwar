import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logger.error calls console.error", () => {
    logger.error("test error", { requestId: "req_123" });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("logger.error includes the message", () => {
    logger.error("Database connection failed");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Database connection failed")
    );
  });

  it("logger.error includes requestId in output", () => {
    logger.error("API failed", { requestId: "req_abc" });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("req_abc")
    );
  });

  it("logger.warn calls console.warn in non-test env", () => {
    const origEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "development";
    logger.warn("Rate limit approaching");
    expect(consoleWarnSpy).toHaveBeenCalled();
    (process.env as Record<string, string>).NODE_ENV = origEnv;
  });

  it("logger.info calls console.info in development", () => {
    const origEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "development";
    logger.info("Entry created", { userId: "usr_123" });
    expect(consoleInfoSpy).toHaveBeenCalled();
    (process.env as Record<string, string>).NODE_ENV = origEnv;
  });

  it("logger.debug calls console.debug in development", () => {
    const origEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "development";
    logger.debug("Trace info");
    expect(consoleDebugSpy).toHaveBeenCalled();
    (process.env as Record<string, string>).NODE_ENV = origEnv;
  });

  it("logger does not throw on any log level", () => {
    expect(() => logger.debug("d")).not.toThrow();
    expect(() => logger.info("i")).not.toThrow();
    expect(() => logger.warn("w")).not.toThrow();
    expect(() => logger.error("e")).not.toThrow();
  });

  it("logger.error handles Error objects in context", () => {
    const err = new Error("something broke");
    logger.error("Caught error", { error: err });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("logger.error handles non-Error objects in context", () => {
    logger.error("Caught error", { error: "string error" });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("production mode outputs JSON format", () => {
    const origEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "production";
    logger.error("prod error", { requestId: "req_prod" });
    const call = consoleErrorSpy.mock.calls[0][0] as string;
    // Production should output valid JSON
    expect(() => JSON.parse(call)).not.toThrow();
    const parsed = JSON.parse(call);
    expect(parsed.level).toBe("error");
    expect(parsed.message).toBe("prod error");
    expect(parsed.requestId).toBe("req_prod");
    (process.env as Record<string, string>).NODE_ENV = origEnv;
  });

  it("production mode includes timestamp", () => {
    const origEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "production";
    logger.error("ts test");
    const call = consoleErrorSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(call);
    expect(parsed.timestamp).toBeDefined();
    expect(new Date(parsed.timestamp).getTime()).not.toBeNaN();
    (process.env as Record<string, string>).NODE_ENV = origEnv;
  });

  it("production mode formats Error objects without stack", () => {
    const origEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "production";
    const err = new Error("db timeout");
    logger.error("DB error", { error: err });
    const call = consoleErrorSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(call);
    expect(parsed.error.name).toBe("Error");
    expect(parsed.error.message).toBe("db timeout");
    expect(parsed.error.stack).toBeUndefined(); // No stack in production
    (process.env as Record<string, string>).NODE_ENV = origEnv;
  });

  it("development mode includes duration in output", () => {
    const origEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "development";
    logger.info("API call", { durationMs: 42 });
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining("42ms")
    );
    (process.env as Record<string, string>).NODE_ENV = origEnv;
  });
});
