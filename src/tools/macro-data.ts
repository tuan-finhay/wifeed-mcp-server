import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  PolicyInterestRateInputSchema,
  InterbankRateInputSchema,
  DepositRateByGroupInputSchema,
  DepositRateByBankInputSchema,
  ExchangeRateInputSchema,
  InternationalCommodityInputSchema,
  DomesticCommodityInputSchema,
  OtherExchangeRateInputSchema,
  AnalysisReportsInputSchema,
  type PolicyInterestRateInput,
  type InterbankRateInput,
  type DepositRateByGroupInput,
  type DepositRateByBankInput,
  type ExchangeRateInput,
  type InternationalCommodityInput,
  type DomesticCommodityInput,
  type OtherExchangeRateInput,
  type AnalysisReportsInput,
} from "../schemas/index.js";
import { ResponseFormat } from "../constants.js";
import {
  getApiClient,
  formatDate,
  formatNumber,
  truncateResponse,
  normalizeArrayResponse,
} from "../services/api-client.js";
import type {
  PolicyInterestRate,
  InterbankRate,
  DepositRateByGroup,
  DepositRateByBank,
  ExchangeRate,
  InternationalCommodity,
  DomesticCommodity,
  OtherExchangeRate,
  AnalysisReport,
  PaginatedResponse,
} from "../types.js";

