import { z } from "zod";
import {
  ReportType,
  ResponseFormat,
  AnalysisReportType,
  CommodityDataType,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from "../constants.js";

// Common schemas
export const StockCodeSchema = z
  .string()
  .min(1, "Stock code is required")
  .max(10, "Stock code must not exceed 10 characters")
  .toUpperCase()
  .describe("Vietnamese stock ticker symbol (e.g., VNM, HPG, TCB)");

export const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .describe("Date in YYYY-MM-DD format");

export const ByTimeSchema = z
  .enum(["created_at", "updated_at"])
  .describe("Filter by created_at or updated_at timestamp");

export const PageSchema = z
  .number()
  .int()
  .min(1, "Page must be at least 1")
  .default(1)
  .describe("Page number for pagination (starts from 1)");

export const LimitSchema = z
  .number()
  .int()
  .min(1, "Limit must be at least 1")
  .max(MAX_PAGE_LIMIT, `Limit cannot exceed ${MAX_PAGE_LIMIT}`)
  .default(DEFAULT_PAGE_LIMIT)
  .describe("Maximum number of results per page");

export const ResponseFormatSchema = z
  .nativeEnum(ResponseFormat)
  .default(ResponseFormat.MARKDOWN)
  .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable");

export const YearSchema = z
  .number()
  .int()
  .min(2000, "Year must be at least 2000")
  .max(2030, "Year cannot exceed 2030")
  .describe("Year for the report (e.g., 2024)");

export const QuarterSchema = z
  .number()
  .int()
  .min(1, "Quarter must be 1-4")
  .max(4, "Quarter must be 1-4")
  .describe("Quarter number (1-4)");

export const ReportTypeSchema = z
  .nativeEnum(ReportType)
  .default(ReportType.QUARTER)
  .describe("Report type: 'quarter' for quarterly, 'year' for annual, 'ttm' for trailing twelve months");

// Tool-specific schemas

// Insider Trading
export const InsiderTradingInputSchema = z.object({
  code: StockCodeSchema,
  page: PageSchema,
  limit: LimitSchema,
  by_time: ByTimeSchema.optional().describe("Filter by created_at or updated_at"),
  from_date: DateSchema.optional().describe("Start date filter (YYYY-MM-DD)"),
  to_date: DateSchema.optional().describe("End date filter (YYYY-MM-DD)"),
  from_time: DateSchema.optional().describe("Start time filter (YYYY-MM-DD)"),
  to_time: DateSchema.optional().describe("End time filter (YYYY-MM-DD)"),
  response_format: ResponseFormatSchema,
}).strict();

// Income Statement
export const IncomeStatementInputSchema = z.object({
  code: StockCodeSchema,
  type: ReportTypeSchema,
  nam: YearSchema.optional().describe("Year for the report (required for quarterly reports)"),
  quy: QuarterSchema.optional().describe("Quarter number (required for quarterly reports)"),
  response_format: ResponseFormatSchema,
}).strict();

// Balance Sheet
export const BalanceSheetInputSchema = z.object({
  code: StockCodeSchema,
  type: ReportTypeSchema,
  nam: YearSchema.optional().describe("Year for the report (required for quarterly reports)"),
  quy: QuarterSchema.optional().describe("Quarter number (required for quarterly reports)"),
  response_format: ResponseFormatSchema,
}).strict();

// Cash Flow Statement
export const CashFlowStatementInputSchema = z.object({
  code: StockCodeSchema,
  type: ReportTypeSchema,
  nam: YearSchema.optional().describe("Year for the report (required for quarterly reports)"),
  quy: QuarterSchema.optional().describe("Quarter number (required for quarterly reports)"),
  response_format: ResponseFormatSchema,
}).strict();

// Financial Ratios
export const FinancialRatiosInputSchema = z.object({
  code: StockCodeSchema,
  type: ReportTypeSchema,
  from_date: DateSchema.optional().describe("Start date filter (required for daily type)"),
  to_date: DateSchema.optional().describe("End date filter"),
  quy: QuarterSchema.optional().describe("Quarter number (for quarterly reports)"),
  nam: YearSchema.optional().describe("Year (for quarterly/yearly reports)"),
  response_format: ResponseFormatSchema,
}).strict();

// Analysis Reports
export const AnalysisReportsInputSchema = z.object({
  code: StockCodeSchema.optional().describe("Stock code to filter reports (optional)"),
  type: z
    .nativeEnum(AnalysisReportType)
    .default(AnalysisReportType.COMPANY)
    .describe("Report type: 1=Company, 2=Industry, 3=Macro, 4=Strategy"),
  page: PageSchema,
  limit: LimitSchema,
  from_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .describe("Filter reports from this date (YYYY-MM-DD)"),
  to_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .describe("Filter reports until this date (YYYY-MM-DD)"),
  response_format: ResponseFormatSchema,
}).strict();

// Policy Interest Rate
export const PolicyInterestRateInputSchema = z.object({
  page: PageSchema,
  limit: LimitSchema,
  by_time: ByTimeSchema.optional(),
  from_date: DateSchema.optional().describe("Start date filter (min: 2020-01-01)"),
  to_date: DateSchema.optional().describe("End date filter"),
  from_time: DateSchema.optional().describe("Start time filter"),
  to_time: DateSchema.optional().describe("End time filter"),
  response_format: ResponseFormatSchema,
}).strict();

// Interbank Interest Rate
export const InterbankRateInputSchema = z.object({
  page: PageSchema,
  limit: LimitSchema,
  by_time: ByTimeSchema.optional(),
  from_date: DateSchema.optional().describe("Start date filter (min: 2018-01-01)"),
  to_date: DateSchema.optional().describe("End date filter"),
  from_time: DateSchema.optional().describe("Start time filter"),
  to_time: DateSchema.optional().describe("End time filter"),
  response_format: ResponseFormatSchema,
}).strict();

// Deposit Rate by Bank Group
export const DepositRateByGroupInputSchema = z.object({
  page: PageSchema,
  limit: LimitSchema,
  by_time: ByTimeSchema.optional(),
  from_date: DateSchema.optional().describe("Start date filter (min: 2018-01-01)"),
  to_date: DateSchema.optional().describe("End date filter"),
  from_time: DateSchema.optional().describe("Start time filter"),
  to_time: DateSchema.optional().describe("End time filter"),
  response_format: ResponseFormatSchema,
}).strict();

// Deposit Rate by Bank
export const DepositRateByBankInputSchema = z.object({
  ky_han: z
    .number()
    .int()
    .min(1, "Term must be at least 1 month")
    .max(36, "Term cannot exceed 36 months")
    .describe("Deposit term in months (e.g., 1, 3, 6, 9, 12, 24)"),
  limit: LimitSchema.default(100),
  by_time: ByTimeSchema.optional(),
  from_date: DateSchema.optional().describe("Start date filter (min: 2018-01-01)"),
  to_date: DateSchema.optional().describe("End date filter"),
  from_time: DateSchema.optional().describe("Start time filter"),
  to_time: DateSchema.optional().describe("End time filter"),
  response_format: ResponseFormatSchema,
}).strict();

// Exchange Rate
export const ExchangeRateInputSchema = z.object({
  page: PageSchema,
  limit: LimitSchema.default(100),
  by_time: ByTimeSchema.optional(),
  from_date: DateSchema.optional().describe("Start date filter"),
  to_date: DateSchema.optional().describe("End date filter"),
  from_time: DateSchema.optional().describe("Start time filter"),
  to_time: DateSchema.optional().describe("End time filter"),
  response_format: ResponseFormatSchema,
}).strict();

// International Commodity
export const InternationalCommodityInputSchema = z.object({
  page: PageSchema,
  limit: LimitSchema.default(100),
  data_type: z
    .nativeEnum(CommodityDataType)
    .default(CommodityDataType.VALUE_TODAY)
    .describe("Data type: value_today, change_today, diff_day, diff_month, diff_year"),
  by_time: ByTimeSchema.optional(),
  from_date: DateSchema.optional().describe("Start date filter (min: 2018-01-01)"),
  to_date: DateSchema.optional().describe("End date filter"),
  from_time: DateSchema.optional().describe("Start time filter"),
  response_format: ResponseFormatSchema,
}).strict();

// Domestic Commodity
export const DomesticCommodityInputSchema = z.object({
  page: PageSchema,
  limit: LimitSchema.default(100),
  data_type: z
    .nativeEnum(CommodityDataType)
    .default(CommodityDataType.VALUE_TODAY)
    .describe("Data type: value_today, change_today, diff_day, diff_month, diff_year"),
  by_time: ByTimeSchema.optional(),
  from_time: DateSchema.optional().describe("Start time filter"),
  response_format: ResponseFormatSchema,
}).strict();

// Other Exchange Rate
export const OtherExchangeRateInputSchema = z.object({
  page: PageSchema,
  limit: LimitSchema.default(100),
  by_time: ByTimeSchema.optional(),
  from_date: DateSchema.optional().describe("Start date filter"),
  to_date: DateSchema.optional().describe("End date filter"),
  from_time: DateSchema.optional().describe("Start time filter"),
  to_time: DateSchema.optional().describe("End time filter"),
  response_format: ResponseFormatSchema,
}).strict();

// Type exports
export type InsiderTradingInput = z.infer<typeof InsiderTradingInputSchema>;
export type IncomeStatementInput = z.infer<typeof IncomeStatementInputSchema>;
export type BalanceSheetInput = z.infer<typeof BalanceSheetInputSchema>;
export type CashFlowStatementInput = z.infer<typeof CashFlowStatementInputSchema>;
export type FinancialRatiosInput = z.infer<typeof FinancialRatiosInputSchema>;
export type AnalysisReportsInput = z.infer<typeof AnalysisReportsInputSchema>;
export type PolicyInterestRateInput = z.infer<typeof PolicyInterestRateInputSchema>;
export type InterbankRateInput = z.infer<typeof InterbankRateInputSchema>;
export type DepositRateByGroupInput = z.infer<typeof DepositRateByGroupInputSchema>;
export type DepositRateByBankInput = z.infer<typeof DepositRateByBankInputSchema>;
export type ExchangeRateInput = z.infer<typeof ExchangeRateInputSchema>;
export type InternationalCommodityInput = z.infer<typeof InternationalCommodityInputSchema>;
export type DomesticCommodityInput = z.infer<typeof DomesticCommodityInputSchema>;
export type OtherExchangeRateInput = z.infer<typeof OtherExchangeRateInputSchema>;
