/**
 * API Integration Test for WiFeed MCP Server
 * Tests actual API calls to verify functionality
 */

import "dotenv/config";
import { getApiClient } from "../src/services/api-client.js";
import type { AnalysisReport, PaginatedResponse } from "../src/types.js";

async function runApiTests() {
  console.log("\n=== WiFeed API Integration Tests ===\n");

  const client = getApiClient();
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`  ✗ ${name}`);
      console.log(`    Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  // Test 1: Financial Ratios with new params
  console.log("1. Financial Ratios with date params:");
  await test("fetches quarterly ratios with quy/nam params", async () => {
    const response = await client.request<any[]>(
      "/tai-chinh-doanh-nghiep/v2/chi-so-tai-chinh",
      { code: "VNM", type: "quarter", quy: 3, nam: 2024 }
    );
    if (!response || response.length === 0) {
      throw new Error("No data returned");
    }
    console.log(`      Got ${response.length} records`);
  });

  // Test 2: Insider Trading with date filters
  console.log("\n2. Insider Trading with date filters:");
  await test("fetches insider trading with from_date", async () => {
    const response = await client.request<PaginatedResponse<any>>(
      "/thong-tin-co-phieu/giao-dich-noi-bo",
      { code: "VNM", "from-date": "2024-01-01", limit: 5 }
    );
    if (!response || !response.data) {
      throw new Error("No data returned");
    }
    console.log(`      Got ${response.data.length} records`);
  });

  // Test 3: Analysis Reports with new types
  console.log("\n3. Analysis Reports with new types:");
  await test("fetches company reports (type=1)", async () => {
    const response = await client.request<PaginatedResponse<AnalysisReport>>(
      "/bao-cao-phan-tich",
      { type: 1, limit: 3 }
    );
    if (!response || !response.data || response.data.length === 0) {
      throw new Error("No data returned");
    }
    const report = response.data[0];
    console.log(`      First report: ${report.title || report.tenbaocao}`);
  });

  await test("fetches industry reports (type=2)", async () => {
    const response = await client.request<PaginatedResponse<AnalysisReport>>(
      "/bao-cao-phan-tich",
      { type: 2, limit: 3 }
    );
    if (!response || !response.data) {
      throw new Error("No data returned");
    }
    console.log(`      Got ${response.data.length} industry reports`);
  });

  // Test 4: Macro data with date filters
  console.log("\n4. Macro Data with date filters:");
  await test("fetches policy interest rates with date range", async () => {
    const response = await client.request<any[]>(
      "/du-lieu-vimo/chinh-sach/lai-suat",
      { "from-date": "2024-01-01", limit: 5 }
    );
    if (!response || response.length === 0) {
      throw new Error("No data returned");
    }
    console.log(`      Got ${response.length} records`);
  });

  await test("fetches interbank rates with by_time filter", async () => {
    const response = await client.request<any[]>(
      "/du-lieu-vimo/lai-suat/lien-ngan-hang",
      { "by-time": "updated_at", limit: 5 }
    );
    if (!response || response.length === 0) {
      throw new Error("No data returned");
    }
    console.log(`      Got ${response.length} records`);
  });

  // Test 5: Commodity with updated data types
  console.log("\n5. Commodities with updated data types:");
  await test("fetches international commodities with diff_day", async () => {
    const response = await client.request<any[]>(
      "/du-lieu-vimo/hang-hoa/v2/gia-hang-hoa-quoc-te",
      { data_type: "diff_day", limit: 3 }
    );
    if (!response || response.length === 0) {
      throw new Error("No data returned");
    }
    console.log(`      Got ${response.length} records`);
  });

  // Summary
  console.log("\n=== API Test Summary ===");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed > 0) {
    console.log("\n⚠️  Some API tests failed (may be due to API limitations or data availability)");
    process.exit(1);
  } else {
    console.log("\n✅ All API tests passed!");
    process.exit(0);
  }
}

runApiTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
