// WiFeed API Configuration
export const WIFEED_BASE_URL = "https://wifeed.vn/api";

// Response limits
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
export const CHARACTER_LIMIT = 50000;

// Report types
export enum ReportType {
  QUARTER = "quarter",
  YEAR = "year",
  TTM = "ttm",
  DAILY = "daily"
}

// Response formats
export enum ResponseFormat {
  JSON = "json",
  MARKDOWN = "markdown"
}

// Analysis report types (per API documentation)
export enum AnalysisReportType {
  COMPANY = 1,    // Báo cáo doanh nghiệp
  INDUSTRY = 2,   // Báo cáo ngành
  MACRO = 3,      // Báo cáo vĩ mô
  STRATEGY = 4    // Báo cáo chiến lược
}

// Commodity data types
export enum CommodityDataType {
  VALUE_TODAY = "value_today",
  CHANGE_TODAY = "change_today",
  DIFF_DAY = "diff_day",
  DIFF_MONTH = "diff_month",
  DIFF_YEAR = "diff_year"
}
