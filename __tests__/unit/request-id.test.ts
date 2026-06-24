import { describe, it, expect } from "vitest";
import { generateRequestId, getOrCreateRequestId } from "@/lib/request-id";

describe("generateRequestId", () => {
  it("returns a string starting with req_ prefix", () => {
    const id = generateRequestId();
    expect(id).toMatch(/^req_/);
  });

  it("generates unique IDs on successive calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });

  it("returns a non-empty string", () => {
    const id = generateRequestId();
    expect(id.length).toBeGreaterThan(4); // "req_" + something
  });
});

describe("getOrCreateRequestId", () => {
  it("returns existing request ID from headers if valid", () => {
    const headers = new Headers({ "x-request-id": "req_existing-id" });
    const id = getOrCreateRequestId(headers);
    expect(id).toBe("req_existing-id");
  });

  it("generates new ID if header is missing", () => {
    const headers = new Headers();
    const id = getOrCreateRequestId(headers);
    expect(id).toMatch(/^req_/);
  });

  it("generates new ID if header does not start with req_ prefix", () => {
    const headers = new Headers({ "x-request-id": "invalid-format" });
    const id = getOrCreateRequestId(headers);
    expect(id).toMatch(/^req_/);
    expect(id).not.toBe("invalid-format");
  });

  it("returns the same ID when called with the same valid header", () => {
    const headers = new Headers({ "x-request-id": "req_test-12345" });
    const id1 = getOrCreateRequestId(headers);
    const id2 = getOrCreateRequestId(headers);
    expect(id1).toBe(id2);
  });
});
