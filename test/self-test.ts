/**
 * Self-test script for WiFeed MCP Server
 * Validates schema definitions and tool registrations
 */

import { z } from "zod";
import {
  InsiderTradingInputSchema,
  FinancialRatiosInputSchema,
  AnalysisReportsInputSchema,
  PolicyInterestRateInputSchema,
  InterbankRateInputSchema,
  DepositRateByGroupInputSchema,
  DepositRateByBankInputSchema,
  ExchangeRateInputSchema,
  InternationalCommodityInputSchema,
  DomesticCommodityInputSchema,
  OtherExchangeRateInputSchema,
} from "../src/schemas/index.js";
import { AnalysisReportType, ReportType, CommodityDataType } from "../src/constants.js";

// Test utilities
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error instanceof Error ? error.message : String(error)}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertValid<T>(schema: z.ZodSchema<T>, data: unknown, message?: string) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(message || `Validation failed: ${result.error.message}`);
  }
}

function assertInvalid<T>(schema: z.ZodSchema<T>, data: unknown, message?: string) {
  const result = schema.safeParse(data);
  if (result.success) {
    throw new Error(message || `Expected validation to fail but it passed`);
  }
}

// Run tests
console.log("\n=== WiFeed MCP Server Self-Test ===\n");

// Test 1: Insider Trading Schema with new date filters
console.log("1. Insider Trading Schema:");
test("accepts valid input with code only", () => {
  assertValid(InsiderTradingInputSchema, { code: "VNM" });
});
test("accepts input with date filters", () => {
  assertValid(InsiderTradingInputSchema, {
    code: "HPG",
    from_date: "2024-01-01",
    to_date: "2024-12-31",
    by_time: "created_at",
  });
});
test("accepts input with time filters", () => {
  assertValid(InsiderTradingInputSchema, {
    code: "TCB",
    from_time: "2024-06-01",
    to_time: "2024-06-30",
  });
});
test("rejects invalid date format", () => {
  assertInvalid(InsiderTradingInputSchema, {
    code: "VNM",
    from_date: "01-01-2024", // Wrong format
  });
});
test("rejects invalid by_time value", () => {
  assertInvalid(InsiderTradingInputSchema, {
    code: "VNM",
    by_time: "invalid_value",
  });
});

// Test 2: Financial Ratios Schema with new params
console.log("\n2. Financial Ratios Schema:");
test("accepts valid input with daily type", () => {
  assertValid(FinancialRatiosInputSchema, {
    code: "VNM",
    type: ReportType.DAILY,
    from_date: "2024-01-01",
  });
});
test("accepts input with quarter and year", () => {
  assertValid(FinancialRatiosInputSchema, {
    code: "TCB",
    type: ReportType.QUARTER,
    quy: 3,
    nam: 2024,
  });
});
test("accepts TTM type", () => {
  assertValid(FinancialRatiosInputSchema, {
    code: "HPG",
    type: ReportType.TTM,
  });
});
test("rejects invalid quarter", () => {
  assertInvalid(FinancialRatiosInputSchema, {
    code: "VNM",
    type: ReportType.QUARTER,
    quy: 5, // Invalid quarter
  });
});

// Test 3: Analysis Reports Schema with fixed types
console.log("\n3. Analysis Reports Schema:");
test("accepts company report type (1)", () => {
  assertValid(AnalysisReportsInputSchema, { type: AnalysisReportType.COMPANY });
});
test("accepts industry report type (2)", () => {
  assertValid(AnalysisReportsInputSchema, { type: AnalysisReportType.INDUSTRY });
});
test("accepts macro report type (3)", () => {
  assertValid(AnalysisReportsInputSchema, { type: AnalysisReportType.MACRO });
});
test("accepts strategy report type (4)", () => {
  assertValid(AnalysisReportsInputSchema, { type: AnalysisReportType.STRATEGY });
});
test("accepts with stock code filter", () => {
  assertValid(AnalysisReportsInputSchema, {
    code: "VNM",
    type: AnalysisReportType.COMPANY,
    from_date: "2024-01-01",
  });
});

