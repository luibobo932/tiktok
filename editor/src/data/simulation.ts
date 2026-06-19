import * as THREE from 'three'

export interface PersonaData {
  id: string
  name: string
  role: string
  color: string
  deskPosition: THREE.Vector3Tuple
  seatPosition: THREE.Vector3Tuple
}

export interface Problem {
  id: string
  timestamp: number
  who: string
  personaName: string
  role: string
  color: string
  message: string
  featureRequest: string
  severity: 'low' | 'medium' | 'high'
  emoji: string
}

export type ScriptAction =
  | { type: 'speech'; msg: string; feature: string; severity: 'low' | 'medium' | 'high'; emoji: string }
  | { type: 'walk'; target: 'desk' | 'meeting' | 'coffee' | 'colleague'; colleagueId?: string }
  | { type: 'callMeeting' }

export interface ScriptEvent {
  time: number
  who: string
  action: ScriptAction
}

// ── World positions ──────────────────────────────────────────────────────────

export const WAYPOINTS = {
  meeting: new THREE.Vector3(-5.5, 0, -4),
  coffee: new THREE.Vector3(6.5, 0, 4.5),
  // Row 1 (z=3)
  tuan_desk: new THREE.Vector3(-6.5, 0, 3.5),
  huong_desk: new THREE.Vector3(-2.5, 0, 3.5),
  linh_desk: new THREE.Vector3(1.5, 0, 3.5),
  luan_desk: new THREE.Vector3(5, 0, 3.5),
  huy_desk: new THREE.Vector3(-9.5, 0, 3.5),
  // Row 2 (z=0)
  duc_desk: new THREE.Vector3(-4.5, 0, 0.5),
  mai_desk: new THREE.Vector3(0, 0, 0.5),
  tri_desk: new THREE.Vector3(-7.5, 0, 0.5),
  khoa_desk: new THREE.Vector3(3.5, 0, 0.5),
  thanhduy_desk: new THREE.Vector3(7.5, 0, 0.5),
}

// ── Personas (Nhóm Bom Tấn — Môi giới BĐS, Cty CP ĐT Địa ốc Sài Gòn King Land) ─
// Danh sách đầy đủ 10 thành viên theo bảng chấm công & báo cáo doanh số thực tế.

export const PERSONAS: PersonaData[] = [
  // ── Hàng 1 (z=3) ──
  {
    id: 'huy',
    name: 'Hoàng Minh Huy',
    role: 'Chuyên viên KD',
    color: '#8B5CF6',
    deskPosition: [-9.5, 0.8, 3],
    seatPosition: [-9.5, 0, 3.5],
  },
  {
    id: 'tuan',
    name: 'Trịnh Tam Công',
    role: 'Chuyên viên KD (top DS)',
    color: '#3B82F6',
    deskPosition: [-6.5, 0.8, 3],
    seatPosition: [-6.5, 0, 3.5],
  },
  {
    id: 'huong',
    name: 'Nguyễn Tuấn Dũng',
    role: 'Chuyên viên KD',
    color: '#10B981',
    deskPosition: [-2.5, 0.8, 3],
    seatPosition: [-2.5, 0, 3.5],
  },
  {
    id: 'linh',
    name: 'Đinh Công Thường',
    role: 'Chuyên viên KD (mới)',
    color: '#F59E0B',
    deskPosition: [1.5, 0.8, 3],
    seatPosition: [1.5, 0, 3.5],
  },
  {
    id: 'luan',
    name: 'Lê Minh Luân',
    role: 'Chuyên viên KD',
    color: '#EF4444',
    deskPosition: [5, 0.8, 3],
    seatPosition: [5, 0, 3.5],
  },
  // ── Hàng 2 (z=0) ──
  {
    id: 'tri',
    name: 'Lê Huỳnh Trí',
    role: 'Chuyên viên KD',
    color: '#06B6D4',
    deskPosition: [-7.5, 0.8, 0],
    seatPosition: [-7.5, 0, 0.5],
  },
  {
    id: 'duc',
    name: 'Trần Đăng Duy',
    role: 'Trưởng nhóm Bom Tấn',
    color: '#6366F1',
    deskPosition: [-4.5, 0.8, 0],
    seatPosition: [-4.5, 0, 0.5],
  },
  {
    id: 'mai',
    name: 'Lâm Quốc Thắng',
    role: 'Chuyên viên KD',
    color: '#EC4899',
    deskPosition: [0, 0.8, 0],
    seatPosition: [0, 0, 0.5],
  },
  {
    id: 'khoa',
    name: 'Phạm Đỗ Hoàng Khoa',
    role: 'Chuyên viên KD',
    color: '#F97316',
    deskPosition: [3.5, 0.8, 0],
    seatPosition: [3.5, 0, 0.5],
  },
  {
    id: 'thanhduy',
    name: 'Nguyễn Thanh Duy',
    role: 'Chuyên viên KD',
    color: '#84CC16',
    deskPosition: [7.5, 0.8, 0],
    seatPosition: [7.5, 0, 0.5],
  },
]

