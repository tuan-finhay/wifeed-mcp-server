# WiFeed API Documentation

> **Version:** 2.0  
> **Base URL:** `https://wifeed.vn/api/`  
> **Last Updated:** January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Parameters](#common-parameters)
4. [API Endpoints](#api-endpoints)
   - [Enterprise & Industry (Doanh Nghiệp - Ngành)](#1-enterprise--industry-doanh-nghiệp---ngành)
   - [Money Market (Thị Trường Tiền Tệ)](#2-money-market-thị-trường-tiền-tệ)
   - [Commodity Market (Thị Trường Hàng Hóa)](#3-commodity-market-thị-trường-hàng-hóa)
   - [Analysis Reports (Báo Cáo Phân Tích)](#4-analysis-reports-báo-cáo-phân-tích)
5. [Response Format](#response-format)
6. [Error Handling](#error-handling)

---

## Overview

WiFeed API provides comprehensive financial data for the Vietnamese stock market, including:

- Stock information from 3 exchanges: **HOSE**, **HNX**, **UPCOM**
- Corporate financial statements (Balance Sheet, Income Statement, Cash Flow)
- Financial ratios and indicators
- Interest rates (policy, interbank, deposit)
- Exchange rates (USD/VND, cross rates, crypto)
- Commodity prices (international and domestic)
- Securities company analysis reports

---

## Authentication

All API requests require an API key passed as a query parameter.

```
apikey=YOUR_API_KEY
```

**Example:**
```
https://wifeed.vn/api/thong-tin-co-phieu/giao-dich...?apikey=YOUR_API_KEY&code=VNM
```

---

## Common Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apikey` | string | ✅ Yes | Your API authentication key |
| `code` | string | Depends | Stock ticker symbol (e.g., VNM, HPG, TCB) |
| `type` | string | Depends | Report period: `quarter`, `year`, `ttm`, `daily` |
| `quy` | integer | No | Quarter number (0-4, where 0 = all quarters) |
| `nam` | integer | No | Year (e.g., 2024) |
| `page` | integer | No | Page number for pagination (default: 1) |
| `limit` | integer | No | Number of records per page (max: 100) |
| `by-time` | string | No | Filter by `created_at` or `updated_at` |
| `from-time` | string | No | Start datetime filter |
| `to-time` | string | No | End datetime filter |
| `from-date` | string | No | Start date filter (format: `yyyy-mm-dd`) |
| `to-date` | string | No | End date filter (format: `yyyy-mm-dd`) |

---

## API Endpoints

---

### 1. Enterprise & Industry (Doanh Nghiệp - Ngành)

#### 1.1 Insider Trading (Giao Dịch Nội Bộ)

Track buy/sell transactions by company insiders including board members, executives, and major shareholders.

**Endpoint:**
```
GET /thong-tin-co-phieu/giao-dich-noi-bo
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | ✅ Yes | Stock ticker symbol |
| `apikey` | string | ✅ Yes | API key |
| `by-time` | string | No | Filter by `created_at` or `updated_at` |
| `from-time` | string | No | Start time filter |
| `to-time` | string | No | End time filter |
| `from-date` | string | No | Start date (yyyy-mm-dd) |
| `to-date` | string | No | End date (yyyy-mm-dd) |
| `page` | integer | No | Page number |
| `limit` | integer | No | Records per page (max: 100) |

**Response Fields:**

```json
{
  "meta": {
    "total_page": 10,
    "total_count": 100
  },
  "data": [
    {
      "code": "Mã chứng khoán",
      "type": "Giao dịch: 1= Mua, 2= Bán",
      "name": "Cá nhân, tổ chức thực hiện giao dịch",
      "position": "Chức vụ",
      "relationship_name": "Tên người liên quan",
      "relationship_position": "Chức vụ người liên quan",
      "share_before": "Số lượng trước giao dịch",
      "amount_reg": "Số lượng đăng ký",
      "start_reg": "Ngày đăng ký bắt đầu",
      "end_reg": "Ngày đăng ký kết thúc",
      "amount_result": "Số lượng thực hiện",
      "date_result": "Ngày thực hiện",
      "share_after": "Số lượng sau giao dịch",
      "ratio": "Tỉ lệ nắm giữ"
    }
  ]
}
```

---

#### 1.2 Financial Reports (Báo Cáo Tài Chính)

Complete financial statements for companies listed on HOSE, HNX, and UPCOM exchanges.

##### 1.2.1 Balance Sheet - Manufacturing Companies (Cân Đối Kế Toán - Doanh Nghiệp Sản Xuất)

**Endpoint:**
```
GET /tai-chinh-doanh-nghiep/bctc/can-doi-ke-toan
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | ✅ Yes | Stock ticker symbol |
| `apikey` | string | ✅ Yes | API key |
| `type` | string | ✅ Yes | `quarter` or `ttm` |
| `quy` | integer | No | Quarter (0-4) |
| `nam` | integer | No | Year |
| `by-time` | string | No | Filter by time |

**Response Fields (Key Items):**

| Field | Description (Vietnamese) | Description (English) |
|-------|--------------------------|----------------------|
| `taisannganhan` | A. TÀI SẢN NGẮN HẠN | A. Current Assets |
| `tienvacackhoantuongduongtien` | I. Tiền và các khoản tương đương tiền | I. Cash and cash equivalents |
| `tien` | 1. Tiền | 1. Cash |
| `cackhoantuongduongtien` | 2. Các khoản tương đương tiền | 2. Cash equivalents |
| `cackhoandaututaichinhnghanhan` | II. Các khoản đầu tư tài chính ngắn hạn | II. Short-term financial investments |
| `chungkhoankinhddoanh` | 1. Chứng khoán kinh doanh | 1. Trading securities |
| `duphonggiamgiachungkhoankindoanh` | 2. Dự phòng giảm giá chứng khoán kinh doanh | 2. Provision for securities |
| `dautunamgiudennraydaohan_dttcnh` | 3. Đầu tư năm giữ đến ngày đáo hạn | 3. Held-to-maturity investments |
| `cackhoanphaithunganhan` | III. Các khoản phải thu ngắn hạn | III. Short-term receivables |
| `phaithukhachhang` | 1. Phải thu ngắn hạn của khách hàng | 1. Trade receivables |
| `tratruocchonguoiban` | 2. Trả trước cho người bán ngắn hạn | 2. Prepayments to suppliers |

---

##### 1.2.2 Balance Sheet - Banks (Cân Đối Kế Toán - Ngân Hàng)

**Endpoint:**
```
GET /api/demo/bctc/can-doi-ke-toan?company_type=2
```

**Parameters:** Same as manufacturing companies, with `company_type=2` for banks.

**Response Fields (Key Items):**

| Field | Description (Vietnamese) |
|-------|--------------------------|
| `tongtaisan` | TỔNG TÀI SẢN |
| `tienmatvangbacdaquy` | I. Tiền mặt, vàng bạc, đá quý |
| `tienguitainganhangngohnhanuco` | II. Tiền gửi tại Ngân hàng nhà nước |
| `tieguivachovaycactctdkhac` | III. Tiền gửi và cho vay các TCTD khác |
| `tienvangguiitalTCTDkhac` | 1. Tiền, vàng gửi tại TCTD khác |
| `chovaycactctdkhac` | 2. Cho vay các TCTD khác |

---

##### 1.2.3 Balance Sheet - Securities (Cân Đối Kế Toán - Chứng Khoán)

**Endpoint:**
```
GET /api/demo/bctc/can-doi-ke-toan?company_type=4
```

**Response Fields (Key Items):**

| Field | Description (Vietnamese) |
|-------|--------------------------|
| `tongcongtaisan` | TỔNG CỘNG TÀI SẢN |
| `taisannganhan` | A. TÀI SẢN NGẮN HẠN |
| `taisantcnganhan` | I. Tài sản tài chính ngắn hạn |
| `tienvacackhoantuongduongtien` | 1. Tiền và các khoản tương đương tiền |

---

##### 1.2.4 Balance Sheet - Insurance (Cân Đối Kế Toán - Bảo Hiểm)

**Endpoint:**
```
GET /api/demo/bctc/can-doi-ke-toan?company_type=3
```

**Response Fields (Key Items):**

| Field | Description (Vietnamese) |
|-------|--------------------------|
| `tongtaisan` | TỔNG TÀI SẢN |
| `taisannganhan` | A. TÀI SẢN NGẮN HẠN |
| `tienvacackhoantuongduongtien` | I. Tiền và các khoản tương đương tiền |

---

##### 1.2.5 Income Statement - Manufacturing (Kết Quả Kinh Doanh - Doanh Nghiệp Sản Xuất)

**Endpoint:**
```
GET /tai-chinh-doanh-nghiep/bctc/ket-qua-kinh-doanh
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | ✅ Yes | Stock ticker symbol |
| `apikey` | string | ✅ Yes | API key |
| `type` | string | ✅ Yes | `quarter` or `ttm` |
| `quy` | integer | No | Quarter (0-4) |
| `nam` | integer | No | Year |

**Response Fields:**

| Field | Description (Vietnamese) | Description (English) |
|-------|--------------------------|----------------------|
| `doanhthubanhangvacungcapdichvu` | 1. Doanh thu bán hàng và cung cấp dịch vụ | 1. Revenue from sales and services |
| `cackhoangiatrudoanhthu` | 2. Các khoản giảm trừ doanh thu | 2. Revenue deductions |
| `doanhthuthuanvebanhangvacungcapdichvu` | 3. Doanh thu thuần | 3. Net revenue |
| `giavonhangban` | 4. Giá vốn hàng bán | 4. Cost of goods sold |
| `loinhuangopvebanhangvacungcapdichvu` | 5. Lợi nhuận gộp | 5. Gross profit |
| `doanhnthuhoatdongtaichinh` | 6. Doanh thu hoạt động tài chính | 6. Financial income |
| `chiphitaichinh` | 7. Chi phí tài chính | 7. Financial expenses |
| `trongdochiphilaivay` | - Trong đó: Chi phí lãi vay | - Interest expenses |
| `phanlailohoaclotrongcongtyliendoanhlienket` | 8. Lãi/(lỗ) từ công ty liên doanh, liên kết | 8. Share of JV/associate profit |
| `chiphibanhang` | 9. Chi phí bán hàng | 9. Selling expenses |
| `chiphiquanlydoanhnghiep` | 10. Chi phí quản lý doanh nghiệp | 10. G&A expenses |
| `loinhuanthuantuhoatdongkinhdoanh` | 11. Lợi nhuận thuần từ hoạt động kinh doanh | 11. Operating profit |

---

##### 1.2.6 Income Statement - Banks (Kết Quả Kinh Doanh - Ngân Hàng)

**Endpoint:**
```
GET /api/demo/bctc/ket-qua-kinh-doanh?company_type=2
```

**Response Fields:**

| Field | Description (Vietnamese) |
|-------|--------------------------|
| `thunhaplaivacackhoantuongtu` | 1. Thu nhập lãi và các khoản thu nhập tương tự |
| `chiphilaivacaccphituongtu` | 2. Chi phí lãi và các chi phí tương tự |
| `thunhaplaithuan` | I. Thu nhập lãi thuần |
| `thunhaptuhoatdongdichvu` | 3. Thu nhập từ hoạt động dịch vụ |
| `chiphihoatdongdichvu` | 4. Chi phí hoạt động dịch vụ |

---

##### 1.2.7 Cash Flow Statement (Lưu Chuyển Tiền Tệ)

**Endpoint:**
```
GET /tai-chinh-doanh-nghiep/bctc/luu-chuyen-tien-te
```

**Parameters:** Same as Income Statement

**Response Fields:**

| Field | Description (Vietnamese) | Description (English) |
|-------|--------------------------|----------------------|
| `luuchuyentientuhoatdongkinhdoanh` | I. LƯU CHUYỂN TIỀN TỪ HOẠT ĐỘNG KINH DOANH | I. Cash flows from operating activities |
| `loinhuantruocthue` | 1. Lợi nhuận trước thuế | 1. Profit before tax |
| `dieuchinhchocackhoan` | 2. Điều chỉnh cho các khoản | 2. Adjustments |
| `khauhaotaisancodinh` | - Khấu hao TSCĐ và BĐSĐT | - Depreciation |
| `cackhoanduphong` | - Các khoản dự phòng | - Provisions |
| `lailotudautuvacongtylienket` | (Lãi)/lỗ từ hoạt động đầu tư | Investment (gain)/loss |
| `chiphilaivay` | Chi phí lãi vay | Interest expense |

---

#### 1.3 Financial Ratios (Chỉ Số Tài Chính)

##### 1.3.1 Financial Ratios - Non-Financial Companies (v2)

**Endpoint:**
```
GET /tai-chinh-doanh-nghiep/v2/chi-so-tai-chinh
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | ✅ Yes | Stock ticker symbol |
| `apikey` | string | ✅ Yes | API key |
| `type` | string | ✅ Yes | `year`, `quarter`, `ttm`, `daily` |
| `from-date` | string | No | Start date (yyyy-mm-dd), required for `daily` |
| `to-date` | string | No | End date |
| `quy` | integer | No | Quarter |
| `nam` | integer | No | Year |

**Response Fields:**

**Dividend Ratios (Cổ tức):**

| Field | Description |
|-------|-------------|
| `bq_tysuatcotuc` | Tỷ suất cổ tức trung bình 3 năm gần nhất (Y) |
| `chiaccotuc_tienmat` | Cổ tức tiền mặt (Y) |
| `tile_chiacotuc_cp` | Tỷ lệ cổ tức bằng cổ phiếu (Y) |
| `tl_chitracotucbangtien` | Tỷ lệ chi trả cổ tức bằng tiền (Y) |
| `tysuatcotuc` | Tỷ suất cổ tức (Y) |

**Valuation Ratios (Định giá):**

| Field | Description |
|-------|-------------|
| `bookvalue` | Book value (Q_Y) |
| `bvps` | BVPS (Q_Y) |
| `dongtien_hdkd_tncp` | Dòng tiền hoạt động kinh doanh trên mỗi cổ phiếu (Y_TTM) |
| `ep` | E/P (Y_TTM) |
| `eps` | EPS (Y_TTM_Daily) |
| `graham_3` | Graham 3 (Sử dụng EPS và giá trị sổ sách) (Y_TTM) |
| `p_ocf` | P/OCF (Y_TTM) |
| `pb` | P/B (Q_Y_Daily) |
| `pe` | P/E (Y_TTM_Daily) |
| `pe_dp` | P/E (dự phòng) (Y_TTM) |
| `peg` | PEG (Y_TTM) |
| `peg_dc` | PEG (điều chỉnh) (Y_TTM) |
| `sllh_goc` | Số lượng lưu hành ngày hôm nay (Daily) |
| `beta` | Hệ số beta (Daily) |
| `smg` | Chỉ số sức mạnh giá (Daily) |
| `vonhoa` | Vốn hóa (Q_Y_Daily) |

**Operational Efficiency (Hiệu quả hoạt động):**

| Field | Description |
|-------|-------------|
| `dongtien_hdkd_lnthuan` | Dòng tiền HĐKD/Lợi nhuận thuần |

---

##### 1.3.2 Financial Ratios - Banks (v2)

**Endpoint:**
```
GET /api/demo/v2/chi-so-tai-chinh?company_type=2
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `duphongchovaykh_chovaykh` | Dự phòng cho vay khách hàng/Cho vay khách hàng (Q_Y) |
| `ldr` | Tỷ lệ cho vay/Huy động (LDR) (Q_Y) |
| `tile_chovaytrungdaihan` | Tỷ lệ cho vay trung dài hạn/Tổng dư nợ (Q_Y) |
| `tile_dutru` | Tỷ lệ dự trữ (Q_Y) |
| `tm_hesocar` | Hệ số CAR (Y) |
| `cir` | CIR (Q_Y_TTM) |
| `cof` | COF (Y_TTM) |

---

##### 1.3.3 Financial Ratios - Securities (v2)

**Endpoint:**
```
GET /api/demo/v2/chi-so-tai-chinh?company_type=4
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `tilechovaykq` | Tỷ lệ cho vay ký quỹ trên VCSH (Q_Y) |
| `chiphihoatdong` | Chi phí hoạt động (*) (Q_Y_TTM) |
| `chiphindt` | Chi phí nâng ngân hàng đầu tư (Q_Y_TTM) |
| `doanhthu` | Doanh thu (+) (Q_Y_TTM) |
| `dtafs` | Doanh thu AFS (Q_Y_TTM) |
| `dtbantsfvtpl` | Doanh thu thực hiện từ việc bán các tài sản tài chính FVTPL (Q_Y_TTM) |
| `dtchovay` | Lợi nhuận cho vay ký quỹ (Q_Y_TTM) |
| `dtdanhgialaifvtpl` | Doanh thu từ việc đánh giá lại các tài sản |

---

##### 1.3.4 Financial Ratios - Insurance (v2)

**Endpoint:**
```
GET /api/demo/v2/chi-so-tai-chinh?company_type=3
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `tile_dpgiamgiadh` | Dự phòng giảm giá đầu tư tài chính dài hạn (Q_Y) |
| `tile_giamgiackkd` | Dự phòng giảm giá chứng khoán kinh doanh (Q_Y) |
| `tile_phaithukhodoi` | Dự phòng phải thu ngắn hạn khó đòi (Q_Y) |
| `tt_cackhoandaututaichinhdaihan_yoy` | Các khoản đầu tư tài chính dài hạn (YoY) (Q_Y) |
| `tt_chiboithuongbaohiemgoc_yoy` | Chi bồi thường bảo hiểm gốc |

---

### 2. Money Market (Thị Trường Tiền Tệ)

#### 2.1 Policy Interest Rates (Lãi Suất Chính Sách)

**Endpoint:**
```
GET /du-lieu-vimo/chinh-sach/lai-suat-chinh-sach
```

**Update Frequency:** 
- Monthly/Quarterly data: Updated within 3 hours of official announcement
- Daily data: Updated 2 times per day

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apikey` | string | ✅ Yes | API key |
| `limit` | integer | No | Records per page (max: 100) |
| `page` | integer | No | Page number |
| `to-time` | string | No | End time (yyyy-mm-dd) |
| `from-time` | string | No | Start time (yyyy-mm-dd) |
| `to-date` | string | No | End date |
| `from-date` | string | No | Start date (min: 2020-01-01) |
| `by-time` | string | No | Filter by `created_at` or `updated_at` |

**Response Fields:**

| Field | Description (Vietnamese) | Description (English) |
|-------|--------------------------|----------------------|
| `ngay` | Ngày tháng | Date (Unique key) |
| `kieu_thoi_gian` | Kiểu thời gian: 1: Ngày, 2: Tháng, 3: Quý, 4: Năm | Time period type |
| `lai_suat_dieu_hanh_omo` | Lãi suất OMO | OMO interest rate |
| `lai_suat_dieu_hanh_tin_phieu` | Lãi suất tín phiếu | Bill interest rate |
| `lai_suat_dieu_hanh_chiet_khau` | Lãi suất tái chiết khấu | Discount rate |
| `lai_suat_dieu_hanh_tai_cap_von` | Lãi suất tái cấp vốn | Refinancing rate |
| `sbv_bills_ls_7_ngay` | Lãi suất bil kỳ hạn 7 ngày | 7-day bill rate |
| `sbv_bills_ls_14_ngay` | Lãi suất bil kỳ hạn 14 ngày | 14-day bill rate |
| `sbv_bills_ls_21_ngay` | Lãi suất bil kỳ hạn 21 ngày | 21-day bill rate |
| `sbv_bills_ls_28_ngay` | Lãi suất bil kỳ hạn 28 ngày | 28-day bill rate |
| `sbv_bills_ls_56_ngay` | Lãi suất bil kỳ hạn 56 ngày | 56-day bill rate |
| `sbv_bills_ls_91_ngay` | Lãi suất bil kỳ hạn 91 ngày | 91-day bill rate |
| `sbv_bills_ls_140_ngay` | Lãi suất bil kỳ hạn 140 ngày | 140-day bill rate |
| `sbv_bills_lstb` | Lãi suất bill | Average bill rate |
| `omo_ls_7_ngay` | Lãi suất om kỳ hạn 7 ngày | 7-day OMO rate |
| `omo_ls_14_ngay` | Lãi suất om kỳ hạn 14 ngày | 14-day OMO rate |
| `omo_ls_21_ngay` | Lãi suất om kỳ hạn 21 ngày | 21-day OMO rate |
| `omo_ls_28_ngay` | Lãi suất om kỳ hạn 28 ngày | 28-day OMO rate |
| `omo_ls_56_ngay` | Lãi suất om kỳ hạn 56 ngày | 56-day OMO rate |
| `omo_ls_91_ngay` | Lãi suất om kỳ hạn 91 ngày | 91-day OMO rate |
| `omo_ls_140_ngay` | Lãi suất om kỳ hạn 140 ngày | 140-day OMO rate |
| `omo_lstb` | Lãi suất omo | Average OMO rate |
| `ls_cho_vay_bu_dap_thieu_hut_von_nhnn` | Lãi suất qua đêm cho vay bù đắp thiếu hụt vốn | Overnight lending rate |

---

#### 2.2 Interbank Interest Rates (Lãi Suất Liên Ngân Hàng)

**Endpoint:**
```
GET /du-lieu-vimo/lai-suat/lien-ngan-hang
```

**Update Frequency:** 
- Monthly/Quarterly data: Updated within 3 hours of official announcement
- Daily data: Updated 2 times per day

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apikey` | string | ✅ Yes | API key |
| `page` | integer | No | Page number |
| `by-time` | string | No | Filter by time |
| `from-time` | string | No | Start time (yyyy-mm-dd) |
| `to-time` | string | No | End time (yyyy-mm-dd) |
| `from-date` | string | No | Start date (min: 2018-01-01) |
| `to-date` | string | No | End date |
| `limit` | integer | No | Records per page (max: 100) |

**Response Fields:**

| Field | Description (Vietnamese) | Description (English) |
|-------|--------------------------|----------------------|
| `ngay` | Ngày | Date (Unique key) |
| `kieu_thoi_gian` | Kiểu thời gian: 1: Ngày, 2: Tháng, 3: Quý, 4: Năm | Time period type |
| `lai_suat_lien_nh_on` | Lãi suất liên ngân hàng - qua đêm | Overnight rate |
| `lai_suat_lien_nh_1w` | Lãi suất liên ngân hàng - 1 tuần | 1-week rate |
| `lai_suat_lien_nh_2w` | Lãi suất liên ngân hàng - 2 tuần | 2-week rate |
| `lai_suat_lien_nh_1m` | Lãi suất liên ngân hàng - 1 tháng | 1-month rate |
| `lai_suat_lien_nh_3m` | Lãi suất liên ngân hàng - 3 tháng | 3-month rate |
| `doanh_so_lien_nh_on` | Doanh số liên ngân hàng - qua đêm | Overnight volume |
| `doanh_so_lien_nh_1w` | Doanh số liên ngân hàng - 1 tuần | 1-week volume |
| `doanh_so_lien_nh_2w` | Doanh số liên ngân hàng - 2 tuần | 2-week volume |
| `doanh_so_lien_nh_1m` | Doanh số liên ngân hàng - 1 tháng | 1-month volume |
| `doanh_so_lien_nh_3m` | Doanh số liên ngân hàng - 3 tháng | 3-month volume |

---

#### 2.3 Deposit Rates by Bank Group (Lãi Suất Huy Động Theo Nhóm Ngân Hàng)

**Endpoint:**
```
GET /du-lieu-vimo/lai-suat/huy-dong-theo-nhom
```

**Update Frequency:** 
- Monthly/Quarterly data: Updated within 3 hours of official announcement
- Daily data: Updated 2 times per day

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apikey` | string | ✅ Yes | API key |
| `from-date` | string | No | Start date (min: 2018-01-01) |
| `limit` | integer | No | Records per page (max: 100) |
| `to-time` | string | No | End time (yyyy-mm-dd) |
| `to-date` | string | No | End date (min: 2018-01-01) |
| `by-time` | string | No | Filter by `created_at` or `updated_at` |
| `from-time` | string | No | Start time (yyyy-mm-dd) |
| `page` | integer | No | Page number |

**Response Fields:**

| Field | Description |
|-------|-------------|
| `lai_suat_huy_dong_1m_nhom_nhtmnn` | Lãi suất huy động - 1 tháng - nhóm NHTM nhà nước |
| `lai_suat_huy_dong_3m_nhom_nhtmnn` | Lãi suất huy động - 3 tháng - nhóm NHTM nhà nước |
| `lai_suat_huy_dong_6m_nhom_nhtmnn` | Lãi suất huy động - 6 tháng - nhóm NHTM nhà nước |
| `lai_suat_huy_dong_9m_nhom_nhtmnn` | Lãi suất huy động - 9 tháng - nhóm NHTM nhà nước |
| `lai_suat_huy_dong_12m_nhom_nhtmnn` | Lãi suất huy động - 12 tháng - nhóm NHTM nhà nước |
| `lai_suat_huy_dong_13m_nhom_nhtmcp_khac` | Lãi suất huy động - 12 tháng - nhóm NHTM khác |

---

#### 2.4 Deposit Rates by Individual Bank (Lãi Suất Huy Động Của Từng Ngân Hàng)

**Endpoint:**
```
GET /du-lieu-vimo/v2/lai-suat/huy-dong-tung-ngan-hang
```

**Update Frequency:** 
- Monthly/Quarterly data: Updated within 3 hours of official announcement
- Daily data: Updated 2 times per day

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apikey` | string | ✅ Yes | API key |
| `from-date` | string | No | Start date (min: 2018-01-01) |
| `limit` | integer | No | Records per page (max: 100) |
| `to-time` | string | No | End time (yyyy-mm-dd) |
| `to-date` | string | No | End date (min: 2018-01-01) |
| `by-time` | string | No | Filter by `created_at` or `updated_at` |
| `from-time` | string | No | Start time (yyyy-mm-dd) |
| `ky_han` | integer | No | Deposit term in months (1, 3, 6, 9, 12, 24) |

**Response Fields:**

| Field | Description |
|-------|-------------|
| `ky_han` | Kỳ hạn theo tháng |
| `bank_code` | Mã ngân hàng |
| `mack` | Mã chứng khoán của ngân hàng |
| `kieu_thoi_gian` | Kiểu thời gian: 1 = Dạng Ngày |
| `data` | Array of date-rate pairs |

---

#### 2.5 Exchange Rates - Other Currencies (Tỷ Giá Khác)

**Endpoint:**
```
GET /du-lieu-vimo/ty-gia-khac
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apikey` | string | ✅ Yes | API key |
| `from-date` | string | No | Start date |
| `limit` | integer | No | Records per page (max: 100) |
| `to-date` | string | No | End date |
| `to-time` | string | No | End time (yyyy-mm-dd) |
| `page` | integer | No | Page number |
| `by-time` | string | No | Filter by `created_at` or `updated_at` |

**Response Fields:**

| Field | Description |
|-------|-------------|
| `ngay` | Ngày (Unique key) |
| `aud_usd` | AUD/USD |
| `btc_usd` | BTC/USD |
| `dx` | Dollar Index Futures |
| `eth_usd` | ETH/USD |
| `eur_usd` | EUR/USD |
| `gbp_usd` | GBP/USD |
| `usd_cny` | USD/CNY |
| `usd_hkd` | USD/HKD |
| `usd_idr` | USD/IDR |
| `usd_inr` | USD/INR |
| `usd_jpy` | USD/JPY |
| `usd_krw` | USD/KRW |
| `usd_myr` | USD/MYR |
| `usd_php` | USD/PHP |
| `usd_rub` | USD/RUB |
| `usd_sgd` | USD/SGD |
| `usd_thb` | USD/THB |
| `usd_twd` | USD/TWD |

---

#### 2.6 Exchange Rates - Commercial Banks (Tỷ Giá NHTM)

**Endpoint:**
```
GET /du-lieu-vimo/ty-gia-nhtm
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apikey` | string | ✅ Yes | API key |
| `page` | integer | No | Page number |
| `from-time` | string | No | Start time (yyyy-mm-dd) |
| `limit` | integer | No | Records per page (max: 100) |
| `from-date` | string | No | Start date |
| `to-date` | string | No | End date |
| `to-time` | string | No | End time |
| `by-time` | string | No | Filter by time |

**Response Fields:**

| Field | Description |
|-------|-------------|
| `ngay` | Ngày (Unique key) |
| `kieu_thoi_gian` | Kiểu thời gian: 1: Ngày, 2: Tháng, 3: Quý, 4: Năm |
| `eur_nhtm_chuyen_khoan` | Tỷ giá EUR NHTM chuyển khoản |
| `jpy_nhtm_ban_ra` | Tỷ giá JPY NHTM bán ra |
| `sgd_nhtm_mua_vao` | Tỷ giá SGD NHTM mua vào |
| `thb_nhtm_chuyen_khoan` | Tỷ giá THB NHTM chuyển khoản |
| `hkd_nhtm_ban_ra` | Tỷ giá HKD NHTM bán ra |
| `krw_nhtm_mua_vao` | Tỷ giá KRW NHTM mua vào |
| `gbp_nhtm_mua_vao` | Tỷ giá GBP NHTM mua vào |
| `jpy_nhtm_chuyen_khoan` | Tỷ giá JPY NHTM chuyển khoản |
| `sgd_nhtm_ban_ra` | Tỷ giá SGD NHTM bán ra |
| `chf_nhtm_mua_vao` | Tỷ giá CHF NHTM mua vào |
| `hkd_nhtm_chuyen_khoan` | Tỷ giá HKD NHTM chuyển khoản |

---

### 3. Commodity Market (Thị Trường Hàng Hóa)

#### 3.1 International Commodity Prices (Giá Hàng Hóa Quốc Tế)

**Endpoint:**
```
GET /du-lieu-vimo/hang-hoa/v2/gia-hang-hoa-quoc-te
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apikey` | string | ✅ Yes | API key |
| `data_type` | string | No | Data type (see below) |
| `from-date` | string | No | Start date (min: 2018-01-01) |
| `to-date` | string | No | End date |
| `from-time` | string | No | Start time (yyyy-mm-dd) |
| `page` | integer | No | Page number |
| `limit` | integer | No | Records per page (max: 100) |
| `by-time` | string | No | Filter by `created_at` or `updated_at` |

**Data Types:**

| Value | Description |
|-------|-------------|
| `value_today` | Today's price (default) |
| `change_today` | Price change today |
| `diff_day` | % change vs yesterday |
| `diff_month` | % change vs last month |
| `diff_year` | % change vs last year |

**Response Fields (Sample Commodities):**

| Field | Description |
|-------|-------------|
| `vai_cotton_trung_quoc_cny_tan` | Vải cotton Trung Quốc (Future) (CNY/tấn) |
| `soi_cotton_trung_quoc_cny_tan` | Sợi cotton Trung Quốc (Future) (CNY/tấn) |
| `dau_co_malaysia_myr_tan` | Dầu cọ Malaysia (Future) (MYR/tấn) |
| `giay_gon_song_china_rmb_ton` | Giấy gợn sóng Trung Quốc (Spot) (CNY/tấn) |
| `sbv1` | Đường mía Hoa Kỳ (Future) (US Cents/pound) |
| `ca_phe_hoa_ky_investing_future` | Cà phê Arabica Hoa Kỳ (Future) (USD/pound) |
| `ctz1` | Vải cotton Hoa Kỳ (Spot) (USD/tấn) |
| `quang_sat_trung_quoc_cny_tan` | Quặng sắt Trung Quốc (Future) (CNY/tấn) |
| `chi_trung_quoc_cny_tan` | Chì Trung Quốc (Future) (CNY/tấn) |
| `thiec_trung_quoc_cny_tan` | Thiếc Trung Quốc (Future) (CNY/tấn) |
| `kem_trung_quoc_cny_tan` | Kẽm Trung Quốc (Future) (CNY/tấn) |
| `nhom_trung_quoc_cny_tan` | Nhôm Trung Quốc (Future) (CNY/tấn) |

---

#### 3.2 Domestic Commodity Prices (Giá Hàng Hóa Trong Nước)

**Endpoint:**
```
GET /du-lieu-vimo/hang-hoa/v2/gia-hang-hoa-trong-nuoc
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apikey` | string | ✅ Yes | API key |
| `data_type` | string | No | Data type (same as international) |
| `from-time` | string | No | Start time (yyyy-mm-dd) |
| `page` | integer | No | Page number |
| `limit` | integer | No | Records per page (max: 100) |
| `by-time` | string | No | Filter by `created_at` or `updated_at` |

**Response Fields (Sample Commodities):**

| Field | Description |
|-------|-------------|
| `ngay` | Ngày (Unique key) |
| `kieu_thoi_gian` | Kiểu thời gian: 1: Ngày, 2: Tháng, 3: Quý, 4: Năm |
| `dien_gia_mua_dien_binh_quan` | Điện (VND/kWh) |
| `da_0_4` | Đá 0-4 (Nghìn đồng/m3) |
| `da_mi_sang` | Đá mi sàng (Nghìn đồng/m3) |
| `da_1_x_2` | Đá 1x2 (Nghìn đồng/m3) |
| `da_hoc` | Đá hộc (Nghìn đồng/m3) |
| `be_tong_nhua_min_carboncer_asphalt_95` | Bê tông nhựa min Carboncer Asphalt - CA 9.5 (Nghìn đồng/tấn) |
| `ong_nhua_27mm_x_18mm` | Ống nhựa 27 x 1.8mm (Nghìn đồng/m) |
| `ong_nhua_60mm_x_2mm` | Ống nhựa 60 x 2mm (Nghìn đồng/m) |
| `ong_nhua_90mm_x_2cham9mm` | Ống nhựa 90 x 2.9mm (Nghìn đồng/m) |
| `son_lot_khang_kiem_cao_cap` | Sơn lót kháng kiềm cao cấp (Nghìn đồng/lít) |
| `son_noi_that_standard` | Sơn nội thất tiêu chuẩn STANDARD (Nghìn đồng/lít) |
| `son_ngoai_that_standard` | Sơn ngoại thất STANDARD (Nghìn đồng/lít) |

---

### 4. Analysis Reports (Báo Cáo Phân Tích)

**Endpoint:**
```
GET /bao-cao-phan-tich
```

Aggregated analysis reports from over 40 securities companies including industry analysis and company-specific reports.

**Report Categories:**
- Strategic analysis reports (Báo cáo phân tích chiến lược)
- Macroeconomic reports (Báo cáo vĩ mô tiền tệ)
- Industry reports (Báo cáo ngành)
- Company reports (Báo cáo doanh nghiệp)

**Update Frequency:** Daily

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apikey` | string | ✅ Yes | API key |
| `type` | integer | ✅ Yes | Report type (1-4, see below) |
| `page` | integer | No | Page number |
| `limit` | integer | No | Records per page (max: 100) |
| `code` | string | No | Stock code filter |

**Report Types:**

| Type | Description (Vietnamese) | Description (English) |
|------|--------------------------|----------------------|
| 1 | Báo cáo doanh nghiệp | Company reports |
| 2 | Báo cáo ngành | Industry reports |
| 3 | Báo cáo vĩ mô | Macro reports |
| 4 | Báo cáo chiến lược | Strategy reports |

**Response Fields:**

| Field | Description |
|-------|-------------|
| `id` | ID báo cáo |
| `mack` | Mã chứng khoán |
| `tenbaocao` | Tên báo cáo phân tích |
| `nguon` | Nguồn báo cáo |
| `khuyennghi` | Khuyến nghị: Mua, Khác, Trung lập |
| `giamuctieu` | Giá mục tiêu trong báo cáo |
| `giamuctieu_dieuchinrh` | Giá mục tiêu điều chỉnh |
| `upside_hientai` | Upside giá cổ phiếu hiện tại |
| `lnst_duphong` | Lợi nhuận sau thuế dự phòng năm hiện tại (n) |
| `lnst_duphong_n1` | Lợi nhuận sau thuế dự phòng năm n+1 |
| `lnst_duphong_n2` | Lợi nhuận sau thuế dự phòng năm n+2 |
| `doanhthu_duphong` | Doanh thu dự phòng năm hiện tại (n) |
| `doanhthu_duphong_n1` | Doanh thu dự phòng năm n+1 |
| `doanhthu_duphong_n2` | Doanh thu dự phòng năm n+2 |
| `pe_mack_n0` | PE forward |
| `filebaocao` | Link file báo cáo gốc |

---

## Response Format

All API responses follow a standard format:

### Success Response

```json
{
  "meta": {
    "total_page": 10,
    "total_count": 100
  },
  "data": [
    {
      // Response fields specific to each endpoint
    }
  ]
}
```

### Pagination

- `page`: Current page number (starting from 1)
- `limit`: Number of records per page (max: 100)
- `total_page`: Total number of pages available
- `total_count`: Total number of records

---

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Access denied to this resource |
| 404 | Not Found - Endpoint or resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": {
    "code": 401,
    "message": "Invalid API key"
  }
}
```

---

## Notes

1. **Company Types:**
   - Type 1: Manufacturing/Production companies (Doanh nghiệp sản xuất)
   - Type 2: Banks (Ngân hàng)
   - Type 3: Insurance companies (Bảo hiểm)
   - Type 4: Securities companies (Chứng khoán)

2. **Data Currency:**
   - Financial data is verified by WiFeed and available from the time the company begins publishing BCTC reports
   - Update speed: Within 24 hours after the company publishes financial information on the disclosure page

3. **Exchange Coverage:**
   - HOSE: Ho Chi Minh Stock Exchange
   - HNX: Hanoi Stock Exchange
   - UPCOM: Unlisted Public Company Market
   - VN30, HNX30: Index constituent stocks
   - DELISTING, OTC: Delisted and OTC stocks (for non-financial companies only)

4. **API Usage Notes:**
   - The Manufacturing API can only retrieve data for non-financial companies. APIs for Banks, Securities, and Insurance are demo versions only.
   - For official system access, please contact WiFeed directly.

---

## Support

For API support and inquiries:
- Website: [https://wifeed.vn](https://wifeed.vn)
- Contact: Use the "Liên Hệ" (Contact) button on the website

---

*This documentation is based on the WiFeed API as of January 2026. Please refer to the official WiFeed documentation for the most up-to-date information.*
