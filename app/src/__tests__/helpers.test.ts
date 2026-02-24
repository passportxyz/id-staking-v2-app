import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatAmount, formatSeconds, formatDate, generateUID, isServerOnMaintenance } from "../utils/helpers";

// ----------------------------------------------------------------
// formatAmount — converts wei strings to ether with 2 decimal places
// ----------------------------------------------------------------
describe("formatAmount", () => {
  it("converts 1 ETH in wei to 1", () => {
    const result = formatAmount("1000000000000000000");
    expect(result).toBe(1);
  });

  it("converts 0.5 ETH in wei to 0.5", () => {
    const result = formatAmount("500000000000000000");
    expect(result).toBe(0.5);
  });

  it("converts zero wei to 0", () => {
    const result = formatAmount("0");
    expect(result).toBe(0);
  });

  it("converts 2.75 ETH in wei correctly", () => {
    const result = formatAmount("2750000000000000000");
    expect(result).toBe(2.75);
  });

  it("rounds to 2 decimal places", () => {
    // 1.23456 ETH in wei = 1234560000000000000
    const result = formatAmount("1234560000000000000");
    expect(result).toBe(1.23);
  });

  it("returns a number type, not a string", () => {
    const result = formatAmount("1000000000000000000");
    expect(typeof result).toBe("number");
  });
});

// ----------------------------------------------------------------
// formatSeconds — converts seconds to { year, month, weeks, day }
// ----------------------------------------------------------------
describe("formatSeconds", () => {
  it("converts 1 year in seconds", () => {
    const oneYear = 365.25 * 24 * 60 * 60; // ~31557600
    const result = formatSeconds(oneYear);
    expect(result.year).toBe(1);
  });

  it("converts 90 days in seconds", () => {
    const ninetyDays = 90 * 24 * 60 * 60;
    const result = formatSeconds(ninetyDays);
    expect(result.year).toBe(0);
    // 90 days is roughly 2-3 months depending on moment's calculation
    expect(result.month).toBeGreaterThanOrEqual(2);
    expect(result.month).toBeLessThanOrEqual(3);
    expect(result.weeks).toBe(12);
  });

  it("converts a small duration (1 day)", () => {
    const oneDay = 24 * 60 * 60;
    const result = formatSeconds(oneDay);
    expect(result.year).toBe(0);
    expect(result.month).toBe(0);
    expect(result.weeks).toBe(0);
    expect(result.day).toBe(1);
  });

  it("converts 0 seconds to all zeros", () => {
    const result = formatSeconds(0);
    expect(result).toEqual({ year: 0, month: 0, weeks: 0, day: 0 });
  });

  it("returns the correct shape with all four keys", () => {
    const result = formatSeconds(100);
    expect(result).toHaveProperty("year");
    expect(result).toHaveProperty("month");
    expect(result).toHaveProperty("weeks");
    expect(result).toHaveProperty("day");
  });

  it("handles 7 days as 1 week", () => {
    const sevenDays = 7 * 24 * 60 * 60;
    const result = formatSeconds(sevenDays);
    expect(result.weeks).toBe(1);
  });
});

// ----------------------------------------------------------------
// formatDate — formats a Date to "MMM DD, YYYY"
// ----------------------------------------------------------------
describe("formatDate", () => {
  it("formats a known date correctly", () => {
    // Jan 15, 2024
    const date = new Date(2024, 0, 15);
    const result = formatDate(date);
    expect(result).toBe("Jan 15, 2024");
  });

  it("formats December 25, 2023", () => {
    const date = new Date(2023, 11, 25);
    const result = formatDate(date);
    expect(result).toBe("Dec 25, 2023");
  });

  it("formats single-digit days with zero-padding", () => {
    const date = new Date(2024, 5, 3);
    const result = formatDate(date);
    expect(result).toBe("Jun 03, 2024");
  });
});

// ----------------------------------------------------------------
// generateUID — generates a random string of specified length
// ----------------------------------------------------------------
describe("generateUID", () => {
  it("returns a string of the correct length", () => {
    const uid = generateUID(10);
    expect(uid).toHaveLength(10);
  });

  it("returns a string of length 20", () => {
    const uid = generateUID(20);
    expect(uid).toHaveLength(20);
  });

  it("does not contain + or / characters (base64 specials are stripped)", () => {
    // Run multiple times to reduce flakiness
    for (let i = 0; i < 50; i++) {
      const uid = generateUID(32);
      expect(uid).not.toMatch(/[+/]/);
    }
  });

  it("returns only alphanumeric characters", () => {
    for (let i = 0; i < 50; i++) {
      const uid = generateUID(32);
      expect(uid).toMatch(/^[A-Za-z0-9]+$/);
    }
  });

  it("generates different values on successive calls", () => {
    const uid1 = generateUID(16);
    const uid2 = generateUID(16);
    expect(uid1).not.toBe(uid2);
  });
});

// ----------------------------------------------------------------
// isServerOnMaintenance — checks NEXT_PUBLIC_MAINTENANCE_MODE_ON
// ----------------------------------------------------------------
describe("isServerOnMaintenance", () => {
  const originalEnv = process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON;

  afterEach(() => {
    // Restore original env after each test
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON;
    } else {
      process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON = originalEnv;
    }
  });

  it("returns true when current time is within the maintenance window", () => {
    const now = new Date();
    const start = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON = JSON.stringify([start.toISOString(), end.toISOString()]);

    expect(isServerOnMaintenance()).toBe(true);
  });

  it("returns false when current time is outside (after) the maintenance window", () => {
    const now = new Date();
    const start = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    const end = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON = JSON.stringify([start.toISOString(), end.toISOString()]);

    expect(isServerOnMaintenance()).toBe(false);
  });

  it("returns false when current time is outside (before) the maintenance window", () => {
    const now = new Date();
    const start = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now
    const end = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON = JSON.stringify([start.toISOString(), end.toISOString()]);

    expect(isServerOnMaintenance()).toBe(false);
  });

  it("returns false when the env var is not set", () => {
    delete process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON;
    expect(isServerOnMaintenance()).toBe(false);
  });

  it("returns false when the env var contains invalid JSON", () => {
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE_ON = "not-valid-json";
    expect(isServerOnMaintenance()).toBe(false);
  });
});

// ----------------------------------------------------------------
// Verify createSignedPayload is REMOVED (dead code removal)
// ----------------------------------------------------------------
describe("createSignedPayload removal", () => {
  it("is not exported from helpers", async () => {
    const helpers = await import("../utils/helpers");
    expect((helpers as Record<string, unknown>).createSignedPayload).toBeUndefined();
  });
});
