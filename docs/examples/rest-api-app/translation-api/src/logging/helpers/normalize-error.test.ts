import { describe, expect, it } from "vitest";
import { normalizeError } from "./normalize-error";

describe("normalizeError", () => {
  describe("null or undefined inputs", () => {
    it("should handle null input", () => {
      const result = normalizeError(null);
      expect(result).toEqual({ error: "Unknown error (null or undefined)" });
    });

    it("should handle undefined input", () => {
      const result = normalizeError(undefined);
      expect(result).toEqual({ error: "Unknown error (null or undefined)" });
    });
  });

  describe("status field handling", () => {
    it("should extract status from top-level status property", () => {
      const error = { status: 404, message: "Not Found" };
      const result = normalizeError(error);
      expect(result.status).toBe(404);
    });

    it("should extract status from nested error.status", () => {
      const error = { error: { status: 500 } };
      const result = normalizeError(error);
      expect(result.status).toBe(500);
    });

    it("should ignore non-numeric status values", () => {
      const error = { status: "bad", message: "Error" };
      const result = normalizeError(error);
      expect(result.status).toBeUndefined();
    });
  });

  describe("message/error field handling", () => {
    it("should extract message from top-level message property", () => {
      const error = { message: "Something went wrong" };
      const result = normalizeError(error);
      expect(result.error).toBe("Something went wrong");
    });

    it("should extract message from top-level error property", () => {
      const error = { error: "Something failed" };
      const result = normalizeError(error);
      expect(result.error).toBe("Something failed");
    });

    it("should extract message from nested error.message", () => {
      const error = { error: { message: "Internal failure" } };
      const result = normalizeError(error);
      expect(result.error).toBe("Internal failure");
    });

    it("should use String() for non-string error values", () => {
      const error = { error: 123 };
      const result = normalizeError(error);
      expect(result.error).toBe("123");
    });
  });

  describe("trace field handling", () => {
    it("should extract trace from top-level trace property", () => {
      const traceData = ["line1", "line2"];
      const error = { message: "Error", trace: traceData };
      const result = normalizeError(error);
      expect(result.trace).toBe(traceData);
    });

    it("should extract trace from stack property", () => {
      const stackTrace = "Error: something\n  at function1\n  at function2";
      const error = { message: "Error", stack: stackTrace };
      const result = normalizeError(error);
      expect(result.trace).toBe(stackTrace);
    });

    it("should extract trace from nested error.trace", () => {
      const traceData = { file: "app.js", line: 42 };
      const error = { error: { trace: traceData } };
      const result = normalizeError(error);
      expect(result.trace).toBe(traceData);
    });
  });

  describe("ApiError pattern handling", () => {
    it("should properly handle ApiError with details", () => {
      const error = {
        status: 429,
        message: "Too Many Requests",
        details: { retryAfter: 30 },
      };
      const result = normalizeError(error);
      expect(result).toEqual({
        status: 429,
        error: "Too Many Requests",
        trace: { retryAfter: 30 },
      });
    });
  });

  describe("primitive value handling", () => {
    it("should handle string input", () => {
      const result = normalizeError("Something broke");
      expect(result).toEqual({ error: "Something broke" });
    });

    it("should handle number input", () => {
      const result = normalizeError(404);
      expect(result).toEqual({ error: "404" });
    });
  });

  describe("complex object handling", () => {
    it("should handle Error instances", () => {
      const errorInstance = new Error("Standard error");
      const result = normalizeError(errorInstance);
      expect(result.error).toBe("Standard error");
      expect(result.trace).toBeDefined();
    });

    it("should handle custom error objects", () => {
      class CustomError extends Error {
        status: number;
        constructor(message: string, status: number) {
          super(message);
          this.name = "CustomError";
          this.status = status;
        }
      }

      const customErr = new CustomError("Custom problem", 400);
      const result = normalizeError(customErr);

      expect(result.error).toBe("Custom problem");
      expect(result.status).toBe(400);
      expect(result.trace).toBeDefined();
    });
  });
});
