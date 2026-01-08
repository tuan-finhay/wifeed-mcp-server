import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";

import { registerStockInfoTools } from "./tools/stock-info.js";
import { registerFinancialStatementTools } from "./tools/financial-statements.js";
import { registerMacroDataTools } from "./tools/macro-data.js";
import { initializeApiClient } from "./services/api-client.js";

// Server configuration
const SERVER_NAME = "wifeed-mcp-server";
const SERVER_VERSION = "1.0.0";

// Create MCP server instance
function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Register all tools
  registerStockInfoTools(server);
  registerFinancialStatementTools(server);
  registerMacroDataTools(server);

  console.error(`[${SERVER_NAME}] Registered tools successfully`);

  return server;
}

// Run with stdio transport (for local CLI usage)
async function runStdio(): Promise<void> {
  const apiKey = process.env.WIFEED_API_KEY;
  if (!apiKey) {
    console.error("Error: WIFEED_API_KEY environment variable is required");
    console.error("Usage: WIFEED_API_KEY=your_key node dist/index.js");
    process.exit(1);
  }

  initializeApiClient(apiKey);

  const server = createServer();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  console.error(`[${SERVER_NAME}] Running with stdio transport`);
}

// Run with HTTP transport (for remote/web usage)
async function runHTTP(): Promise<void> {
  const apiKey = process.env.WIFEED_API_KEY;
  if (!apiKey) {
    console.error("Error: WIFEED_API_KEY environment variable is required");
    console.error("Usage: WIFEED_API_KEY=your_key TRANSPORT=http node dist/index.js");
    process.exit(1);
  }

  initializeApiClient(apiKey);

  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: SERVER_NAME, version: SERVER_VERSION });
  });

  // MCP endpoint
  app.post("/mcp", async (req, res) => {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on("close", () => transport.close());

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () => {
    console.error(`[${SERVER_NAME}] MCP server running on http://localhost:${port}/mcp`);
    console.error(`[${SERVER_NAME}] Health check: http://localhost:${port}/health`);
  });
}

// Show help
function showHelp(): void {
  console.log(`
WiFeed MCP Server - Vietnamese Financial Data API

USAGE:
  WIFEED_API_KEY=your_key node dist/index.js [OPTIONS]

OPTIONS:
  --help, -h     Show this help message

ENVIRONMENT VARIABLES:
  WIFEED_API_KEY   Required. Your WiFeed API key
  TRANSPORT        Transport type: 'stdio' (default) or 'http'
  PORT             HTTP port (default: 3000, only used with TRANSPORT=http)

EXAMPLES:
  # Run with stdio transport (for Claude Desktop, etc.)
  WIFEED_API_KEY=your_key node dist/index.js

  # Run as HTTP server
  WIFEED_API_KEY=your_key TRANSPORT=http PORT=3000 node dist/index.js

AVAILABLE TOOLS:
  Stock Information:
    - wifeed_get_insider_trading    Get insider trading data

  Financial Statements:
    - wifeed_get_income_statement   Get income statement (profit/loss)
    - wifeed_get_balance_sheet      Get balance sheet
    - wifeed_get_cash_flow          Get cash flow statement
    - wifeed_get_financial_ratios   Get financial ratios (P/E, ROE, etc.)

  Analysis:
    - wifeed_get_analysis_reports   Get research reports

  Macro Data:
    - wifeed_get_policy_interest_rate    SBV policy rates
    - wifeed_get_interbank_rate          Interbank rates
    - wifeed_get_deposit_rate_by_group   Deposit rates by bank group
    - wifeed_get_deposit_rate_by_bank    Deposit rates by individual bank
    - wifeed_get_exchange_rate           VND exchange rates
    - wifeed_get_international_commodity International commodity prices
    - wifeed_get_domestic_commodity      Vietnam commodity prices
    - wifeed_get_other_exchange_rate     Cross currency rates

For more information, visit: https://wifeed.vn/dashboard
`);
}

// Main entry point
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }

  const transport = process.env.TRANSPORT || "stdio";

  if (transport === "http") {
    await runHTTP();
  } else {
    await runStdio();
  }
}

// Run the server
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
