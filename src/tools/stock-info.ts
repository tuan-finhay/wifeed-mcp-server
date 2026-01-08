import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  InsiderTradingInputSchema,
  type InsiderTradingInput,
} from "../schemas/index.js";
import { ResponseFormat } from "../constants.js";
import {
  getApiClient,
  formatCurrency,
  formatDate,
  formatNumber,
  truncateResponse,
} from "../services/api-client.js";
import type { InsiderTrading, PaginatedResponse } from "../types.js";

export function registerStockInfoTools(server: McpServer): void {
  // Insider Trading Tool
  server.registerTool(
    "wifeed_get_insider_trading",
    {
      title: "Get Insider Trading",
      description: `Get insider trading (giao dịch nội bộ) data for a Vietnamese stock.

This tool retrieves records of buy/sell transactions by company insiders including board members, executives, and major shareholders.

Args:
  - code (string): Vietnamese stock ticker symbol (e.g., HPG, VNM, TCB)
  - page (number): Page number for pagination (default: 1)
  - limit (number): Results per page (default: 20, max: 100)
  - response_format ('markdown' | 'json'): Output format

Returns:
  For JSON format:
  {
    "meta": { "total_page": number, "total_count": number },
    "data": [
      {
        "code": string,        // Stock code
        "type": string,        // "Mua" (Buy) or "Bán" (Sell)
        "name": string,        // Insider name
        "position": string,    // Position in company
        "share_before": number,
        "amount_reg": number,  // Registered amount
        "amount_result": number, // Actual amount
        "date_result": string,
        "share_after": number,
        "ratio": number        // Ownership ratio
      }
    ]
  }

Examples:
  - "Get insider trading for HPG" -> code="HPG"
  - "Show recent insider transactions for Vinamilk" -> code="VNM"`,
      inputSchema: InsiderTradingInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: InsiderTradingInput) => {
      try {
        const client = getApiClient();
        const response = await client.request<PaginatedResponse<InsiderTrading>>(
          "/thong-tin-co-phieu/giao-dich-noi-bo",
          {
            code: params.code,
            page: params.page,
            limit: params.limit,
          }
        );

        const data = response.data || [];
        const meta = response.meta || {};

        if (data.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No insider trading data found for ${params.code}.`,
              },
            ],
          };
        }

        // Build output structure
        const output = {
          code: params.code,
          meta: {
            total_page: meta.total_page || 1,
            total_count: meta.total_count || data.length,
            current_page: params.page,
            limit: params.limit,
            has_more: (meta.total_page || 1) > params.page,
          },
          data: data.map((item) => ({
            type: item.type,
            name: item.name,
            position: item.position,
            share_before: item.share_before,
            amount_reg: item.amount_reg,
            amount_result: item.amount_result,
            date_result: item.date_result,
            share_after: item.share_after,
            ratio: item.ratio,
            relationship_name: item.relationship_name,
            relationship_position: item.relationship_position,
          })),
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# Insider Trading - ${params.code}\n\n`;
        markdown += `**Total Records:** ${output.meta.total_count}\n`;
        markdown += `**Page:** ${output.meta.current_page} / ${output.meta.total_page}\n\n`;

        for (const item of data) {
          const typeEmoji = item.type === "Mua" ? "🟢" : "🔴";
          markdown += `## ${typeEmoji} ${item.type} - ${item.name}\n`;
          
          if (item.position) {
            markdown += `**Position:** ${item.position}\n`;
          }
          if (item.relationship_name) {
            markdown += `**Related to:** ${item.relationship_name} (${item.relationship_position || "N/A"})\n`;
          }
          
          markdown += `**Date:** ${formatDate(item.date_result)}\n`;
          markdown += `**Amount:** ${formatNumber(item.amount_result)} shares\n`;
          
          if (item.share_before !== null) {
            markdown += `**Shares Before:** ${formatNumber(item.share_before)}\n`;
          }
          if (item.share_after !== null) {
            markdown += `**Shares After:** ${formatNumber(item.share_after)}\n`;
          }
          if (item.ratio !== null) {
            markdown += `**Ownership Ratio:** ${(item.ratio).toFixed(2)}%\n`;
          }
          
          markdown += "\n---\n\n";
        }

        if (output.meta.has_more) {
          markdown += `\n*More results available. Use page=${params.page + 1} to see next page.*`;
        }

        return {
          content: [{ type: "text", text: truncateResponse(markdown) }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error fetching insider trading data: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
