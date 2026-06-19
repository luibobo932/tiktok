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
  tuan_desk: new THREE.Vector3(-6.5, 0, 3.5),
  huong_desk: new THREE.Vector3(-2.5, 0, 3.5),
  linh_desk: new THREE.Vector3(1.5, 0, 3.5),
  duc_desk: new THREE.Vector3(-4.5, 0, 0.5),
  mai_desk: new THREE.Vector3(0, 0, 0.5),
}

// ── Personas (Nhóm Bom Tấn — Môi giới BĐS, Cty CP ĐT Địa ốc Sài Gòn King Land) ─

export const PERSONAS: PersonaData[] = [
  {
    id: 'tuan',
    name: 'Trịnh Tam Công',
    role: 'Chuyên viên KD (top doanh số)',
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
]

// ── Simulation script (time in seconds) ─────────────────────────────────────
// Bối cảnh: Buổi HỌP NHÓM BOM TẤN (môi giới BĐS — Cty CP ĐT Địa ốc Sài Gòn King
// Land, Trụ sở). Trưởng nhóm Trần Đăng Duy chủ trì; các chuyên viên báo cáo, hỏi
// đáp về quy chế và chốt trọng tâm tháng. Câu thoại bám đúng nội dung họp thật:
// báo cáo đầu họp, kỷ luật chấm công, cách tính doanh số (phí môi giới thực thu),
// quy chế báo hàng QĐ04 (1% / vai trò / chia 30-70 / ưu tiên nội bộ 3 tiếng),
// tình hình doanh số 2 quý, incentive + thi đua quay clip, trọng tâm tháng 6.

export const SIMULATION_SCRIPT: ScriptEvent[] = [
  // === Hồi 1: Ở bàn — Trưởng nhóm mở họp, nhân viên báo cáo & hỏi quy chế ===
  // (Báo cáo đầu họp: khách dẫn, chủ đã gọi, 3 căn tốt nhất)
  {
    time: 4,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Vào họp nhóm Bom Tấn. Mỗi người báo nhanh: tuần rồi dẫn mấy khách xem nhà, gọi mấy chủ nhà, và 3 căn ngon nhất sẽ bán trong tháng 6.',
      feature: 'Báo cáo đầu họp: khách dẫn, chủ đã gọi, 3 căn tốt nhất',
      severity: 'high',
      emoji: '📊',
    },
  },
  // (Cách tính doanh số — người mới hỏi)
  {
    time: 7,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Em mới vào, cho em hỏi doanh số tính trên phí môi giới thực thu hay trên giá trị căn nhà ạ?',
      feature: 'Cách tính doanh số: trên phí môi giới thực thu',
      severity: 'medium',
      emoji: '🧮',
    },
  },
  // (Báo hàng hợp lệ — QĐ04)
  {
    time: 10,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Căn em báo phải đủ địa chỉ, diện tích, kết cấu, giá, phí, tình trạng còn bán mới tính hợp lệ đúng không anh?',
      feature: 'Báo hàng hợp lệ: đủ thông tin mới được tính (QĐ04)',
      severity: 'medium',
      emoji: '📋',
    },
  },
  {
    time: 13,
    who: 'linh',
    action: { type: 'walk', target: 'colleague', colleagueId: 'huong' },
  },
  {
    time: 16,
    who: 'duc',
    action: { type: 'walk', target: 'colleague', colleagueId: 'tuan' },
  },
  // (Ưu tiên nội bộ Bom Tấn 3 tiếng trước nhóm chung)
  {
    time: 17,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Căn giá tốt này anh báo lên nhóm Bom Tấn trước, ưu tiên mình khai thác 3 tiếng rồi mới đưa ra nhóm chung Trụ sở.',
      feature: 'Ưu tiên nội bộ Bom Tấn 3 tiếng trước nhóm chung',
      severity: 'high',
      emoji: '⏱️',
    },
  },
  // (Kỷ luật chấm công)
  {
    time: 20,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Tháng rồi em đi trễ hơi nhiều, em biết quy định trễ quá 4 lần là phạt 50k mỗi lần, tháng này em sửa anh.',
      feature: 'Kỷ luật chấm công: trễ ≤4 lần, nghỉ ≤3 ngày/tháng',
      severity: 'medium',
      emoji: '⏰',
    },
  },

  // === Hồi 2: Trưởng nhóm triệu tập họp — đọc lại bảng quy định nhóm ===
  { time: 23, who: 'duc', action: { type: 'callMeeting' } },
  { time: 24, who: 'tuan', action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'huong', action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'linh', action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'mai', action: { type: 'walk', target: 'meeting' } },
  { time: 24, who: 'duc', action: { type: 'walk', target: 'meeting' } },
  {
    time: 29,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'QUY ĐỊNH NHÓM BOM TẤN: 1·Doanh số = phí môi giới thực thu • 2·Người báo nhà hợp lệ 1% • 3·Báo giá tốt lên nhóm trước 3 tiếng • 4·Đi trễ ≤4 lần/tháng.',
      feature: 'Bảng quy định vận hành nhóm Bom Tấn',
      severity: 'high',
      emoji: '📋',
    },
  },

  // === Hồi 3: Về bàn — tình hình doanh số, quyền lợi & trọng tâm tháng 6 ===
  { time: 34, who: 'tuan', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'huong', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'linh', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'mai', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'duc', action: { type: 'walk', target: 'desk' } },
  // (Tình hình doanh số 2 quý + trọng tâm tháng 6)
  {
    time: 39,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Nửa đầu năm nhóm mới đạt 23,8% chỉ tiêu, chỉ 4 trên 9 người có doanh số. Tháng 6 chuyển trọng tâm sang gọi chủ cũ, làm giá, săn nguồn hàng thật.',
      feature: 'Trọng tâm T6: săn nguồn hàng, gọi chủ, làm giá',
      severity: 'high',
      emoji: '🎯',
    },
  },
  // (Kiểm soát pipeline theo tuần)
  {
    time: 42,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Mình theo dõi pipeline theo tuần đúng không anh: khách nóng, nhà nóng, chủ đang đàm phán, rồi khả năng chốt?',
      feature: 'Kiểm soát pipeline theo tuần',
      severity: 'medium',
      emoji: '🔄',
    },
  },
  { time: 44, who: 'mai', action: { type: 'walk', target: 'coffee' } },
  { time: 46, who: 'linh', action: { type: 'walk', target: 'coffee' } },
  // (4 vai trò & tỷ lệ chia quyền lợi — QĐ04)
  {
    time: 47,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Vậy một giao dịch chia theo vai trò: người chốt chính, người báo nhà 1%, người làm giá tốt 0,5%, người hỗ trợ hồ sơ đúng không anh?',
      feature: '4 vai trò & tỷ lệ chia quyền lợi (QĐ04)',
      severity: 'medium',
      emoji: '💰',
    },
  },
  // (Chia quyền lợi khi nhiều người cùng báo 1 căn)
  {
    time: 50,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Nếu nhiều người cùng báo một căn thì trong 30 ngày người báo đầu hưởng hết, sau 30 ngày chia 30 trên 70 phải không anh?',
      feature: 'Chia quyền lợi khi nhiều người báo 1 căn (30 ngày · 30/70)',
      severity: 'medium',
      emoji: '🤝',
    },
  },
  { time: 54, who: 'linh', action: { type: 'walk', target: 'desk' } },
  { time: 54, who: 'mai', action: { type: 'walk', target: 'desk' } },
  // (Incentive doanh số + thi đua quay clip review nhà)
  {
    time: 57,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Em tham gia thi đua quay clip review nhà — nhớ gắn mic, clip phải hoàn chỉnh, ráng đạt mốc doanh số để có thưởng anh ha.',
      feature: 'Incentive doanh số + thi đua quay clip review nhà',
      severity: 'medium',
      emoji: '🎬',
    },
  },
  // (Đào tạo HĐ đặt cọc + mỗi căn 1 đầu mối phụ trách)
  {
    time: 60,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Tháng này tổ chức đào tạo viết hợp đồng đặt cọc, và mỗi căn trọng điểm chỉ một đầu mối phụ trách để dễ làm giá với chủ.',
      feature: 'Đào tạo HĐ đặt cọc + mỗi căn 1 đầu mối phụ trách',
      severity: 'high',
      emoji: '📝',
    },
  },
  // Cả nhóm cam kết trọng tâm tháng 6
  {
    time: 64,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Rõ hết rồi anh. Tháng 6 tụi em tập trung gọi chủ, làm giá thật và chốt thêm giao dịch cho nhóm Bom Tấn.',
      feature: 'Cả nhóm cam kết trọng tâm tháng 6',
      severity: 'low',
      emoji: '✅',
    },
  },
]

export const SCRIPT_DURATION = 70 // seconds before loop