export function registerMacroDataTools(server: McpServer): void {
  // Analysis Reports Tool
  server.registerTool(
    "wifeed_get_analysis_reports",
    {
      title: "Get Analysis Reports",
      description: `Get analysis reports (báo cáo phân tích) from Vietnamese securities companies.

This tool retrieves research reports from over 40 securities companies including company-specific, industry, macro, and strategy reports.

Args:
  - code (string, optional): Stock code to filter reports
  - type (1 | 2 | 3 | 4): Report type - 1=Company, 2=Industry, 3=Macro, 4=Strategy
  - page (number): Page number (default: 1)
  - limit (number): Results per page (default: 20)
  - from_date (string): Filter from date (YYYY-MM-DD)
  - to_date (string): Filter to date (YYYY-MM-DD)
  - response_format ('markdown' | 'json'): Output format

Returns report data including:
  - Report title and source
  - Recommendation (Mua/Buy, Trung lập/Neutral, etc.)
  - Target price and upside potential
  - Revenue and profit forecasts
  - Forward P/E ratio

Examples:
  - "Get recent analysis reports for TPB" -> code="TPB", type=1
  - "Get industry reports from last month" -> type=2, from_date="2024-11-01"
  - "Get macro economic reports" -> type=3
  - "Get strategy reports" -> type=4`,
      inputSchema: AnalysisReportsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: AnalysisReportsInput) => {
      try {
        const client = getApiClient();
        const response = await client.request<PaginatedResponse<AnalysisReport>>(
          "/bao-cao-phan-tich",
          {
            code: params.code,
            type: params.type,
            page: params.page,
            limit: params.limit,
            "from-date": params.from_date,
            "to-date": params.to_date,
          }
        );

        const data = response.data || [];
        
        if (data.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No analysis reports found with the specified criteria.`,
              },
            ],
          };
        }

        const output = {
          total: response.meta?.total_count || data.length,
          page: params.page,
          limit: params.limit,
          reports: data.map((item) => ({
            id: item.id,
            code: item.code || item.mack,
            title: item.title || item.tenbaocao,
            source: item.source || item.nguon,
            type: item.type,
            publish_date: item.publish_date,
            file_url: item.file_url || item.filebaocao,
            recommendation: item.khuyennghi,
            target_price: item.giamuctieu,
            target_price_adjusted: item.giamuctieu_dieuchinrh,
            upside: item.upside_hientai,
            net_profit_forecast: item.lnst_duphong,
            net_profit_forecast_n1: item.lnst_duphong_n1,
            net_profit_forecast_n2: item.lnst_duphong_n2,
            revenue_forecast: item.doanhthu_duphong,
            revenue_forecast_n1: item.doanhthu_duphong_n1,
            revenue_forecast_n2: item.doanhthu_duphong_n2,
            forward_pe: item.pe_mack_n0,
          })),
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        const getTypeLabel = (type: number): string => {
          switch (type) {
            case 1: return "🏢 Company";
            case 2: return "🏭 Industry";
            case 3: return "📊 Macro";
            case 4: return "📈 Strategy";
            default: return "📋 Report";
          }
        };

        let markdown = `# Analysis Reports\n\n`;
        markdown += `**Total:** ${output.total} reports | **Page:** ${output.page}\n\n`;

        for (const report of data) {
          const typeLabel = getTypeLabel(report.type);
          markdown += `## ${typeLabel} - ${report.title || report.tenbaocao}\n`;
          markdown += `**Code:** ${report.code || report.mack || "N/A"} | **Source:** ${report.source || report.nguon}\n`;
          markdown += `**Date:** ${formatDate(report.publish_date)}\n`;

          if (report.khuyennghi) {
            markdown += `**Recommendation:** ${report.khuyennghi}\n`;
          }
          if (report.giamuctieu) {
            markdown += `**Target Price:** ${formatNumber(report.giamuctieu)}`;
            if (report.upside_hientai) {
              markdown += ` (Upside: ${report.upside_hientai.toFixed(1)}%)`;
            }
            markdown += `\n`;
          }
          if (report.pe_mack_n0) {
            markdown += `**Forward P/E:** ${report.pe_mack_n0.toFixed(2)}\n`;
          }

          markdown += `**Download:** [PDF](${report.file_url || report.filebaocao})\n\n`;
          markdown += `---\n\n`;
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
              text: `Error fetching analysis reports: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Policy Interest Rate Tool
  server.registerTool(
    "wifeed_get_policy_interest_rate",
    {
      title: "Get Policy Interest Rates",
      description: `Get Vietnam State Bank policy interest rates (lãi suất chính sách).

This tool retrieves historical policy interest rates including refinancing rate, discount rate, and reserve requirement rate.

Args:
  - page (number): Page number (default: 1)
  - limit (number): Results per page (default: 20)
  - response_format ('markdown' | 'json'): Output format

Returns interest rate data including:
  - Refinancing rate (lãi suất tái cấp vốn)
  - Discount rate (lãi suất chiết khấu)
  - Reserve requirement rate (lãi suất trên dự trữ bắt buộc)
  - Overnight lending rate (lãi suất cho vay qua đêm)

Examples:
  - "Get current policy interest rates" -> page=1, limit=10
  - "Get policy rate history" -> page=1, limit=50`,
      inputSchema: PolicyInterestRateInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: PolicyInterestRateInput) => {
      try {
        const client = getApiClient();
        const rawResponse = await client.request<PolicyInterestRate[] | { data: PolicyInterestRate[] }>(
          "/du-lieu-vimo/chinh-sach/lai-suat",
          {
            page: params.page,
            limit: params.limit,
            "by-time": params.by_time,
            "from-date": params.from_date,
            "to-date": params.to_date,
            "from-time": params.from_time,
            "to-time": params.to_time,
          }
        );

        const response = normalizeArrayResponse<PolicyInterestRate>(rawResponse);

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No policy interest rate data found.",
              },
            ],
          };
        }

        const output = {
          page: params.page,
          limit: params.limit,
          count: response.length,
          data: response.map((item) => ({
            date: item.ngay,
            refinancing_rate: item.lai_suat_dieu_hanh_tai_cap_von,
            discount_rate: item.lai_suat_dieu_hanh_chiet_khau,
            omo_rate: item.lai_suat_dieu_hanh_omo,
            overnight_lending_rate: item.ls_cho_vay_bu_dap_thieu_hut_von_nhnn,
            max_1_month_rate: item.ls_toi_da_1_thang,
            max_6_month_rate: item.ls_toi_da_6_thang,
            reserve_requirement_vnd: item.ls_du_tru_bat_buoc_vnd,
            reserve_requirement_fx: item.ls_du_tru_bat_buoc_ngoai_te,
          })),
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# Vietnam Policy Interest Rates\n\n`;
        markdown += `| Date | Refinancing | Discount | OMO | Overnight Lending | Max 1M | Max 6M |\n`;
        markdown += `|------|-------------|----------|-----|-------------------|--------|--------|\n`;

        for (const item of response) {
          markdown += `| ${formatDate(item.ngay)} `;
          markdown += `| ${item.lai_suat_dieu_hanh_tai_cap_von ?? "N/A"}% `;
          markdown += `| ${item.lai_suat_dieu_hanh_chiet_khau ?? "N/A"}% `;
          markdown += `| ${item.lai_suat_dieu_hanh_omo ?? "N/A"}% `;
          markdown += `| ${item.ls_cho_vay_bu_dap_thieu_hut_von_nhnn ?? "N/A"}% `;
          markdown += `| ${item.ls_toi_da_1_thang ?? "N/A"}% `;
          markdown += `| ${item.ls_toi_da_6_thang ?? "N/A"}% |\n`;
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
              text: `Error fetching policy interest rates: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Interbank Interest Rate Tool
  server.registerTool(
    "wifeed_get_interbank_rate",
    {
      title: "Get Interbank Interest Rates",
      description: `Get Vietnam interbank interest rates (lãi suất liên ngân hàng).

This tool retrieves daily interbank lending rates for various terms from overnight to 12 months.

Args:
  - page (number): Page number (default: 1)
  - limit (number): Results per page (default: 20)
  - response_format ('markdown' | 'json'): Output format

Returns interbank rates for terms:
  - Overnight, 1 week, 2 weeks
  - 1 month, 3 months, 6 months
  - 9 months, 12 months

Examples:
  - "Get current interbank rates" -> page=1, limit=10
  - "Get interbank rate history" -> page=1, limit=50`,
      inputSchema: InterbankRateInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: InterbankRateInput) => {
      try {
        const client = getApiClient();
        const rawResponse = await client.request<InterbankRate[] | { data: InterbankRate[] }>(
          "/du-lieu-vimo/lai-suat/lien-ngan-hang",
          {
            page: params.page,
            limit: params.limit,
            "by-time": params.by_time,
            "from-date": params.from_date,
            "to-date": params.to_date,
            "from-time": params.from_time,
            "to-time": params.to_time,
          }
        );

        const response = normalizeArrayResponse<InterbankRate>(rawResponse);

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No interbank interest rate data found.",
              },
            ],
          };
        }

        const output = {
          page: params.page,
          limit: params.limit,
          count: response.length,
          data: response.map((item) => ({
            date: item.ngay,
            federal_funds_rate: item.federal_funds_rate,
            overnight: item.lai_suat_lien_nh_on,
            week_1: item.lai_suat_lien_nh_1w,
            week_2: item.lai_suat_lien_nh_2w,
            month_1: item.lai_suat_lien_nh_1m,
            month_3: item.lai_suat_lien_nh_3m,
            month_6: item.lai_suat_lien_nh_6m,
            month_9: item.lai_suat_lien_nh_9m,
            volume_overnight: item.doanh_so_lien_nh_on,
          })),
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# Vietnam Interbank Interest Rates\n\n`;
        markdown += `| Date | O/N | 1W | 2W | 1M | 3M | 6M | 9M |\n`;
        markdown += `|------|-----|----|----|----|----|----|----|-----|\n`;

        for (const item of response) {
          markdown += `| ${formatDate(item.ngay)} `;
          markdown += `| ${item.lai_suat_lien_nh_on?.toFixed(2) ?? "N/A"} `;
          markdown += `| ${item.lai_suat_lien_nh_1w?.toFixed(2) ?? "N/A"} `;
          markdown += `| ${item.lai_suat_lien_nh_2w?.toFixed(2) ?? "N/A"} `;
          markdown += `| ${item.lai_suat_lien_nh_1m?.toFixed(2) ?? "N/A"} `;
          markdown += `| ${item.lai_suat_lien_nh_3m?.toFixed(2) ?? "N/A"} `;
          markdown += `| ${item.lai_suat_lien_nh_6m?.toFixed(2) ?? "N/A"} `;
          markdown += `| ${item.lai_suat_lien_nh_9m?.toFixed(2) ?? "N/A"} |\n`;
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
              text: `Error fetching interbank rates: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Deposit Rate by Bank Group Tool
  server.registerTool(
    "wifeed_get_deposit_rate_by_group",
    {
      title: "Get Deposit Rates by Bank Group",
      description: `Get deposit interest rates by bank group (lãi suất huy động theo nhóm ngân hàng).

This tool retrieves average deposit rates grouped by bank type (state-owned, commercial, etc.).

Args:
  - page (number): Page number (default: 1)
  - limit (number): Results per page (default: 20)
  - response_format ('markdown' | 'json'): Output format

Examples:
  - "Get deposit rates by bank type" -> page=1`,
      inputSchema: DepositRateByGroupInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: DepositRateByGroupInput) => {
      try {
        const client = getApiClient();
        const response = await client.request<DepositRateByGroup[]>(
          "/du-lieu-vimo/lai-suat/huy-dong-theo-nhom-ngan-hang",
          {
            page: params.page,
            limit: params.limit,
            "by-time": params.by_time,
            "from-date": params.from_date,
            "to-date": params.to_date,
            "from-time": params.from_time,
            "to-time": params.to_time,
          }
        );

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No deposit rate data by bank group found.",
              },
            ],
          };
        }

        const output = {
          page: params.page,
          limit: params.limit,
          count: response.length,
          data: response,
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# Deposit Rates by Bank Group\n\n`;
        markdown += `| Date | Bank Group | Term | Rate |\n`;
        markdown += `|------|------------|------|------|\n`;

        for (const item of response) {
          markdown += `| ${formatDate(item.date)} `;
          markdown += `| ${item.bank_group} `;
          markdown += `| ${item.term} `;
          markdown += `| ${item.rate}% |\n`;
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
              text: `Error fetching deposit rates by group: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Deposit Rate by Bank Tool
  server.registerTool(
    "wifeed_get_deposit_rate_by_bank",
    {
      title: "Get Deposit Rates by Bank",
      description: `Get deposit interest rates for individual banks (lãi suất huy động từng ngân hàng).

This tool retrieves weekly deposit rates for specific banks and terms.

Args:
  - ky_han (number): Deposit term in months (1, 3, 6, 12, etc.)
  - limit (number): Results per page (default: 100)
  - response_format ('markdown' | 'json'): Output format

Examples:
  - "Get 12-month deposit rates for all banks" -> ky_han=12
  - "Compare 6-month deposit rates" -> ky_han=6`,
      inputSchema: DepositRateByBankInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: DepositRateByBankInput) => {
      try {
        const client = getApiClient();
        const response = await client.request<DepositRateByBank[]>(
          "/du-lieu-vimo/v2/lai-suat/huy-dong-theo-tung-ngan-hang",
          {
            ky_han: params.ky_han,
            limit: params.limit,
            "by-time": params.by_time,
            "from-date": params.from_date,
            "to-date": params.to_date,
            "from-time": params.from_time,
            "to-time": params.to_time,
          }
        );

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No deposit rate data found for ${params.ky_han}-month term.`,
              },
            ],
          };
        }

        const output = {
          term_months: params.ky_han,
          count: response.length,
          data: response.map((item) => ({
            bank_code: item.bank_code,
            bank_name: item.bank_name,
            rate: item.rate,
            date: item.date,
          })),
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# Deposit Rates by Bank (${params.ky_han}-month term)\n\n`;
        markdown += `| Bank | Rate | Date |\n`;
        markdown += `|------|------|------|\n`;

        // Sort by rate descending
        const sorted = [...response].sort((a, b) => (b.rate || 0) - (a.rate || 0));
        
        for (const item of sorted) {
          markdown += `| ${item.bank_name} (${item.bank_code}) `;
          markdown += `| ${item.rate}% `;
          markdown += `| ${formatDate(item.date)} |\n`;
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
              text: `Error fetching deposit rates by bank: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Exchange Rate Tool
  server.registerTool(
    "wifeed_get_exchange_rate",
    {
      title: "Get Exchange Rates",
      description: `Get Vietnam USD/VND exchange rates (tỷ giá) from the State Bank and commercial banks.

This tool retrieves official exchange rates for USD against VND from various sources.

Args:
  - page (number): Page number (default: 1)
  - limit (number): Results per page (default: 100)
  - response_format ('markdown' | 'json'): Output format

Returns USD/VND exchange rates including:
  - Commercial bank rates (buy cash, buy transfer, sell)
  - Free market rates
  - State Bank of Vietnam central rate, ceiling, and floor

Examples:
  - "Get current USD/VND rate" -> page=1
  - "Get exchange rate history" -> limit=100`,
      inputSchema: ExchangeRateInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: ExchangeRateInput) => {
      try {
        const client = getApiClient();
        const rawResponse = await client.request<ExchangeRate[] | { data: ExchangeRate[] }>(
          "/du-lieu-vimo/ty-gia",
          {
            page: params.page,
            limit: params.limit,
            "by-time": params.by_time,
            "from-date": params.from_date,
            "to-date": params.to_date,
            "from-time": params.from_time,
            "to-time": params.to_time,
          }
        );

        const response = normalizeArrayResponse<ExchangeRate>(rawResponse);

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No exchange rate data found.",
              },
            ],
          };
        }

        const output = {
          page: params.page,
          limit: params.limit,
          count: response.length,
          data: response.map((item) => ({
            date: item.ngay,
            commercial_bank: {
              buy_cash: item.usd_nhtm_mua_vao,
              buy_transfer: item.usd_nhtm_chuyen_khoan,
              sell: item.usd_nhtm_ban_ra,
            },
            free_market: {
              buy: item.usd_tu_do_mua_vao,
              sell: item.usd_tu_do_ban_ra,
            },
            sbv: {
              central_rate: item.usd_nhnn_trung_tam,
              ceiling: item.usd_nhnn_tran,
              floor: item.usd_nhnn_san,
              buy: item.usd_nhnn_mua_vao,
              sell: item.usd_nhnn_ban_ra,
            },
          })),
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# Vietnam USD/VND Exchange Rates\n\n`;

        for (const item of response) {
          markdown += `## ${formatDate(item.ngay)}\n\n`;
          markdown += `### Commercial Bank (NHTM)\n`;
          markdown += `| Buy Cash | Buy Transfer | Sell |\n`;
          markdown += `|----------|--------------|------|\n`;
          markdown += `| ${formatNumber(item.usd_nhtm_mua_vao)} | ${formatNumber(item.usd_nhtm_chuyen_khoan)} | ${formatNumber(item.usd_nhtm_ban_ra)} |\n\n`;

          markdown += `### Free Market\n`;
          markdown += `| Buy | Sell |\n`;
          markdown += `|-----|------|\n`;
          markdown += `| ${formatNumber(item.usd_tu_do_mua_vao)} | ${formatNumber(item.usd_tu_do_ban_ra)} |\n\n`;

          markdown += `### State Bank of Vietnam (NHNN)\n`;
          markdown += `| Central Rate | Ceiling | Floor | Buy | Sell |\n`;
          markdown += `|--------------|---------|-------|-----|------|\n`;
          markdown += `| ${formatNumber(item.usd_nhnn_trung_tam)} | ${formatNumber(item.usd_nhnn_tran)} | ${formatNumber(item.usd_nhnn_san)} | ${formatNumber(item.usd_nhnn_mua_vao)} | ${formatNumber(item.usd_nhnn_ban_ra)} |\n\n`;
          markdown += `---\n\n`;
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
              text: `Error fetching exchange rates: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // International Commodity Tool
  server.registerTool(
    "wifeed_get_international_commodity",
    {
      title: "Get International Commodity Prices",
      description: `Get international commodity prices (giá hàng hóa quốc tế).

This tool retrieves global commodity prices including oil, gold, metals, agricultural products.
The API returns data in a flat format with commodity names as columns.

Args:
  - page (number): Page number (default: 1)
  - limit (number): Results per page (default: 100)
  - data_type ('value_today' | 'change_1d' | 'change_mtd' | 'change_ytd'): Data type
  - response_format ('markdown' | 'json'): Output format

Examples:
  - "Get current gold price" -> page=1
  - "Get commodity price changes YTD" -> data_type="change_ytd"`,
      inputSchema: InternationalCommodityInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: InternationalCommodityInput) => {
      try {
        const client = getApiClient();
        const rawResponse = await client.request<InternationalCommodity[] | { data: InternationalCommodity[] }>(
          "/du-lieu-vimo/hang-hoa/v2/gia-hang-hoa-quoc-te",
          {
            page: params.page,
            limit: params.limit,
            data_type: params.data_type,
            "by-time": params.by_time,
            "from-date": params.from_date,
            "to-date": params.to_date,
            "from-time": params.from_time,
          }
        );

        const response = normalizeArrayResponse<InternationalCommodity>(rawResponse);

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No international commodity data found.",
              },
            ],
          };
        }

        // Transform flat data into commodity list
        // Skip metadata fields and extract commodity prices
        const metaFields = new Set(["ngay", "kieu_thoi_gian", "data_type", "created_at", "updated_at"]);

        const transformedData = response.map((row) => {
          const commodities: Array<{ name: string; value: number | null }> = [];
          for (const [key, value] of Object.entries(row)) {
            if (!metaFields.has(key) && typeof value === "number") {
              commodities.push({
                name: key.replace(/_/g, " "),
                value: value,
              });
            }
          }
          return {
            date: row.ngay,
            data_type: row.data_type || params.data_type,
            commodities: commodities.filter(c => c.value !== null).sort((a, b) => a.name.localeCompare(b.name)),
          };
        });

        const output = {
          data_type: params.data_type,
          count: response.length,
          data: transformedData,
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# International Commodity Prices\n\n`;
        markdown += `**Data Type:** ${params.data_type}\n\n`;

        for (const row of transformedData) {
          markdown += `## ${formatDate(row.date)}\n\n`;
          markdown += `| Commodity | Value |\n`;
          markdown += `|-----------|-------|\n`;

          for (const commodity of row.commodities) {
            const displayName = commodity.name
              .split(" ")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            markdown += `| ${displayName} | ${formatNumber(commodity.value)} |\n`;
          }
          markdown += `\n`;
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
              text: `Error fetching international commodity prices: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Domestic Commodity Tool
  server.registerTool(
    "wifeed_get_domestic_commodity",
    {
      title: "Get Domestic Commodity Prices",
      description: `Get Vietnam domestic commodity prices (giá hàng hóa trong nước).

This tool retrieves local commodity prices including steel, cement, rice, coffee, shrimp, etc.
The API returns data in a flat format with commodity names as columns.

Args:
  - page (number): Page number (default: 1)
  - limit (number): Results per page (default: 100)
  - data_type ('value_today' | 'change_1d' | 'change_mtd' | 'change_ytd'): Data type
  - response_format ('markdown' | 'json'): Output format

Examples:
  - "Get Vietnam steel prices" -> page=1
  - "Get domestic commodity price changes" -> data_type="change_1d"`,
      inputSchema: DomesticCommodityInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: DomesticCommodityInput) => {
      try {
        const client = getApiClient();
        const rawResponse = await client.request<DomesticCommodity[] | { data: DomesticCommodity[] }>(
          "/du-lieu-vimo/hang-hoa/v2/gia-hang-hoa-trong-nuoc/ngay",
          {
            page: params.page,
            limit: params.limit,
            data_type: params.data_type,
            "by-time": params.by_time,
            "from-time": params.from_time,
          }
        );

        const response = normalizeArrayResponse<DomesticCommodity>(rawResponse);

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No domestic commodity data found.",
              },
            ],
          };
        }

        // Transform flat data into commodity list
        // Skip metadata fields and extract commodity prices
        const metaFields = new Set(["ngay", "kieu_thoi_gian", "data_type", "created_at", "updated_at"]);

        const transformedData = response.map((row) => {
          const commodities: Array<{ name: string; value: number | null }> = [];
          for (const [key, value] of Object.entries(row)) {
            if (!metaFields.has(key) && typeof value === "number") {
              commodities.push({
                name: key.replace(/_/g, " "),
                value: value,
              });
            }
          }
          return {
            date: row.ngay,
            data_type: row.data_type || params.data_type,
            commodities: commodities.filter(c => c.value !== null).sort((a, b) => a.name.localeCompare(b.name)),
          };
        });

        const output = {
          data_type: params.data_type,
          count: response.length,
          data: transformedData,
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# Vietnam Domestic Commodity Prices\n\n`;
        markdown += `**Data Type:** ${params.data_type}\n\n`;

        for (const row of transformedData) {
          markdown += `## ${formatDate(row.date)}\n\n`;
          markdown += `| Commodity | Value |\n`;
          markdown += `|-----------|-------|\n`;

          for (const commodity of row.commodities) {
            const displayName = commodity.name
              .split(" ")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            markdown += `| ${displayName} | ${formatNumber(commodity.value)} |\n`;
          }
          markdown += `\n`;
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
              text: `Error fetching domestic commodity prices: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Other Exchange Rate Tool
  server.registerTool(
    "wifeed_get_other_exchange_rate",
    {
      title: "Get Other Exchange Rates",
      description: `Get other exchange rates (tỉ giá khác) including cross rates and crypto.

This tool retrieves currency pair rates including major forex pairs and cryptocurrencies.

Args:
  - page (number): Page number (default: 1)
  - limit (number): Results per page (default: 100)
  - response_format ('markdown' | 'json'): Output format

Returns rates for pairs like:
  - Major forex: EUR/USD, GBP/USD, USD/JPY, etc.
  - Asia: USD/CNY, USD/SGD, USD/THB, etc.
  - Crypto: BTC/USD, ETH/USD
  - Dollar Index (DXY)

Examples:
  - "Get EUR/USD rate" -> page=1
  - "Get all cross rates" -> limit=100`,
      inputSchema: OtherExchangeRateInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: OtherExchangeRateInput) => {
      try {
        const client = getApiClient();
        const rawResponse = await client.request<OtherExchangeRate[] | { data: OtherExchangeRate[] }>(
          "/du-lieu-vimo/ty-gia-khac",
          {
            page: params.page,
            limit: params.limit,
            "by-time": params.by_time,
            "from-date": params.from_date,
            "to-date": params.to_date,
            "from-time": params.from_time,
            "to-time": params.to_time,
          }
        );

        const response = normalizeArrayResponse<OtherExchangeRate>(rawResponse);

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No other exchange rate data found.",
              },
            ],
          };
        }

        // Transform flat structure into pairs list
        const transformedData = response.map((item) => ({
          date: item.ngay,
          pairs: {
            // Major forex pairs
            eur_usd: item.eur_usd,
            gbp_usd: item.gbp_usd,
            aud_usd: item.aud_usd,
            usd_jpy: item.usd_jpy,
            usd_cny: item.usd_cny,
            usd_hkd: item.usd_hkd,
            usd_sgd: item.usd_sgd,
            usd_thb: item.usd_thb,
            usd_idr: item.usd_idr,
            usd_myr: item.usd_myr,
            usd_php: item.usd_php,
            usd_twd: item.usd_twd,
            usd_krw: item.usd_krw,
            usd_inr: item.usd_inr,
            usd_rub: item.usd_rub,
            // Crypto
            btc_usd: item.btc_usd,
            eth_usd: item.eth_usd,
            // Dollar Index
            dx: item.dx,
          },
        }));

        const output = {
          page: params.page,
          limit: params.limit,
          count: response.length,
          data: transformedData,
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# Other Exchange Rates\n\n`;

        for (const row of transformedData) {
          markdown += `## ${formatDate(row.date)}\n\n`;

          markdown += `### Major Forex Pairs\n`;
          markdown += `| Pair | Rate |\n`;
          markdown += `|------|------|\n`;
          markdown += `| EUR/USD | ${row.pairs.eur_usd?.toFixed(4) ?? "N/A"} |\n`;
          markdown += `| GBP/USD | ${row.pairs.gbp_usd?.toFixed(4) ?? "N/A"} |\n`;
          markdown += `| AUD/USD | ${row.pairs.aud_usd?.toFixed(4) ?? "N/A"} |\n`;
          markdown += `| USD/JPY | ${row.pairs.usd_jpy?.toFixed(2) ?? "N/A"} |\n`;
          markdown += `| Dollar Index | ${row.pairs.dx?.toFixed(3) ?? "N/A"} |\n\n`;

          markdown += `### Asian Currencies\n`;
          markdown += `| Pair | Rate |\n`;
          markdown += `|------|------|\n`;
          markdown += `| USD/CNY | ${row.pairs.usd_cny?.toFixed(4) ?? "N/A"} |\n`;
          markdown += `| USD/SGD | ${row.pairs.usd_sgd?.toFixed(4) ?? "N/A"} |\n`;
          markdown += `| USD/THB | ${row.pairs.usd_thb?.toFixed(3) ?? "N/A"} |\n`;
          markdown += `| USD/IDR | ${formatNumber(row.pairs.usd_idr)} |\n`;
          markdown += `| USD/MYR | ${row.pairs.usd_myr?.toFixed(4) ?? "N/A"} |\n`;
          markdown += `| USD/PHP | ${row.pairs.usd_php?.toFixed(2) ?? "N/A"} |\n`;
          markdown += `| USD/TWD | ${row.pairs.usd_twd?.toFixed(3) ?? "N/A"} |\n`;
          markdown += `| USD/KRW | ${formatNumber(row.pairs.usd_krw)} |\n`;
          markdown += `| USD/INR | ${row.pairs.usd_inr?.toFixed(3) ?? "N/A"} |\n\n`;

          markdown += `### Cryptocurrency\n`;
          markdown += `| Pair | Rate |\n`;
          markdown += `|------|------|\n`;
          markdown += `| BTC/USD | ${formatNumber(row.pairs.btc_usd)} |\n`;
          markdown += `| ETH/USD | ${formatNumber(row.pairs.eth_usd)} |\n\n`;

          markdown += `---\n\n`;
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
              text: `Error fetching other exchange rates: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
