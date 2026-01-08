# WiFeed MCP Server

MCP server for WiFeed Vietnamese financial data APIs. Provides AI assistants access to stock information, financial statements, and macro economic data for Vietnam market.

## Quick Reference

```bash
# Build
npm run build

# Run with stdio (Claude Desktop)
WIFEED_API_KEY=your_key npm start

# Run as HTTP server
WIFEED_API_KEY=your_key TRANSPORT=http PORT=3000 npm start

# Development
npm run dev
```

## Project Structure

```
src/
├── index.ts              # Entry point, server setup (stdio/HTTP)
├── constants.ts          # Configuration constants
├── types.ts              # TypeScript interfaces
├── schemas/
│   └── index.ts          # Zod validation schemas
├── services/
│   └── api-client.ts     # WiFeed API client (axios)
└── tools/
    ├── stock-info.ts     # Stock information tools
    ├── financial-statements.ts  # Financial data tools
    └── macro-data.ts     # Macro economic tools
```

## Tech Stack

- **Runtime**: Node.js with ES modules
- **Language**: TypeScript 5.3+
- **MCP SDK**: @modelcontextprotocol/sdk
- **HTTP Client**: axios
- **Validation**: zod
- **HTTP Server**: express (for HTTP transport)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WIFEED_API_KEY` | Yes | WiFeed API key |
| `TRANSPORT` | No | `stdio` (default) or `http` |
| `PORT` | No | HTTP port (default: 3000) |

## Available Tools

### Stock Information
- `wifeed_get_insider_trading` - Insider trading data

### Financial Statements
- `wifeed_get_income_statement` - Income statement
- `wifeed_get_balance_sheet` - Balance sheet
- `wifeed_get_cash_flow` - Cash flow statement
- `wifeed_get_financial_ratios` - Financial ratios (P/E, ROE, etc.) - supports daily/quarter/year/ttm

### Analysis
- `wifeed_get_analysis_reports` - Research reports (Company/Industry/Macro/Strategy)

### Macro Data
- `wifeed_get_policy_interest_rate` - SBV policy rates
- `wifeed_get_interbank_rate` - Interbank rates
- `wifeed_get_deposit_rate_by_group` - Deposit rates by bank group
- `wifeed_get_deposit_rate_by_bank` - Deposit rates by bank
- `wifeed_get_exchange_rate` - VND exchange rates
- `wifeed_get_international_commodity` - International commodities
- `wifeed_get_domestic_commodity` - Vietnam commodities
- `wifeed_get_other_exchange_rate` - Cross currency rates

## Code Patterns

### Adding a New Tool

1. Create schema in `src/schemas/index.ts`:
```typescript
export const newToolSchema = z.object({
  code: z.string().describe("Stock ticker symbol"),
  // ... other params
});
```

2. Add tool in appropriate file under `src/tools/`:
```typescript
server.tool(
  "wifeed_tool_name",
  "Tool description",
  newToolSchema.shape,
  async (params) => {
    const response = await apiClient.get("/endpoint", { params });
    return formatResponse(response.data);
  }
);
```

3. Register in `src/index.ts` if new file

### Response Formats

Tools support both `markdown` and `json` response formats via `response_format` parameter.

## API Reference

- Base URL: `https://wifeed.vn/api/thong-tin-co-phieu`
- Auth: Bearer token via `WIFEED_API_KEY`
- [WiFeed Dashboard](https://wifeed.vn/dashboard)