// Test 4: Macro Data Schemas with date filters
console.log("\n4. Policy Interest Rate Schema:");
test("accepts with date filters", () => {
  assertValid(PolicyInterestRateInputSchema, {
    from_date: "2024-01-01",
    to_date: "2024-12-31",
    by_time: "updated_at",
  });
});

console.log("\n5. Interbank Rate Schema:");
test("accepts with date and time filters", () => {
  assertValid(InterbankRateInputSchema, {
    from_date: "2024-01-01",
    from_time: "2024-01-01",
    to_time: "2024-06-30",
  });
});

console.log("\n6. Deposit Rate by Group Schema:");
test("accepts with all filters", () => {
  assertValid(DepositRateByGroupInputSchema, {
    page: 1,
    limit: 50,
    by_time: "created_at",
    from_date: "2024-01-01",
  });
});

console.log("\n7. Deposit Rate by Bank Schema:");
test("accepts valid term values", () => {
  assertValid(DepositRateByBankInputSchema, { ky_han: 12 });
});
test("accepts with date filters", () => {
  assertValid(DepositRateByBankInputSchema, {
    ky_han: 6,
    from_date: "2024-01-01",
    to_date: "2024-12-31",
  });
});

console.log("\n8. Exchange Rate Schema:");
test("accepts with date filters", () => {
  assertValid(ExchangeRateInputSchema, {
    from_date: "2024-01-01",
    to_date: "2024-12-31",
  });
});

console.log("\n9. Other Exchange Rate Schema:");
test("accepts with all filters", () => {
  assertValid(OtherExchangeRateInputSchema, {
    page: 1,
    limit: 100,
    by_time: "updated_at",
    from_date: "2024-01-01",
  });
});

// Test 5: Commodity Schemas with updated data types
console.log("\n10. International Commodity Schema:");
test("accepts value_today data type", () => {
  assertValid(InternationalCommodityInputSchema, {
    data_type: CommodityDataType.VALUE_TODAY,
  });
});
test("accepts diff_day data type", () => {
  assertValid(InternationalCommodityInputSchema, {
    data_type: CommodityDataType.DIFF_DAY,
  });
});
test("accepts diff_month data type", () => {
  assertValid(InternationalCommodityInputSchema, {
    data_type: CommodityDataType.DIFF_MONTH,
  });
});
test("accepts diff_year data type", () => {
  assertValid(InternationalCommodityInputSchema, {
    data_type: CommodityDataType.DIFF_YEAR,
  });
});
test("accepts with date filters", () => {
  assertValid(InternationalCommodityInputSchema, {
    data_type: CommodityDataType.VALUE_TODAY,
    from_date: "2024-01-01",
    to_date: "2024-12-31",
  });
});

console.log("\n11. Domestic Commodity Schema:");
test("accepts with from_time filter", () => {
  assertValid(DomesticCommodityInputSchema, {
    data_type: CommodityDataType.CHANGE_TODAY,
    from_time: "2024-01-01",
  });
});

// Test 6: Constants validation
console.log("\n12. Constants Validation:");
test("ReportType has DAILY value", () => {
  assertEqual(ReportType.DAILY, "daily");
});
test("AnalysisReportType.COMPANY equals 1", () => {
  assertEqual(AnalysisReportType.COMPANY, 1);
});
test("AnalysisReportType.INDUSTRY equals 2", () => {
  assertEqual(AnalysisReportType.INDUSTRY, 2);
});
test("AnalysisReportType.MACRO equals 3", () => {
  assertEqual(AnalysisReportType.MACRO, 3);
});
test("AnalysisReportType.STRATEGY equals 4", () => {
  assertEqual(AnalysisReportType.STRATEGY, 4);
});
test("CommodityDataType.DIFF_DAY exists", () => {
  assertEqual(CommodityDataType.DIFF_DAY, "diff_day");
});
test("CommodityDataType.DIFF_MONTH exists", () => {
  assertEqual(CommodityDataType.DIFF_MONTH, "diff_month");
});
test("CommodityDataType.DIFF_YEAR exists", () => {
  assertEqual(CommodityDataType.DIFF_YEAR, "diff_year");
});

// Summary
console.log("\n=== Test Summary ===");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  console.log("\n❌ Some tests failed!");
  process.exit(1);
} else {
  console.log("\n✅ All tests passed!");
  process.exit(0);
}
