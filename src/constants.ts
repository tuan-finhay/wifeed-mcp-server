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
  TTM = "ttm"
}

// Response formats
export enum ResponseFormat {
  JSON = "json",
  MARKDOWN = "markdown"
}

// Analysis report types
export enum AnalysisReportType {
  ALL = 1,
  INDUSTRY = 2,
  COMPANY = 3
}

// Commodity data types
export enum CommodityDataType {
  VALUE_TODAY = "value_today",
  CHANGE_1D = "change_1d",
  CHANGE_MTD = "change_mtd",
  CHANGE_YTD = "change_ytd"
}
