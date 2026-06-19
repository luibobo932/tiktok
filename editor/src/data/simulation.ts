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

// ── Personas ────────────────────────────────────────────────────────────────

export const PERSONAS: PersonaData[] = [
  {
    id: 'tuan',
    name: 'Anh Tuấn',
    role: 'Căn hộ cao cấp',
    color: '#3B82F6',
    deskPosition: [-6.5, 0.8, 3],
    seatPosition: [-6.5, 0, 3.5],
  },
  {
    id: 'huong',
    name: 'Chị Hương',
    role: 'Đất nền tỉnh',
    color: '#10B981',
    deskPosition: [-2.5, 0.8, 3],
    seatPosition: [-2.5, 0, 3.5],
  },
  {
    id: 'linh',
    name: 'Em Linh',
    role: 'Cho thuê / Gen Z',
    color: '#F59E0B',
    deskPosition: [1.5, 0.8, 3],
    seatPosition: [1.5, 0, 3.5],
  },
  {
    id: 'duc',
    name: 'Anh Đức',
    role: 'Trưởng nhóm sàn',
    color: '#6366F1',
    deskPosition: [-4.5, 0.8, 0],
    seatPosition: [-4.5, 0, 0.5],
  },
  {
    id: 'mai',
    name: 'Chị Mai',
    role: 'Biệt thự nghỉ dưỡng',
    color: '#EC4899',
    deskPosition: [0, 0.8, 0],
    seatPosition: [0, 0, 0.5],
  },
]

// ── Simulation script (time in seconds) ─────────────────────────────────────

export const SIMULATION_SCRIPT: ScriptEvent[] = [
  // === Hồi 1: Khám phá ban đầu ===
  {
    time: 4,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Logo công ty đâu? Khách không biết video của ai hết!',
      feature: 'Logo watermark & thông tin môi giới',
      severity: 'high',
      emoji: '🤨',
    },
  },
  {
    time: 7,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Trời ơi! Quay ngang mà viền đen hai bên bự quá, xấu lắm!',
      feature: 'Blur background thay viền đen (video ngang)',
      severity: 'high',
      emoji: '😰',
    },
  },
  {
    time: 10,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'RELOAD TRANG LÀ MẤT HẾT DỰ ÁN RỒI!! Không có autosave à??',
      feature: 'Tự động lưu & khôi phục dự án',
      severity: 'high',
      emoji: '😱',
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
      msg: 'Tuấn ơi logo sàn mình đâu? Mỗi bạn làm một kiểu khác nhau hết!',
      feature: 'Brand kit chung cho cả team',
      severity: 'high',
      emoji: '🧐',
    },
  },
  {
    time: 20,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Clip dài 8 phút, kéo từng đoạn một bằng slider nhỏ xíu mệt xỉu...',
      feature: 'Timeline tổng multi-clip',
      severity: 'medium',
      emoji: '😤',
    },
  },

  // === Hồi 2: Họp khẩn ===
  {
    time: 23,
    who: 'duc',
    action: { type: 'callMeeting' },
  },
  {
    time: 24,
    who: 'tuan',
    action: { type: 'walk', target: 'meeting' },
  },
  {
    time: 24,
    who: 'huong',
    action: { type: 'walk', target: 'meeting' },
  },
  {
    time: 24,
    who: 'linh',
    action: { type: 'walk', target: 'meeting' },
  },
  {
    time: 24,
    who: 'mai',
    action: { type: 'walk', target: 'meeting' },
  },
  {
    time: 24,
    who: 'duc',
    action: { type: 'walk', target: 'meeting' },
  },
  {
    time: 29,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Team ơi cần gấp 3 thứ: LOGO • NHẠC NỀN • LƯU TỰ ĐỘNG! Không có 3 cái này khó dùng lắm!',
      feature: 'P0: Logo + Nhạc nền + Auto-save',
      severity: 'high',
      emoji: '📋',
    },
  },

  // === Hồi 3: Vấn đề sâu hơn ===
  {
    time: 34,
    who: 'tuan',
    action: { type: 'walk', target: 'desk' },
  },
  {
    time: 34,
    who: 'huong',
    action: { type: 'walk', target: 'desk' },
  },
  {
    time: 34,
    who: 'linh',
    action: { type: 'walk', target: 'desk' },
  },
  {
    time: 34,
    who: 'mai',
    action: { type: 'walk', target: 'desk' },
  },
  {
    time: 34,
    who: 'duc',
    action: { type: 'walk', target: 'desk' },
  },
  {
    time: 39,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Xuất video ra 480MB! TikTok báo lỗi file quá lớn không upload được!',
      feature: 'Tối ưu dung lượng file khi export',
      severity: 'high',
      emoji: '😒',
    },
  },
  {
    time: 42,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Tôi ngại nói, muốn gõ chữ rồi máy đọc giùm được không?',
      feature: 'Text-to-speech giọng Việt',
      severity: 'medium',
      emoji: '🙁',
    },
  },
  {
    time: 44,
    who: 'mai',
    action: { type: 'walk', target: 'coffee' },
  },
  {
    time: 46,
    who: 'linh',
    action: { type: 'walk', target: 'coffee' },
  },
  {
    time: 47,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Ước gì có nhạc biển... nhạc sang trọng cho biệt thự nghỉ dưỡng á!',
      feature: 'Thư viện nhạc theo mood (sang, tươi vui, bình yên...)',
      severity: 'medium',
      emoji: '☕',
    },
  },
  {
    time: 50,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Chị ơi trên điện thoại lag lắm, thanh kéo nhỏ xíu không kéo được!',
      feature: 'Tối ưu giao diện & hiệu năng mobile',
      severity: 'high',
      emoji: '📱',
    },
  },
  {
    time: 54,
    who: 'linh',
    action: { type: 'walk', target: 'desk' },
  },
  {
    time: 54,
    who: 'mai',
    action: { type: 'walk', target: 'desk' },
  },
  {
    time: 57,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Mỗi căn phải làm lại từ đầu, chị ơi! Cần lưu template dùng lại!',
      feature: 'Template tái sử dụng & nhân bản dự án',
      severity: 'high',
      emoji: '🔥',
    },
  },
  {
    time: 60,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Xuất xong cần upload thẳng lên TikTok luôn, không phải tải về rồi đăng lại!',
      feature: 'Chia sẻ trực tiếp lên TikTok / Zalo',
      severity: 'medium',
      emoji: '🎯',
    },
  },
  {
    time: 64,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Muốn ghim bản đồ vào clip luôn, khách biết vị trí ngay!',
      feature: 'Overlay bản đồ / địa chỉ',
      severity: 'low',
      emoji: '🗺️',
    },
  },
]

export const SCRIPT_DURATION = 68 // seconds before loop
