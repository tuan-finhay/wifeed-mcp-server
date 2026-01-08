import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  IncomeStatementInputSchema,
  BalanceSheetInputSchema,
  CashFlowStatementInputSchema,
  FinancialRatiosInputSchema,
  type IncomeStatementInput,
  type BalanceSheetInput,
  type CashFlowStatementInput,
  type FinancialRatiosInput,
} from "../schemas/index.js";
import { ResponseFormat, ReportType } from "../constants.js";
import {
  getApiClient,
  formatCurrency,
  truncateResponse,
} from "../services/api-client.js";
import type {
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  FinancialRatios,
} from "../types.js";

export function registerFinancialStatementTools(server: McpServer): void {
  // Income Statement Tool
  server.registerTool(
    "wifeed_get_income_statement",
    {
      title: "Get Income Statement",
      description: `Get income statement (kết quả kinh doanh) for a Vietnamese company.

This tool retrieves profit and loss data including revenue, expenses, and net income. Supports both regular companies and banks with different financial metrics.

Args:
  - code (string): Vietnamese stock ticker symbol (e.g., VNM, TCB, HPG)
  - type ('quarter' | 'year' | 'ttm'): Report period type
  - nam (number): Year (required for quarterly reports)
  - quy (number): Quarter 1-4 (required for quarterly reports)
  - response_format ('markdown' | 'json'): Output format

Returns income statement data with metrics like:
  - Revenue (doanhthu)
  - Gross profit (loinhuan_gop)
  - Operating profit (loinhuan_thuan_hdkd)
  - Net profit (loinhuan_sauthue)
  - For banks: Net interest income, fee income, trading gains/losses

Examples:
  - "Get Q3 2024 income statement for VNM" -> code="VNM", type="quarter", nam=2024, quy=3
  - "Annual income statement for TCB" -> code="TCB", type="year"`,
      inputSchema: IncomeStatementInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: IncomeStatementInput) => {
      try {
        const client = getApiClient();
        const response = await client.request<IncomeStatement[]>(
          "/tai-chinh-doanh-nghiep/bctc/ket-qua-kinh-doanh",
          {
            code: params.code,
            type: params.type,
            nam: params.nam,
            quy: params.quy,
          }
        );

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No income statement data found for ${params.code}.`,
              },
            ],
          };
        }

        const data = response[0];
        const isBank = data.thunhaplaithuan !== undefined;

        // Build output
        const output = {
          code: params.code,
          period: params.type === ReportType.QUARTER 
            ? `Q${data.quy}/${data.nam}` 
            : String(data.nam),
          report_type: params.type,
          is_bank: isBank,
          metrics: isBank
            ? {
                net_interest_income: data.thunhaplaithuan,
                net_fee_income: data.laithuantuhoatdongdichvu,
                trading_gain_loss: data.lailothuantumuabanchungkhoankinhdoanh,
                investment_gain_loss: data.lailothuantumuabanchungkhoandautu,
                other_income: data.lailothuantuhoatdongkhac,
                total_operating_income: data.tongthunhaphoatdong,
                operating_expenses: data.chiphihoatdong,
                profit_before_provision: data.loinhuanthuantuhdkdtruocchiphiduphongruirotindung,
                provision_expense: data.chiphiduphongruirotindung,
                profit_before_tax: data.tongloinhuantruocthue,
                income_tax: data.chiphithuethunhapdoanhnghiep,
                net_profit: data.loinhuansauthue,
                minority_interest: data.loiichcuacodongthieuso_pl,
                profit_to_parent: data.codongcuacongtyme,
              }
            : {
                revenue: data.doanhthu,
                cost_of_goods_sold: data.giavon,
                gross_profit: data.loinhuan_gop,
                financial_income: data.doanhthu_taichinh,
                financial_expense: data.chiphi_taichinh,
                selling_expense: data.chiphi_banhang,
                admin_expense: data.chiphi_quanly,
                operating_profit: data.loinhuan_thuan_hdkd,
                other_income: data.thunhap_khac,
                other_expense: data.chiphi_khac,
                other_profit: data.loinhuan_khac,
                profit_before_tax: data.loinhuan_truocthue,
                income_tax: data.chiphi_thuetndn,
                net_profit: data.loinhuan_sauthue,
                minority_interest: data.loiich_codongthieuso,
                profit_to_parent: data.loinhuan_congty_me,
              },
          audit_info: {
            auditor: data.donvikiemtoan,
            opinion: data.ykienkiemtoan,
          },
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# Income Statement - ${params.code}\n\n`;
        markdown += `**Period:** ${output.period}\n`;
        markdown += `**Report Type:** ${output.report_type}\n`;
        markdown += `**Company Type:** ${isBank ? "Bank/Financial Institution" : "Non-Financial Company"}\n\n`;

        if (isBank) {
          markdown += `## Revenue\n`;
          markdown += `- Net Interest Income: ${formatCurrency(output.metrics.net_interest_income)}\n`;
          markdown += `- Net Fee Income: ${formatCurrency(output.metrics.net_fee_income)}\n`;
          markdown += `- Trading Gain/Loss: ${formatCurrency(output.metrics.trading_gain_loss)}\n`;
          markdown += `- Investment Gain/Loss: ${formatCurrency(output.metrics.investment_gain_loss)}\n`;
          markdown += `- Other Income: ${formatCurrency(output.metrics.other_income)}\n`;
          markdown += `- **Total Operating Income:** ${formatCurrency(output.metrics.total_operating_income)}\n\n`;
          
          markdown += `## Expenses & Profit\n`;
          markdown += `- Operating Expenses: ${formatCurrency(output.metrics.operating_expenses)}\n`;
          markdown += `- Profit Before Provision: ${formatCurrency(output.metrics.profit_before_provision)}\n`;
          markdown += `- Provision Expense: ${formatCurrency(output.metrics.provision_expense)}\n`;
          markdown += `- **Profit Before Tax:** ${formatCurrency(output.metrics.profit_before_tax)}\n`;
          markdown += `- Income Tax: ${formatCurrency(output.metrics.income_tax)}\n`;
          markdown += `- **Net Profit:** ${formatCurrency(output.metrics.net_profit)}\n`;
        } else {
          markdown += `## Revenue & Gross Profit\n`;
          markdown += `- Revenue: ${formatCurrency(output.metrics.revenue)}\n`;
          markdown += `- Cost of Goods Sold: ${formatCurrency(output.metrics.cost_of_goods_sold)}\n`;
          markdown += `- **Gross Profit:** ${formatCurrency(output.metrics.gross_profit)}\n\n`;
          
          markdown += `## Operating Expenses\n`;
          markdown += `- Financial Income: ${formatCurrency(output.metrics.financial_income)}\n`;
          markdown += `- Financial Expense: ${formatCurrency(output.metrics.financial_expense)}\n`;
          markdown += `- Selling Expense: ${formatCurrency(output.metrics.selling_expense)}\n`;
          markdown += `- Admin Expense: ${formatCurrency(output.metrics.admin_expense)}\n`;
          markdown += `- **Operating Profit:** ${formatCurrency(output.metrics.operating_profit)}\n\n`;
          
          markdown += `## Net Profit\n`;
          markdown += `- Other Income: ${formatCurrency(output.metrics.other_income)}\n`;
          markdown += `- Other Expense: ${formatCurrency(output.metrics.other_expense)}\n`;
          markdown += `- Profit Before Tax: ${formatCurrency(output.metrics.profit_before_tax)}\n`;
          markdown += `- Income Tax: ${formatCurrency(output.metrics.income_tax)}\n`;
          markdown += `- **Net Profit:** ${formatCurrency(output.metrics.net_profit)}\n`;
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
              text: `Error fetching income statement: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Balance Sheet Tool
  server.registerTool(
    "wifeed_get_balance_sheet",
    {
      title: "Get Balance Sheet",
      description: `Get balance sheet (cân đối kế toán) for a Vietnamese company.

This tool retrieves asset, liability, and equity data showing the company's financial position.

Args:
  - code (string): Vietnamese stock ticker symbol
  - type ('quarter' | 'year' | 'ttm'): Report period type
  - nam (number): Year (required for quarterly reports)
  - quy (number): Quarter 1-4 (required for quarterly reports)
  - response_format ('markdown' | 'json'): Output format

Returns balance sheet data including:
  - Current assets (cash, receivables, inventory)
  - Non-current assets (fixed assets, investments)
  - Current liabilities
  - Long-term liabilities
  - Shareholders' equity

Examples:
  - "Get Q2 2024 balance sheet for VNM" -> code="VNM", type="quarter", nam=2024, quy=2
  - "Annual balance sheet for HPG" -> code="HPG", type="year"`,
      inputSchema: BalanceSheetInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: BalanceSheetInput) => {
      try {
        const client = getApiClient();
        const response = await client.request<BalanceSheet[]>(
          "/tai-chinh-doanh-nghiep/bctc/can-doi-ke-toan",
          {
            code: params.code,
            type: params.type,
            nam: params.nam,
            quy: params.quy,
          }
        );

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No balance sheet data found for ${params.code}.`,
              },
            ],
          };
        }

        const data = response[0];

        const output = {
          code: params.code,
          period: params.type === ReportType.QUARTER 
            ? `Q${data.quy}/${data.nam}` 
            : String(data.nam),
          report_type: params.type,
          assets: {
            current_assets: {
              cash: data.tien_va_tuongduong_tien,
              short_term_investments: data.dautunganhan,
              receivables: data.phaithunganhan,
              inventory: data.hangtonkho,
              other: data.taisannganhankhac,
              total: data.taisannganhan,
            },
            non_current_assets: {
              long_term_receivables: data.phaithudaihan,
              fixed_assets_tangible: data.taisancodinhhuuhinh,
              fixed_assets_leased: data.taisancodinhthuetaichinh,
              fixed_assets_intangible: data.taisancodinhvohinh,
              investments_in_associates: data.dautudaihanvaocongtylienket,
              other_investments: data.dautudaihankhac,
              other: data.taisandaihankhac,
              total: data.taisandaihan,
            },
            total_assets: data.tongtaisan,
          },
          liabilities: {
            current_liabilities: {
              payables: data.nophaitra_nganhan,
              short_term_borrowings: data.vaynganhan,
              other: data.nophaitra_khac_nganhan,
              total: data.nophaitra_nganhan_tong,
            },
            non_current_liabilities: {
              long_term_borrowings: data.vaydaihanphaitratungnam,
              other: data.nophaitra_daihankhac_tong,
              total: data.nophaitra_daihan_tong,
            },
            total_liabilities: data.tongnophaitra,
          },
          equity: {
            share_capital: data.voncophan,
            share_premium: data.thangduvon,
            retained_earnings: data.loinhuanchuaphanphoi,
            other_equity: data.vonkhac,
            minority_interest: data.loiichcodongthieuso,
            total_equity: data.tongvonchusohu,
          },
          total_capital: data.tongnguonvon,
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# Balance Sheet - ${params.code}\n\n`;
        markdown += `**Period:** ${output.period}\n`;
        markdown += `**Report Type:** ${output.report_type}\n\n`;

        markdown += `## Assets\n\n`;
        markdown += `### Current Assets\n`;
        markdown += `- Cash & Equivalents: ${formatCurrency(output.assets.current_assets.cash)}\n`;
        markdown += `- Short-term Investments: ${formatCurrency(output.assets.current_assets.short_term_investments)}\n`;
        markdown += `- Receivables: ${formatCurrency(output.assets.current_assets.receivables)}\n`;
        markdown += `- Inventory: ${formatCurrency(output.assets.current_assets.inventory)}\n`;
        markdown += `- **Total Current Assets:** ${formatCurrency(output.assets.current_assets.total)}\n\n`;

        markdown += `### Non-Current Assets\n`;
        markdown += `- Fixed Assets (Tangible): ${formatCurrency(output.assets.non_current_assets.fixed_assets_tangible)}\n`;
        markdown += `- Fixed Assets (Intangible): ${formatCurrency(output.assets.non_current_assets.fixed_assets_intangible)}\n`;
        markdown += `- Investments in Associates: ${formatCurrency(output.assets.non_current_assets.investments_in_associates)}\n`;
        markdown += `- **Total Non-Current Assets:** ${formatCurrency(output.assets.non_current_assets.total)}\n\n`;
        markdown += `### **Total Assets:** ${formatCurrency(output.assets.total_assets)}\n\n`;

        markdown += `## Liabilities\n\n`;
        markdown += `### Current Liabilities\n`;
        markdown += `- Payables: ${formatCurrency(output.liabilities.current_liabilities.payables)}\n`;
        markdown += `- Short-term Borrowings: ${formatCurrency(output.liabilities.current_liabilities.short_term_borrowings)}\n`;
        markdown += `- **Total Current Liabilities:** ${formatCurrency(output.liabilities.current_liabilities.total)}\n\n`;

        markdown += `### Non-Current Liabilities\n`;
        markdown += `- Long-term Borrowings: ${formatCurrency(output.liabilities.non_current_liabilities.long_term_borrowings)}\n`;
        markdown += `- **Total Non-Current Liabilities:** ${formatCurrency(output.liabilities.non_current_liabilities.total)}\n\n`;
        markdown += `### **Total Liabilities:** ${formatCurrency(output.liabilities.total_liabilities)}\n\n`;

        markdown += `## Equity\n`;
        markdown += `- Share Capital: ${formatCurrency(output.equity.share_capital)}\n`;
        markdown += `- Share Premium: ${formatCurrency(output.equity.share_premium)}\n`;
        markdown += `- Retained Earnings: ${formatCurrency(output.equity.retained_earnings)}\n`;
        markdown += `- Minority Interest: ${formatCurrency(output.equity.minority_interest)}\n`;
        markdown += `- **Total Equity:** ${formatCurrency(output.equity.total_equity)}\n\n`;

        markdown += `## **Total Capital:** ${formatCurrency(output.total_capital)}\n`;

        return {
          content: [{ type: "text", text: truncateResponse(markdown) }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error fetching balance sheet: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Cash Flow Statement Tool
  server.registerTool(
    "wifeed_get_cash_flow",
    {
      title: "Get Cash Flow Statement",
      description: `Get cash flow statement (lưu chuyển tiền tệ) for a Vietnamese company.

This tool retrieves cash flow data from operating, investing, and financing activities.

Args:
  - code (string): Vietnamese stock ticker symbol
  - type ('quarter' | 'year' | 'ttm'): Report period type
  - nam (number): Year (required for quarterly reports)
  - quy (number): Quarter 1-4 (required for quarterly reports)
  - response_format ('markdown' | 'json'): Output format

Returns cash flow data including:
  - Operating cash flow
  - Investing cash flow
  - Financing cash flow
  - Net change in cash

Examples:
  - "Get Q1 2024 cash flow for HPG" -> code="HPG", type="quarter", nam=2024, quy=1
  - "Annual cash flow for FPT" -> code="FPT", type="year"`,
      inputSchema: CashFlowStatementInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: CashFlowStatementInput) => {
      try {
        const client = getApiClient();
        const response = await client.request<CashFlowStatement[]>(
          "/tai-chinh-doanh-nghiep/bctc/luu-chuyen-tien-te",
          {
            code: params.code,
            type: params.type,
            nam: params.nam,
            quy: params.quy,
          }
        );

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No cash flow data found for ${params.code}.`,
              },
            ],
          };
        }

        const data = response[0];

        const output = {
          code: params.code,
          period: params.type === ReportType.QUARTER 
            ? `Q${data.quy}/${data.nam}` 
            : String(data.nam),
          report_type: params.type,
          operating_activities: {
            profit_before_tax: data.loinhuan_truocthue,
            depreciation: data.khauhao_tscdhh,
            provisions: data.dudphong,
            fx_gain_loss: data.lailo_chenh_lech_tygia,
            investment_gain_loss: data.lailo_hoatdong_dautu,
            interest_expense: data.chiphi_laivay,
            changes_in_receivables: data.tanggiamphaithu,
            changes_in_inventory: data.tanggiamhangtonkho,
            changes_in_payables: data.tanggiamphaitra,
            taxes_paid: data.tienthua_thuenoidia,
            net_cash_from_operating: data.luuchuyentientekd,
          },
          investing_activities: {
            purchase_of_fixed_assets: data.tien_muatscd,
            sale_of_fixed_assets: data.tien_thu_ban_tscd,
            loans_made: data.tien_vay_cho_vay,
            loan_collections: data.tien_thu_hoi_cho_vay,
            purchase_of_investments: data.tien_mua_gop_von,
            dividends_received: data.tien_thu_lai_covao,
            net_cash_from_investing: data.luuchuyentientedt,
          },
          financing_activities: {
            proceeds_from_borrowings: data.tien_vay_ngan_dai_han,
            repayment_of_borrowings: data.tien_tra_no_vay,
            lease_payments: data.tien_tra_no_thue_tc,
            proceeds_from_share_issue: data.tien_thu_phat_hanh_cp,
            capital_returned: data.tien_tra_von_gop,
            dividends_paid: data.tien_chi_tra_cotuc,
            net_cash_from_financing: data.luuchuyentientetc,
          },
          summary: {
            net_change_in_cash: data.luuchuyentientethuan,
            cash_at_beginning: data.tien_dau_ky,
            fx_effect: data.anh_huong_ty_gia,
            cash_at_end: data.tien_cuoi_ky,
          },
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        let markdown = `# Cash Flow Statement - ${params.code}\n\n`;
        markdown += `**Period:** ${output.period}\n`;
        markdown += `**Report Type:** ${output.report_type}\n\n`;

        markdown += `## Operating Activities\n`;
        markdown += `- Profit Before Tax: ${formatCurrency(output.operating_activities.profit_before_tax)}\n`;
        markdown += `- Depreciation: ${formatCurrency(output.operating_activities.depreciation)}\n`;
        markdown += `- Changes in Receivables: ${formatCurrency(output.operating_activities.changes_in_receivables)}\n`;
        markdown += `- Changes in Inventory: ${formatCurrency(output.operating_activities.changes_in_inventory)}\n`;
        markdown += `- Changes in Payables: ${formatCurrency(output.operating_activities.changes_in_payables)}\n`;
        markdown += `- **Net Cash from Operating:** ${formatCurrency(output.operating_activities.net_cash_from_operating)}\n\n`;

        markdown += `## Investing Activities\n`;
        markdown += `- Purchase of Fixed Assets: ${formatCurrency(output.investing_activities.purchase_of_fixed_assets)}\n`;
        markdown += `- Sale of Fixed Assets: ${formatCurrency(output.investing_activities.sale_of_fixed_assets)}\n`;
        markdown += `- Purchase of Investments: ${formatCurrency(output.investing_activities.purchase_of_investments)}\n`;
        markdown += `- Dividends Received: ${formatCurrency(output.investing_activities.dividends_received)}\n`;
        markdown += `- **Net Cash from Investing:** ${formatCurrency(output.investing_activities.net_cash_from_investing)}\n\n`;

        markdown += `## Financing Activities\n`;
        markdown += `- Proceeds from Borrowings: ${formatCurrency(output.financing_activities.proceeds_from_borrowings)}\n`;
        markdown += `- Repayment of Borrowings: ${formatCurrency(output.financing_activities.repayment_of_borrowings)}\n`;
        markdown += `- Dividends Paid: ${formatCurrency(output.financing_activities.dividends_paid)}\n`;
        markdown += `- **Net Cash from Financing:** ${formatCurrency(output.financing_activities.net_cash_from_financing)}\n\n`;

        markdown += `## Summary\n`;
        markdown += `- Cash at Beginning: ${formatCurrency(output.summary.cash_at_beginning)}\n`;
        markdown += `- Net Change in Cash: ${formatCurrency(output.summary.net_change_in_cash)}\n`;
        markdown += `- FX Effect: ${formatCurrency(output.summary.fx_effect)}\n`;
        markdown += `- **Cash at End:** ${formatCurrency(output.summary.cash_at_end)}\n`;

        return {
          content: [{ type: "text", text: truncateResponse(markdown) }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error fetching cash flow statement: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Financial Ratios Tool
  server.registerTool(
    "wifeed_get_financial_ratios",
    {
      title: "Get Financial Ratios",
      description: `Get financial ratios (chỉ số tài chính) for a Vietnamese company.

This tool retrieves key financial ratios including valuation, profitability, and efficiency metrics.

Args:
  - code (string): Vietnamese stock ticker symbol
  - type ('quarter' | 'year' | 'ttm' | 'daily'): Report period type
  - from_date (string): Start date filter (required for daily type, format: YYYY-MM-DD)
  - to_date (string): End date filter (format: YYYY-MM-DD)
  - quy (number): Quarter number 1-4 (for quarterly reports)
  - nam (number): Year (for quarterly/yearly reports)
  - response_format ('markdown' | 'json'): Output format

Returns financial ratios including:
  - Valuation: P/E, P/B, P/S, EV/EBITDA
  - Profitability: ROE, ROA, ROS, ROIC
  - Growth: Revenue growth, Profit growth, EPS growth
  - Efficiency: Asset turnover, Inventory turnover
  - Leverage: Debt/Equity, Debt/Asset, Current ratio
  - Per share: EPS, BVPS, Dividend yield

Examples:
  - "Get TTM financial ratios for VNM" -> code="VNM", type="ttm"
  - "Get Q3 2024 ratios for TCB" -> code="TCB", type="quarter", quy=3, nam=2024
  - "Get daily ratios for HPG" -> code="HPG", type="daily", from_date="2024-01-01"`,
      inputSchema: FinancialRatiosInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: FinancialRatiosInput) => {
      try {
        const client = getApiClient();
        const response = await client.request<FinancialRatios[]>(
          "/tai-chinh-doanh-nghiep/v2/chi-so-tai-chinh",
          {
            code: params.code,
            type: params.type,
            "from-date": params.from_date,
            "to-date": params.to_date,
            quy: params.quy,
            nam: params.nam,
          }
        );

        if (!response || response.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No financial ratios data found for ${params.code}.`,
              },
            ],
          };
        }

        const data = response[0];

        const output = {
          code: params.code,
          period: params.type === ReportType.QUARTER 
            ? `Q${data.quy}/${data.nam}` 
            : params.type === ReportType.TTM 
              ? "TTM"
              : String(data.nam),
          report_type: params.type,
          valuation: {
            pe: data.pe,
            pb: data.pb,
            ps: data.ps,
            pcf: data.pcf,
            ev_ebitda: data.ev_ebitda,
          },
          profitability: {
            roe: data.roe,
            roa: data.roa,
            ros: data.ros,
            roic: data.roic,
          },
          growth: {
            revenue_growth: data.revenue_growth,
            profit_growth: data.profit_growth,
            eps_growth: data.eps_growth,
          },
          efficiency: {
            asset_turnover: data.asset_turnover,
            inventory_turnover: data.inventory_turnover,
            receivable_turnover: data.receivable_turnover,
          },
          leverage: {
            debt_to_equity: data.debt_to_equity,
            debt_to_asset: data.debt_to_asset,
            current_ratio: data.current_ratio,
            quick_ratio: data.quick_ratio,
          },
          per_share: {
            eps: data.eps,
            bvps: data.bvps,
            dividend_yield: data.dividend_yield,
          },
        };

        if (params.response_format === ResponseFormat.JSON) {
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        // Markdown format
        const formatRatio = (val: number | undefined, isPercent = false): string => {
          if (val === undefined || val === null) return "N/A";
          return isPercent ? `${(val * 100).toFixed(2)}%` : val.toFixed(2);
        };

        let markdown = `# Financial Ratios - ${params.code}\n\n`;
        markdown += `**Period:** ${output.period}\n`;
        markdown += `**Report Type:** ${output.report_type}\n\n`;

        markdown += `## Valuation Ratios\n`;
        markdown += `- P/E Ratio: ${formatRatio(output.valuation.pe)}\n`;
        markdown += `- P/B Ratio: ${formatRatio(output.valuation.pb)}\n`;
        markdown += `- P/S Ratio: ${formatRatio(output.valuation.ps)}\n`;
        markdown += `- P/CF Ratio: ${formatRatio(output.valuation.pcf)}\n`;
        markdown += `- EV/EBITDA: ${formatRatio(output.valuation.ev_ebitda)}\n\n`;

        markdown += `## Profitability Ratios\n`;
        markdown += `- ROE: ${formatRatio(output.profitability.roe, true)}\n`;
        markdown += `- ROA: ${formatRatio(output.profitability.roa, true)}\n`;
        markdown += `- ROS: ${formatRatio(output.profitability.ros, true)}\n`;
        markdown += `- ROIC: ${formatRatio(output.profitability.roic, true)}\n\n`;

        markdown += `## Growth Rates\n`;
        markdown += `- Revenue Growth: ${formatRatio(output.growth.revenue_growth, true)}\n`;
        markdown += `- Profit Growth: ${formatRatio(output.growth.profit_growth, true)}\n`;
        markdown += `- EPS Growth: ${formatRatio(output.growth.eps_growth, true)}\n\n`;

        markdown += `## Efficiency Ratios\n`;
        markdown += `- Asset Turnover: ${formatRatio(output.efficiency.asset_turnover)}\n`;
        markdown += `- Inventory Turnover: ${formatRatio(output.efficiency.inventory_turnover)}\n`;
        markdown += `- Receivable Turnover: ${formatRatio(output.efficiency.receivable_turnover)}\n\n`;

        markdown += `## Leverage Ratios\n`;
        markdown += `- Debt/Equity: ${formatRatio(output.leverage.debt_to_equity)}\n`;
        markdown += `- Debt/Asset: ${formatRatio(output.leverage.debt_to_asset)}\n`;
        markdown += `- Current Ratio: ${formatRatio(output.leverage.current_ratio)}\n`;
        markdown += `- Quick Ratio: ${formatRatio(output.leverage.quick_ratio)}\n\n`;

        markdown += `## Per Share Data\n`;
        markdown += `- EPS: ${formatCurrency(output.per_share.eps)}\n`;
        markdown += `- BVPS: ${formatCurrency(output.per_share.bvps)}\n`;
        markdown += `- Dividend Yield: ${formatRatio(output.per_share.dividend_yield, true)}\n`;

        return {
          content: [{ type: "text", text: truncateResponse(markdown) }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error fetching financial ratios: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}
