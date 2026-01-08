# WiFeed MCP Server

An MCP (Model Context Protocol) server for accessing Vietnamese financial data through the WiFeed API. This server enables AI assistants like Claude to retrieve stock information, financial statements, macro economic data, and more.

## Features

### Stock Information
- **Insider Trading** - Track buy/sell transactions by company insiders

### Financial Statements
- **Income Statement** - Revenue, expenses, and profit data
- **Balance Sheet** - Assets, liabilities, and equity
- **Cash Flow Statement** - Operating, investing, and financing activities
- **Financial Ratios** - Valuation (P/E, P/B), profitability (ROE, ROA), leverage ratios

### Analysis Reports
- **Research Reports** - Industry and company analysis from securities firms

### Macro Economic Data
- **Policy Interest Rates** - State Bank of Vietnam rates
- **Interbank Rates** - Daily interbank lending rates
- **Deposit Rates** - By bank group and individual banks
- **Exchange Rates** - VND rates for major currencies
- **Commodity Prices** - International and domestic commodities

## Installation

```bash
# Clone or copy the project
cd wifeed-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WIFEED_API_KEY` | Yes | Your WiFeed API key |
| `TRANSPORT` | No | `stdio` (default) or `http` |
| `PORT` | No | HTTP port (default: 3000) |

### Getting an API Key

1. Visit [WiFeed Dashboard](https://wifeed.vn/dashboard)
2. Register for an account
3. Generate an API key from your dashboard

## Usage

### With Claude Desktop (stdio)

Add to your Claude Desktop configuration (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "wifeed": {
      "command": "node",
      "args": ["/path/to/wifeed-mcp-server/dist/index.js"],
      "env": {
        "WIFEED_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### As HTTP Server

```bash
# Start the server
WIFEED_API_KEY=your_key TRANSPORT=http PORT=3000 npm start

# Test health endpoint
curl http://localhost:3000/health

# MCP endpoint available at POST http://localhost:3000/mcp
```

### Command Line Help

```bash
node dist/index.js --help
```

## Available Tools

### Stock Information

#### `wifeed_get_insider_trading`
Get insider trading data for a Vietnamese stock.

```
Parameters:
- code: Stock ticker (e.g., "HPG", "VNM", "TCB")
- page: Page number (default: 1)
- limit: Results per page (default: 20, max: 100)
- response_format: "markdown" or "json"
```

### Financial Statements

#### `wifeed_get_income_statement`
Get income statement (kết quả kinh doanh).

```
Parameters:
- code: Stock ticker
- type: "quarter", "year", or "ttm"
- nam: Year (for quarterly reports)
- quy: Quarter 1-4 (for quarterly reports)
- response_format: "markdown" or "json"
```

#### `wifeed_get_balance_sheet`
Get balance sheet (cân đối kế toán).

#### `wifeed_get_cash_flow`
Get cash flow statement (lưu chuyển tiền tệ).

#### `wifeed_get_financial_ratios`
Get financial ratios (chỉ số tài chính).

### Analysis

#### `wifeed_get_analysis_reports`
Get analysis reports from securities companies.

```
Parameters:
- code: Stock ticker (optional)
- type: 1 (all), 2 (industry), 3 (company)
- page, limit: Pagination
- from_date, to_date: Date filters (YYYY-MM-DD)
- response_format: "markdown" or "json"
```

### Macro Data

#### `wifeed_get_policy_interest_rate`
Get Vietnam State Bank policy rates.

#### `wifeed_get_interbank_rate`
Get interbank lending rates.

#### `wifeed_get_deposit_rate_by_group`
Get deposit rates by bank group.

#### `wifeed_get_deposit_rate_by_bank`
Get deposit rates by individual bank.

```
Parameters:
- ky_han: Term in months (1, 3, 6, 12, etc.)
- limit: Results per page
```

#### `wifeed_get_exchange_rate`
Get VND exchange rates.

#### `wifeed_get_international_commodity`
Get international commodity prices.

```
Parameters:
- data_type: "value_today", "change_1d", "change_mtd", "change_ytd"
```

#### `wifeed_get_domestic_commodity`
Get Vietnam domestic commodity prices.

#### `wifeed_get_other_exchange_rate`
Get cross currency exchange rates.

## Examples

### Get HPG Insider Trading
```
Tool: wifeed_get_insider_trading
Parameters: { "code": "HPG", "page": 1, "limit": 10 }
```

### Get VNM Q3 2024 Income Statement
```
Tool: wifeed_get_income_statement
Parameters: { "code": "VNM", "type": "quarter", "nam": 2024, "quy": 3 }
```

### Get TTM Financial Ratios for TCB
```
Tool: wifeed_get_financial_ratios
Parameters: { "code": "TCB", "type": "ttm" }
```

### Get 12-month Deposit Rates
```
Tool: wifeed_get_deposit_rate_by_bank
Parameters: { "ky_han": 12 }
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development
npm run dev
```

## Project Structure

```
wifeed-mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts              # Main entry point
│   ├── constants.ts          # Configuration constants
│   ├── types.ts              # TypeScript interfaces
│   ├── schemas/
│   │   └── index.ts          # Zod validation schemas
│   ├── services/
│   │   └── api-client.ts     # WiFeed API client
│   └── tools/
│       ├── stock-info.ts     # Stock information tools
│       ├── financial-statements.ts  # Financial data tools
│       └── macro-data.ts     # Macro economic tools
└── dist/                     # Compiled JavaScript
```

## Error Handling

The server provides clear error messages for common issues:
- **401**: Invalid API key
- **403**: Permission denied
- **404**: Invalid stock code or endpoint
- **429**: Rate limit exceeded
- **5xx**: Server errors

## License

MIT

## Links

- [WiFeed Documentation](https://wifeed.vn/dashboard)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Anthropic Claude](https://claude.ai)
