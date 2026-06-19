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

// ── Personas (App SKL — nền tảng video BĐS nhà phố NhàPhốSG) ──────────────────

export const PERSONAS: PersonaData[] = [
  {
    id: 'tuan',
    name: 'Anh Tuấn',
    role: 'Môi giới nhà phố Q3',
    color: '#3B82F6',
    deskPosition: [-6.5, 0.8, 3],
    seatPosition: [-6.5, 0, 3.5],
  },
  {
    id: 'huong',
    name: 'Chị Hương',
    role: 'Môi giới nhà hẻm Q5',
    color: '#10B981',
    deskPosition: [-2.5, 0.8, 3],
    seatPosition: [-2.5, 0, 3.5],
  },
  {
    id: 'linh',
    name: 'Em Linh',
    role: 'CTV quay video (Gen Z)',
    color: '#F59E0B',
    deskPosition: [1.5, 0.8, 3],
    seatPosition: [1.5, 0, 3.5],
  },
  {
    id: 'duc',
    name: 'Anh Đức',
    role: 'Trưởng nhóm / Admin',
    color: '#6366F1',
    deskPosition: [-4.5, 0.8, 0],
    seatPosition: [-4.5, 0, 0.5],
  },
  {
    id: 'mai',
    name: 'Chị Mai',
    role: 'Content & Kiến thức',
    color: '#EC4899',
    deskPosition: [0, 0.8, 0],
    seatPosition: [0, 0, 0.5],
  },
]

// ── Simulation script (time in seconds) ─────────────────────────────────────
// Bối cảnh: cả nhóm đang dùng thử App SKL (NhàPhốSG) — đăng video, tạo listing,
// nhận lead, duyệt nội dung — và phát sinh vấn đề thực tế của nền tảng.

export const SIMULATION_SCRIPT: ScriptEvent[] = [
  // === Hồi 1: Mỗi người tự dùng app, vấn đề lộ ra ===
  {
    time: 4,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Đăng 1 video mà bắt điền 12 ô: quận, đường, giá, diện tích, khách phù hợp... nản quá!',
      feature: 'Rút gọn form đăng video — tự điền từ hồ sơ listing',
      severity: 'high',
      emoji: '😮‍💨',
    },
  },
  {
    time: 7,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Cô đâu biết "hẻm xe hơi" với "hẻm ba gác" khác gì mà chọn loại nhà!',
      feature: 'Chú thích + chọn loại nhà bằng hình minh hoạ',
      severity: 'medium',
      emoji: '🤷‍♀️',
    },
  },
  {
    time: 10,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Dán link video TikTok vô mà web không hiện gì, chỉ ra cái link trơ trọi à??',
      feature: 'Nhúng video TikTok chuẩn (oEmbed) thay vì link suông',
      severity: 'high',
      emoji: '😵',
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
  {
    time: 17,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Căn Lê Văn Sỹ này sao có 2 người nhận phụ trách? Trùng mã căn rồi Tuấn ơi!',
      feature: 'Chống trùng listing + khoá 1 người phụ trách / căn',
      severity: 'high',
      emoji: '🧐',
    },
  },
  {
    time: 20,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Em viết bài kiến thức mà không có chỗ chèn ảnh, chỉ có mỗi ô text trơn.',
      feature: 'Trình soạn thảo bài viết (rich text + chèn ảnh)',
      severity: 'medium',
      emoji: '✍️',
    },
  },

  // === Hồi 2: Đức triệu tập họp khẩn ===
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
      msg: '3 việc gấp: NHÚNG VIDEO chuẩn • PHÂN LEAD tự động • CHỐNG TRÙNG listing. Không là loạn!',
      feature: 'P0: Nhúng video + Phân lead tự động + Chống trùng listing',
      severity: 'high',
      emoji: '📋',
    },
  },

  // === Hồi 3: Về bàn, vấn đề sâu hơn ===
  { time: 34, who: 'tuan', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'huong', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'linh', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'mai', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'duc', action: { type: 'walk', target: 'desk' } },
  {
    time: 39,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Lead khách mua về 2 tiếng không ai gọi là bị thu hồi — mà app chẳng báo cho ai hết!',
      feature: 'Thông báo lead realtime (Zalo/app) + đếm ngược SLA 2 giờ',
      severity: 'high',
      emoji: '⏰',
    },
  },
  {
    time: 42,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Khách gọi hỏi căn còn không, mà web vẫn ghi "còn bán" dù bán cả tuần rồi!',
      feature: 'Đồng bộ trạng thái listing realtime',
      severity: 'high',
      emoji: '😬',
    },
  },
  { time: 44, who: 'mai', action: { type: 'walk', target: 'coffee' } },
  { time: 46, who: 'linh', action: { type: 'walk', target: 'coffee' } },
  {
    time: 47,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Bài kiến thức nhà phố của em không lên Google, thiếu SEO hết trơn.',
      feature: 'SEO meta + sitemap cho listing & bài viết',
      severity: 'medium',
      emoji: '🔍',
    },
  },
  {
    time: 50,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Trang admin mở trên điện thoại bị tràn ngang, bấm không trúng nút luôn!',
      feature: 'Admin responsive cho mobile',
      severity: 'high',
      emoji: '📱',
    },
  },
  { time: 54, who: 'linh', action: { type: 'walk', target: 'desk' } },
  { time: 54, who: 'mai', action: { type: 'walk', target: 'desk' } },
  {
    time: 57,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Video em đăng 3 ngày chưa được duyệt, hết trend mất rồi anh ơi!',
      feature: 'Hàng đợi duyệt nhanh + duyệt được trên mobile',
      severity: 'high',
      emoji: '🔥',
    },
  },
  {
    time: 60,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'CTV mà xuất được nguyên danh sách khách hàng thì chết. Phải chặn + ghi log ngay!',
      feature: 'Phân quyền chặt + log thao tác (chống lộ data khách)',
      severity: 'high',
      emoji: '🔒',
    },
  },
  {
    time: 64,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Khách lọc "Q5 dưới 15 tỷ, hẻm xe hơi" mà ra toàn mặt tiền 30 tỷ!',
      feature: 'Sửa bộ lọc giá + loại nhà cho đúng',
      severity: 'medium',
      emoji: '🧮',
    },
  },
]

export const SCRIPT_DURATION = 70 // seconds before loop
