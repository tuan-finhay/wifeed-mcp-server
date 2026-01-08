// WiFeed API Response Types

// Meta information for paginated responses
export interface PaginationMeta {
  total_page?: number;
  total_count?: number;
  page?: number;
  limit?: number;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  meta?: PaginationMeta;
  data: T[];
}

// Insider Trading (Giao dịch nội bộ)
export interface InsiderTrading {
  id: string;
  code: string;
  type: string;  // "Mua" or "Bán"
  name: string;
  position: string | null;
  relationship_name: string | null;
  relationship_position: string | null;
  share_before: number | null;
  amount_reg: number;
  start_reg: string;
  end_reg: string;
  amount_result: number;
  date_result: string;
  share_after: number | null;
  ratio: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

// Income Statement (Kết quả kinh doanh)
export interface IncomeStatement {
  code: string;
  quy?: number;
  nam: number;
  // Non-bank companies
  doanhthu?: number;
  giavon?: number;
  loinhuan_gop?: number;
  doanhthu_taichinh?: number;
  chiphi_taichinh?: number;
  chiphi_banhang?: number;
  chiphi_quanly?: number;
  loinhuan_thuan_hdkd?: number;
  thunhap_khac?: number;
  chiphi_khac?: number;
  loinhuan_khac?: number;
  loinhuan_truocthue?: number;
  chiphi_thuetndn?: number;
  loinhuan_sauthue?: number;
  loiich_codongthieuso?: number;
  loinhuan_congty_me?: number;
  // Bank companies
  thunhaplaivacackhoanthunhaptuongtu?: number;
  chiphilaivacacchiphituongtu?: number;
  thunhaplaithuan?: number;
  thunhaptuhoatdongdichvu?: number;
  chiphihoatdongdichvu?: number;
  laithuantuhoatdongdichvu?: number;
  lailothuantuhoaydongkinhdoanhngoaihoivavang?: number;
  lailothuantumuabanchungkhoankinhdoanh?: number;
  lailothuantumuabanchungkhoandautu?: number;
  thunhaptuhoatdongkhac?: number;
  chiphihoatdongkhac?: number;
  lailothuantuhoatdongkhac?: number;
  thunhaptugopvonmuacophan?: number;
  tongthunhaphoatdong?: number;
  chiphihoatdong?: number;
  loinhuanthuantuhdkdtruocchiphiduphongruirotindung?: number;
  chiphiduphongruirotindung?: number;
  tongloinhuantruocthue?: number;
  chiphithuetndnhienhanh?: number;
  chiphithuetndnhoanlai?: number;
  chiphithuethunhapdoanhnghiep?: number;
  loinhuansauthue?: number;
  loiichcuacodongthieuso_pl?: number;
  codongcuacongtyme?: number;
  donvikiemtoan?: string | null;
  ykienkiemtoan?: string | null;
  created_at: string;
  updated_at: string;
}

// Balance Sheet (Cân đối kế toán)
export interface BalanceSheet {
  code: string;
  quy?: number;
  nam: number;
  // Assets
  tien_va_tuongduong_tien?: number;
  dautunganhan?: number;
  phaithunganhan?: number;
  hangtonkho?: number;
  taisannganhankhac?: number;
  taisannganhan?: number;
  phaithudaihan?: number;
  taisancodinhhuuhinh?: number;
  taisancodinhthuetaichinh?: number;
  taisancodinhvohinh?: number;
  dautudaihanvaocongtylienket?: number;
  dautudaihankhac?: number;
  taisandaihankhac?: number;
  taisandaihan?: number;
  tongtaisan?: number;
  // Liabilities
  nophaitra_nganhan?: number;
  nophaitra_daihandenhan?: number;
  vaynganhan?: number;
  nophaitra_khac_nganhan?: number;
  nophaitra_nganhan_tong?: number;
  nophaitra_daihankhac?: number;
  vaydaihanphaitratungnam?: number;
  nophaitra_daihankhac_tong?: number;
  nophaitra_daihankhac_doituongkhac?: number;
  nophaitra_daihan_tong?: number;
  tongnophaitra?: number;
  // Equity
  voncophan?: number;
  thangduvon?: number;
  loinhuanchuaphanphoi?: number;
  vongop?: number;
  vonkhac?: number;
  loiichcodongthieuso?: number;
  tongvonchusohu?: number;
  tongnguonvon?: number;
  created_at: string;
  updated_at: string;
}

// Cash Flow Statement (Lưu chuyển tiền tệ)
export interface CashFlowStatement {
  code: string;
  quy?: number;
  nam: number;
  // Operating activities
  loinhuan_truocthue?: number;
  khauhao_tscdhh?: number;
  dudphong?: number;
  lailo_chenh_lech_tygia?: number;
  lailo_hoatdong_dautu?: number;
  chiphi_laivay?: number;
  thusuaphailai?: number;
  tanggiamphaithu?: number;
  tanggiamhangtonkho?: number;
  tanggiamphaitra?: number;
  tanggiamchiphitratruoc?: number;
  tienthua_thuenoidia?: number;
  tien_chitra_nganhan?: number;
  luuchuyentientekd?: number;
  // Investing activities
  tien_muatscd?: number;
  tien_thu_ban_tscd?: number;
  tien_vay_cho_vay?: number;
  tien_thu_hoi_cho_vay?: number;
  tien_mua_congcu_no?: number;
  tien_thu_ban_congcu_no?: number;
  tien_mua_gop_von?: number;
  tien_thu_lai_covao?: number;
  luuchuyentientedt?: number;
  // Financing activities
  tien_vay_ngan_dai_han?: number;
  tien_tra_no_vay?: number;
  tien_tra_no_thue_tc?: number;
  tien_thu_phat_hanh_cp?: number;
  tien_tra_von_gop?: number;
  tien_chi_tra_cotuc?: number;
  luuchuyentientetc?: number;
  // Net cash flow
  luuchuyentientethuan?: number;
  tien_dau_ky?: number;
  anh_huong_ty_gia?: number;
  tien_cuoi_ky?: number;
  created_at: string;
  updated_at: string;
}

// Financial Ratios (Chỉ số tài chính)
export interface FinancialRatios {
  code: string;
  quy?: number;
  nam: number;
  type?: string;
  // Valuation ratios
  pe?: number;
  pb?: number;
  ps?: number;
  pcf?: number;
  ev_ebitda?: number;
  // Profitability ratios
  roe?: number;
  roa?: number;
  ros?: number;
  roic?: number;
  // Growth ratios
  revenue_growth?: number;
  profit_growth?: number;
  eps_growth?: number;
  // Efficiency ratios
  asset_turnover?: number;
  inventory_turnover?: number;
  receivable_turnover?: number;
  // Leverage ratios
  debt_to_equity?: number;
  debt_to_asset?: number;
  current_ratio?: number;
  quick_ratio?: number;
  // Per share data
  eps?: number;
  bvps?: number;
  dividend_yield?: number;
  created_at: string;
  updated_at: string;
}

// Analysis Report (Báo cáo phân tích)
export interface AnalysisReport {
  id: number;
  code: string;
  mack?: string;  // Stock code in Vietnamese
  title: string;
  tenbaocao?: string;  // Report title in Vietnamese
  source: string;
  nguon?: string;  // Source in Vietnamese
  type: number;
  publish_date: string;
  file_url: string;
  filebaocao?: string;  // Original report file link
  // Recommendation fields
  khuyennghi?: string;  // Recommendation: Mua, Khác, Trung lập
  giamuctieu?: number;  // Target price
  giamuctieu_dieuchinrh?: number;  // Adjusted target price
  upside_hientai?: number;  // Current upside
  // Forecast fields
  lnst_duphong?: number;  // Net profit forecast year n
  lnst_duphong_n1?: number;  // Net profit forecast year n+1
  lnst_duphong_n2?: number;  // Net profit forecast year n+2
  doanhthu_duphong?: number;  // Revenue forecast year n
  doanhthu_duphong_n1?: number;  // Revenue forecast year n+1
  doanhthu_duphong_n2?: number;  // Revenue forecast year n+2
  pe_mack_n0?: number;  // Forward P/E
  created_at: string;
  updated_at: string;
}

// Policy Interest Rate (Lãi suất chính sách)
// API returns a flat structure with many rate types per date
export interface PolicyInterestRate {
  ngay: string;
  kieu_thoi_gian?: number;
  // Key policy rates
  lai_suat_dieu_hanh_tai_cap_von?: number;
  lai_suat_dieu_hanh_chiet_khau?: number;
  lai_suat_dieu_hanh_omo?: number;
  lai_suat_dieu_hanh_tin_phieu?: number;
  // SBV bills rates by term
  sbv_bills_ls_7_ngay?: number;
  sbv_bills_ls_14_ngay?: number;
  sbv_bills_ls_28_ngay?: number;
  sbv_bills_lstb?: number;
  // OMO rates by term
  omo_ls_7_ngay?: number;
  omo_ls_14_ngay?: number;
  omo_ls_28_ngay?: number;
  omo_lstb?: number;
  // Other policy rates
  ls_cho_vay_bu_dap_thieu_hut_von_nhnn?: number;
  ls_toi_da_1_thang?: number;
  ls_toi_da_6_thang?: number;
  ls_toi_da_6_thang_quy_tin_dung_nd?: number;
  ls_du_tru_bat_buoc_vnd?: number;
  ls_du_tru_bat_buoc_ngoai_te?: number;
  ls_vuot_du_tru_bat_buoc_vnd?: number;
  ls_vuot_du_tru_bat_buoc_ngoai_te?: number;
  created_at: string;
  updated_at: string;
}

// Interbank Interest Rate (Lãi suất liên ngân hàng)
// API returns rates and trading volumes per date
export interface InterbankRate {
  ngay: string;
  kieu_thoi_gian?: number;
  federal_funds_rate?: number;
  // Interest rates by term
  lai_suat_lien_nh_on?: number;  // overnight
  lai_suat_lien_nh_1w?: number;  // 1 week
  lai_suat_lien_nh_2w?: number;  // 2 weeks
  lai_suat_lien_nh_1m?: number;  // 1 month
  lai_suat_lien_nh_3m?: number;  // 3 months
  lai_suat_lien_nh_6m?: number;  // 6 months
  lai_suat_lien_nh_9m?: number;  // 9 months
  // Trading volumes by term
  doanh_so_lien_nh_on?: number;
  doanh_so_lien_nh_1w?: number;
  doanh_so_lien_nh_2w?: number;
  doanh_so_lien_nh_1m?: number;
  doanh_so_lien_nh_3m?: number;
  doanh_so_lien_nh_6m?: number;
  doanh_so_lien_nh_9m?: number;
  created_at: string;
  updated_at: string;
}

// Deposit Interest Rate by Bank Group (Lãi suất huy động theo nhóm ngân hàng)
export interface DepositRateByGroup {
  id: number;
  date: string;
  bank_group: string;
  term: string;
  rate: number;
  created_at: string;
  updated_at: string;
}

// Deposit Interest Rate by Bank (Lãi suất huy động từng ngân hàng)
export interface DepositRateByBank {
  id: number;
  date: string;
  bank_code: string;
  bank_name: string;
  term: number;
  rate: number;
  created_at: string;
  updated_at: string;
}

// Exchange Rate (Tỷ giá)
// API returns USD rates per date in a flat structure
export interface ExchangeRate {
  ngay: string;
  kieu_thoi_gian?: number;
  // Commercial bank rates
  usd_nhtm_mua_vao?: number;
  usd_nhtm_ban_ra?: number;
  usd_nhtm_chuyen_khoan?: number;
  // Free market rates
  usd_tu_do_mua_vao?: number;
  usd_tu_do_ban_ra?: number;
  // SBV rates
  usd_nhnn_trung_tam?: number;
  usd_nhnn_tran?: number;
  usd_nhnn_san?: number;
  usd_nhnn_mua_vao?: number;
  usd_nhnn_ban_ra?: number;
  created_at: string;
  updated_at: string;
}

// International Commodity Price (Giá hàng hóa quốc tế)
// API returns a flat structure with commodity names as keys
// Each commodity has its own column with value (or change depending on data_type)
export interface InternationalCommodity {
  ngay: string;
  kieu_thoi_gian?: number;
  data_type?: string;
  // Dynamic fields - commodity names as keys
  // Examples: dau_brent_anh_investing_future, vang_anh_investing_future, etc.
  // Using index signature for the many commodity fields
  [key: string]: string | number | null | undefined;
}

// Domestic Commodity Price (Giá hàng hóa trong nước)
// API returns a flat structure with commodity names as keys
export interface DomesticCommodity {
  ngay: string;
  kieu_thoi_gian?: number;
  data_type?: string;
  // Dynamic fields - commodity names as keys
  // Examples: ca_phe_dak_lak, ho_tieu_dak_lak, thep_cuon_cb240_d6_viet_y_ngan_dong_kg, etc.
  [key: string]: string | number | null | undefined;
}

// Other Exchange Rate (Tỉ giá khác)
// API returns a flat structure with currency pairs as keys
export interface OtherExchangeRate {
  ngay: string;
  // Currency pairs as keys
  aud_usd?: number;
  btc_usd?: number;
  dx?: number;  // Dollar Index
  eth_usd?: number;
  eur_usd?: number;
  gbp_usd?: number;
  usd_cny?: number;
  usd_hkd?: number;
  usd_idr?: number;
  usd_inr?: number;
  usd_jpy?: number;
  usd_krw?: number;
  usd_myr?: number;
  usd_php?: number;
  usd_rub?: number;
  usd_sgd?: number;
  usd_thb?: number;
  usd_twd?: number;
  usd_eur?: number;
  usd_gbp?: number;
  created_at: string;
  updated_at: string;
}
