import axios, { AxiosInstance, AxiosError } from "axios";
import { WIFEED_BASE_URL, CHARACTER_LIMIT } from "../constants.js";

// Debug logging for API responses
const DEBUG_API = process.env.DEBUG_WIFEED_API === "true";

function debugLog(endpoint: string, response: unknown): void {
  if (!DEBUG_API) return;
  console.error(`\n[DEBUG] Endpoint: ${endpoint}`);
  console.error(`[DEBUG] Response type: ${Array.isArray(response) ? "Array" : typeof response}`);
  if (Array.isArray(response) && response.length > 0) {
    console.error(`[DEBUG] Array length: ${response.length}`);
    console.error(`[DEBUG] First item keys: ${Object.keys(response[0]).join(", ")}`);
    console.error(`[DEBUG] First item: ${JSON.stringify(response[0], null, 2)}`);
  } else if (response && typeof response === "object") {
    console.error(`[DEBUG] Object keys: ${Object.keys(response).join(", ")}`);
    const r = response as Record<string, unknown>;
    if ("data" in r) {
      const data = r.data;
      if (Array.isArray(data) && data.length > 0) {
        console.error(`[DEBUG] data array length: ${data.length}`);
        console.error(`[DEBUG] data[0] keys: ${Object.keys(data[0]).join(", ")}`);
        console.error(`[DEBUG] data[0]: ${JSON.stringify(data[0], null, 2)}`);
      }
    }
  }
}

// API Client for WiFeed
export class WiFeedApiClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: WIFEED_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async request<T>(
    endpoint: string,
    params: Record<string, string | number | undefined> = {}
  ): Promise<T> {
    try {
      // Add API key to params
      const queryParams = {
        ...params,
        apikey: this.apiKey,
      };

      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([, v]) => v !== undefined)
      );

      const response = await this.client.get<T>(endpoint, {
        params: cleanParams,
      });

      // Debug logging
      debugLog(endpoint, response.data);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const statusCode = axiosError.response?.status;
        const statusText = axiosError.response?.statusText;

        if (statusCode === 401) {
          throw new Error(
            "Authentication failed. Please check your WiFeed API key."
          );
        }
        if (statusCode === 403) {
          throw new Error(
            "Access denied. Your API key may not have permission for this endpoint."
          );
        }
        if (statusCode === 404) {
          throw new Error(
            `Endpoint not found: ${endpoint}. Please verify the stock code or parameters.`
          );
        }
        if (statusCode === 429) {
          throw new Error(
            "Rate limit exceeded. Please wait before making more requests."
          );
        }
        if (statusCode && statusCode >= 500) {
          throw new Error(
            `WiFeed server error (${statusCode}): ${statusText}. Please try again later.`
          );
        }

        throw new Error(
          `WiFeed API error: ${axiosError.message}. Status: ${statusCode || "unknown"}`
        );
      }

      throw new Error(`Unexpected error: ${String(error)}`);
    }
  }
}

// Formatting helpers
export function formatCurrency(
  value: number | null | undefined,
  unit: string = "VND"
): string {
  if (value === null || value === undefined) return "N/A";
  
  const absValue = Math.abs(value);
  let formatted: string;
  
  if (absValue >= 1e12) {
    formatted = (value / 1e12).toFixed(2) + " nghìn tỷ";
  } else if (absValue >= 1e9) {
    formatted = (value / 1e9).toFixed(2) + " tỷ";
  } else if (absValue >= 1e6) {
    formatted = (value / 1e6).toFixed(2) + " triệu";
  } else if (absValue >= 1e3) {
    formatted = (value / 1e3).toFixed(2) + " nghìn";
  } else {
    formatted = value.toFixed(2);
  }
  
  return `${formatted} ${unit}`;
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `${(value * 100).toFixed(2)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return value.toLocaleString("vi-VN");
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function truncateResponse(content: string): string {
  if (content.length <= CHARACTER_LIMIT) {
    return content;
  }
  
  const truncated = content.substring(0, CHARACTER_LIMIT);
  const lastNewline = truncated.lastIndexOf("\n");
  
  return (
    (lastNewline > CHARACTER_LIMIT * 0.8 ? truncated.substring(0, lastNewline) : truncated) +
    "\n\n... [Response truncated due to size limit. Use pagination parameters to get more data.]"
  );
}

// Pagination helper
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextPage: number | null;
}

export function paginateArray<T>(
  items: T[],
  page: number,
  limit: number
): PaginationResult<T> {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedItems = items.slice(start, end);
  const hasMore = end < items.length;
  
  return {
    items: paginatedItems,
    total: items.length,
    page,
    limit,
    hasMore,
    nextPage: hasMore ? page + 1 : null,
  };
}

// Helper to normalize API responses that may be arrays or objects with data property
export function normalizeArrayResponse<T>(response: T[] | { data: T[] } | { data: T[] | { data: T[] } } | Record<string, unknown>): T[] {
  // Direct array
  if (Array.isArray(response)) {
    return response;
  }

  // Object with data array
  if (response && typeof response === "object" && "data" in response) {
    const data = (response as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data;
    }
    // Nested data.data structure
    if (data && typeof data === "object" && "data" in (data as Record<string, unknown>)) {
      const nestedData = (data as { data: unknown }).data;
      if (Array.isArray(nestedData)) {
        return nestedData;
      }
    }
  }

  // Single object - wrap in array
  if (response && typeof response === "object" && !Array.isArray(response)) {
    // Check if it looks like a data item (has expected fields, not just meta info)
    const keys = Object.keys(response);
    if (keys.length > 0 && !keys.includes("meta") && !keys.includes("pagination")) {
      return [response as T];
    }
  }

  return [];
}

// Global API client instance
let apiClient: WiFeedApiClient | null = null;

export function getApiClient(): WiFeedApiClient {
  if (!apiClient) {
    const apiKey = process.env.WIFEED_API_KEY;
    if (!apiKey) {
      throw new Error(
        "WIFEED_API_KEY environment variable is not set. " +
        "Please set it before starting the server."
      );
    }
    apiClient = new WiFeedApiClient(apiKey);
  }
  return apiClient;
}

export function initializeApiClient(apiKey: string): void {
  apiClient = new WiFeedApiClient(apiKey);
}
