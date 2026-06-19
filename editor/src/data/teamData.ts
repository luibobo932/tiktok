// ─────────────────────────────────────────────────────────────────────────────
// Dữ liệu thật của nhóm Bom Tấn (RAG) — rút từ báo cáo doanh số, bảng chấm công,
// hồ sơ agent. Inject vào prompt để nhân vật dẫn con số thật khi nói.
// ─────────────────────────────────────────────────────────────────────────────

export const TEAM_FACTS = `[DỮ LIỆU THẬT nhóm Bom Tấn — dùng khi cần dẫn số]
- Mục tiêu nhóm: trên 1.5 tỷ doanh số/quý. Nửa đầu năm mới đạt ~23.8% chỉ tiêu.
- Tháng cao nhất gần đây: ~361 triệu.
- Mốc thưởng cá nhân: 158tr→1.68tr; 508tr→7.68tr; 708tr→iPhone 17 Pro Max.
- Thi đua clip review: Kim Cương 2tr, Vàng 1tr, Bạc 500k.
- Chấm công tháng 5: Huy trễ 9 lần (phạt 300k); Thắng trễ 10 lần (phạt 350k, nhiều nhất); Trí nghỉ 12 ngày vì bệnh (phạt 450k).`

// Số liệu riêng từng người (đưa vào prompt của chính họ).
export const PERSONA_FACTS: Record<string, string> = {
  duc: 'Doanh số 2025 của bạn: 240tr (2 căn). 2026 tới giờ: chưa chốt căn nào. Bạn gánh chỉ tiêu nhóm 1.5 tỷ/quý.',
  tuan: 'Bạn dẫn đầu doanh số nhóm, tỷ lệ chốt cao nhất, kênh review mạnh. Có 2 con nên cần tiền đều.',
  huong: 'Bạn đã bán hơn 50 căn từ 2019, nhập nhiều nhà nhất lên Landsoft. Là "King sale" của SKL.',
  luan: 'Bạn đã bán 2 căn nhờ đi dẫn khách cùng Duy. Đang nhắm mốc thưởng 508tr (7.68tr).',
  huy: 'Bạn tháng 5 trễ 9 lần, bị phạt 300k. Doanh số BĐS chưa rõ vì có thu nhập ngoài.',
  tri: 'Bạn tháng 5 nghỉ 12 ngày vì bệnh, phạt 450k. Chưa bán được căn nào, thỉnh thoảng ký phí 3%.',
  mai: 'Bạn tháng 5 trễ 10 lần (nhiều nhất nhóm), phạt 350k. Doanh số nhỏ giọt.',
  khoa: 'Bạn chưa bán được căn nào nhưng chấm công tốt. Vừa bể 1 hồ sơ vì báo Duy trễ.',
  thanhduy: 'Bạn vừa có clip TikTok 1 triệu view. Chưa chuyển hết view thành khách. Đang thuê nhà nên cần tiền.',
}

// Baseline mood (0-100): tinhThan = tinh thần, nangLuong = năng lượng, apLuc = áp lực.
export interface Mood {
  tinhThan: number
  nangLuong: number
  apLuc: number
}

export const BASELINE_MOOD: Record<string, Mood> = {
  duc: { tinhThan: 65, nangLuong: 70, apLuc: 80 },
  huy: { tinhThan: 55, nangLuong: 45, apLuc: 30 },
  tuan: { tinhThan: 75, nangLuong: 70, apLuc: 65 },
  huong: { tinhThan: 80, nangLuong: 82, apLuc: 50 },
  luan: { tinhThan: 60, nangLuong: 75, apLuc: 60 },
  tri: { tinhThan: 45, nangLuong: 35, apLuc: 25 },
  mai: { tinhThan: 40, nangLuong: 62, apLuc: 75 },
  khoa: { tinhThan: 66, nangLuong: 80, apLuc: 55 },
  thanhduy: { tinhThan: 80, nangLuong: 74, apLuc: 70 },
}