// ── Simulation script (time in seconds) ─────────────────────────────────────
// Bối cảnh: HỌP NHÓM BOM TẤN đủ 10 người (môi giới BĐS — King Land Trụ sở).
// Trưởng nhóm Trần Đăng Duy chủ trì. Câu thoại bám nội dung họp thật: báo cáo
// đầu họp, kỷ luật chấm công, cách tính DS (phí thực thu), QĐ04 (báo hàng / vai
// trò / chia 30-70 / ưu tiên nội bộ 3h), tình hình 2 quý, incentive, thi đua
// quay clip, pipeline tuần, đào tạo HĐ đặt cọc, trọng tâm tháng 6.

export const SIMULATION_SCRIPT: ScriptEvent[] = [
  // ═══ Hồi 1 (0–22s): Ở bàn — báo cáo & hỏi quy chế ═══
  {
    time: 4,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Vào họp nhóm Bom Tấn. Mỗi người báo nhanh: tuần rồi dẫn mấy khách, gọi mấy chủ nhà, và 3 căn ngon nhất sẽ bán trong tháng 6.',
      feature: 'Báo cáo đầu họp: khách dẫn, chủ đã gọi, 3 căn tốt nhất',
      severity: 'high',
      emoji: '📊',
    },
  },
  {
    time: 6,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Tuần rồi anh dẫn 4 khách xem nhà, gọi 8 chủ. Căn anh thấy ngon nhất tháng này là hẻm Lê Văn Sỹ — giá đang mềm, dễ chốt.',
      feature: 'Báo cáo top DS: khách + chủ + căn trọng điểm',
      severity: 'low',
      emoji: '🏆',
    },
  },
  {
    time: 8,
    who: 'huy',
    action: {
      type: 'speech',
      msg: 'Tháng rồi em đi trễ nhiều quá, em biết vượt 4 lần là phạt 50k mỗi lần. Tháng này em cam kết đúng giờ anh.',
      feature: 'Kỷ luật chấm công: trễ ≤4 lần, nghỉ ≤3 ngày/tháng',
      severity: 'medium',
      emoji: '⏰',
    },
  },
  {
    time: 10,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Căn báo lên nhóm phải đủ địa chỉ, diện tích, kết cấu, giá, phí, tình trạng còn bán mới hợp lệ tính 1% phải không anh?',
      feature: 'Báo hàng hợp lệ: đủ thông tin → người báo hưởng 1% (QĐ04)',
      severity: 'medium',
      emoji: '📋',
    },
  },
  {
    time: 12,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Em mới vào, doanh số tính trên phí môi giới thực thu chứ không tính giá trị căn nhà đúng không anh?',
      feature: 'Cách tính doanh số: trên phí môi giới thực thu',
      severity: 'medium',
      emoji: '🧮',
    },
  },
  { time: 13, who: 'linh', action: { type: 'walk', target: 'colleague', colleagueId: 'huong' } },
  { time: 14, who: 'duc', action: { type: 'walk', target: 'colleague', colleagueId: 'tuan' } },
  {
    time: 15,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Căn giá tốt này anh báo lên nhóm Bom Tấn trước, ưu tiên mình khai thác 3 tiếng rồi mới đưa ra nhóm chung Trụ sở.',
      feature: 'Ưu tiên nội bộ Bom Tấn 3 tiếng trước nhóm chung',
      severity: 'high',
      emoji: '⏱️',
    },
  },
  {
    time: 17,
    who: 'luan',
    action: {
      type: 'speech',
      msg: 'Mình cùng báo một căn thì trong 30 ngày người báo đầu hưởng hết, sau 30 ngày mới chia 30-70 đúng không anh?',
      feature: 'Chia quyền lợi: <30 ngày người báo đầu 100%; sau 30 ngày 30/70',
      severity: 'medium',
      emoji: '🤝',
    },
  },
  {
    time: 19,
    who: 'tri',
    action: {
      type: 'speech',
      msg: 'Nhà giảm trên 10% so với giá báo trước thì người báo giá mới được tính công làm giá, đúng không anh Duy?',
      feature: 'Điều kiện công làm giá: giảm >10% (≤20 tỷ) hoặc >7% (>20 tỷ)',
      severity: 'medium',
      emoji: '📉',
    },
  },
  {
    time: 21,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Tháng 5 nhóm mình bị phạt tổng 1,55 triệu vì đi trễ và nghỉ quá. Tháng 6 phải kỷ luật hơn anh ơi.',
      feature: 'Tổng tiền phạt T5: 1.550.000đ — cần tăng kỷ luật',
      severity: 'high',
      emoji: '💸',
    },
  },

  // ═══ Hồi 2 (23–33s): Triệu tập họp — đọc bảng quy định nhóm ═══
  { time: 23, who: 'duc', action: { type: 'callMeeting' } },
  { time: 24, who: 'tuan',     action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'huong',    action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'linh',     action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'luan',     action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'huy',      action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'tri',      action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'mai',      action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'khoa',     action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'thanhduy', action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'duc',      action: { type: 'walk', target: 'meeting' } },
  {
    time: 29,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'QUY ĐỊNH NHÓM BOM TẤN: 1·DS = phí môi giới thực thu • 2·Báo nhà hợp lệ 1% • 3·Giá tốt báo nội bộ trước 3h • 4·Đi trễ ≤4 lần, nghỉ ≤3 ngày/tháng.',
      feature: 'Bảng 4 quy định vận hành nhóm Bom Tấn',
      severity: 'high',
      emoji: '📋',
    },
  },

  // ═══ Hồi 3 (34–80s): Về bàn — DS, pipeline, quyền lợi, trọng tâm T6 ═══
  { time: 34, who: 'tuan',     action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'huong',    action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'linh',     action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'luan',     action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'huy',      action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'tri',      action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'mai',      action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'khoa',     action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'thanhduy', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'duc',      action: { type: 'walk', target: 'desk' } },
  {
    time: 38,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Nửa đầu năm nhóm đạt 23,8% chỉ tiêu, chỉ 4/9 người có doanh số. Tháng 6 chuyển trọng tâm sang gọi chủ cũ, làm giá, săn nguồn hàng thật.',
      feature: 'Tình hình 2 quý: 23,8% — trọng tâm T6 là nguồn hàng & làm giá',
      severity: 'high',
      emoji: '🎯',
    },
  },
  {
    time: 41,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Theo dõi pipeline theo tuần: khách nóng, nhà nóng, chủ đang đàm phán, khả năng chốt — vậy mới không bị hụt chỉ tiêu cuối tháng.',
      feature: 'Kiểm soát pipeline theo tuần (4 cột)',
      severity: 'medium',
      emoji: '🔄',
    },
  },
  {
    time: 43,
    who: 'khoa',
    action: {
      type: 'speech',
      msg: 'Mỗi giao dịch chia theo 4 vai trò: người chốt chính hưởng phần còn lại, người báo nhà 1%, người làm giá 0,5%, người hỗ trợ hồ sơ.',
      feature: '4 vai trò trong giao dịch & tỷ lệ chia phí môi giới',
      severity: 'medium',
      emoji: '💰',
    },
  },
  { time: 45, who: 'mai',     action: { type: 'walk', target: 'coffee' } },
  { time: 46, who: 'thanhduy', action: { type: 'walk', target: 'coffee' } },
  {
    time: 47,
    who: 'thanhduy',
    action: {
      type: 'speech',
      msg: 'Thi đua quay clip review nhà: gắn mic trên cổ áo, clip hoàn chỉnh không trùng lặp. Kim Cương 2 triệu, Vàng 1 triệu, Bạc 500k!',
      feature: 'Thi đua quay clip: 3 hạng thưởng, bắt buộc gắn mic',
      severity: 'medium',
      emoji: '🎬',
    },
  },
  {
    time: 50,
    who: 'luan',
    action: {
      type: 'speech',
      msg: 'Incentive tháng này: đạt 158 triệu thưởng 1,68 triệu; đạt 508 triệu thưởng 7,68 triệu; đạt 708 triệu nhận iPhone 17 Pro Max!',
      feature: 'Chính sách incentive: 4 mốc doanh số — đỉnh là iPhone 17 Pro Max',
      severity: 'medium',
      emoji: '🎁',
    },
  },
  {
    time: 53,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Em mới vào, anh cho em biết cách gặp riêng 15 phút mỗi tuần với trưởng nhóm để chốt 1 việc phải làm và kiểm tra kết quả không ạ?',
      feature: 'Cơ chế 1-1 tuần: nhân sự mới gặp trưởng nhóm 15 phút/tuần',
      severity: 'medium',
      emoji: '🤙',
    },
  },
  { time: 55, who: 'mai',      action: { type: 'walk', target: 'desk' } },
  { time: 55, who: 'thanhduy', action: { type: 'walk', target: 'desk' } },
  {
    time: 57,
    who: 'tri',
    action: {
      type: 'speech',
      msg: 'Mỗi căn trọng điểm chỉ một đầu mối phụ trách, tránh nhiều người cùng gọi chủ gây loạn thông tin và giật giá.',
      feature: 'Mỗi căn 1 đầu mối phụ trách — tránh gọi chồng chéo',
      severity: 'high',
      emoji: '🏠',
    },
  },
  {
    time: 59,
    who: 'huy',
    action: {
      type: 'speech',
      msg: 'Nhóm cũng cần được công ty hỗ trợ tiền đăng tin và danh sách nguồn hàng cũ cần làm giá để tăng đầu vào tháng 6.',
      feature: 'Kiến nghị: hỗ trợ đăng tin & danh sách nguồn hàng cũ',
      severity: 'medium',
      emoji: '📢',
    },
  },
  {
    time: 62,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Tháng 6 tổ chức đào tạo viết hợp đồng đặt cọc — anh chấm điểm theo lỗi sai thực tế. Ai làm được share kinh nghiệm cho cả nhóm.',
      feature: 'Đào tạo HĐ đặt cọc + chia sẻ kinh nghiệm thực chiến',
      severity: 'high',
      emoji: '📝',
    },
  },
  {
    time: 66,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Rõ hết rồi anh! Tháng 6 tụi em tập trung gọi chủ, làm giá thật, quay clip, và kéo thêm người có doanh số cho nhóm Bom Tấn.',
      feature: 'Cả nhóm cam kết: gọi chủ + làm giá + thi đua clip tháng 6',
      severity: 'low',
      emoji: '✅',
    },
  },
]

export const SCRIPT_DURATION = 72 // seconds before loop
