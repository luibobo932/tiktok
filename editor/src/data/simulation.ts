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
  // (mục V — form đăng video bắt buộc 9 trường)
  {
    time: 4,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Đăng video căn Kỳ Đồng Q3, form bắt điền đủ 9 mục: loại nội dung, căn, quận, đường, loại nhà, giá, diện tích, khách phù hợp, người phụ trách. Mỗi video mất 10 phút!',
      feature: 'Tự điền form đăng video từ hồ sơ listing đã có (mục V)',
      severity: 'high',
      emoji: '😮‍💨',
    },
  },
  // (mục VII — kho kiến thức: phân biệt hẻm xe hơi / hẻm ba gác)
  {
    time: 7,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Căn hẻm Sư Vạn Hạnh Q5 — app bắt chọn "hẻm xe hơi" hay "hẻm ba gác" mà không có hình minh hoạ, cô chọn đại à?',
      feature: 'Chú thích + hình minh hoạ loại hẻm (gắn Kho kiến thức, mục VII)',
      severity: 'medium',
      emoji: '🤷‍♀️',
    },
  },
  // (mục II — feed video-first: nhúng video thật, không phải link trôi)
  {
    time: 10,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Em dán link TikTok review căn Hồ Thị Kỷ Q10 vô feed, mà web không nhúng được video — ra mỗi cái link trơ.',
      feature: 'Nhúng video chuẩn (oEmbed) cho feed video-first (mục II)',
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
  // (mục VI — mã căn + 1 người phụ trách / căn)
  {
    time: 17,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Căn Nguyễn Đình Chiểu Q1 sao có 2 người để "người phụ trách" khác nhau? Trùng mã căn rồi Tuấn ơi!',
      feature: 'Chống trùng mã căn + khoá 1 người phụ trách / listing (mục VI)',
      severity: 'high',
      emoji: '🧐',
    },
  },
  // (mục VII — soạn bài cho kho kiến thức)
  {
    time: 20,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Em viết bài "Cách phân biệt hẻm xe hơi" cho Kho kiến thức mà editor không chèn được ảnh, chỉ có ô text trơn.',
      feature: 'Trình soạn thảo bài viết (rich text + ảnh) cho Kho kiến thức',
      severity: 'medium',
      emoji: '✍️',
    },
  },

  // === Hồi 2: Đức triệu tập họp — chốt P0 đúng kế hoạch ===
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
      msg: 'Chốt P0 cho soft-launch: NHÚNG VIDEO chuẩn • CHỐNG TRÙNG listing • PHÂN LEAD tự động. AI gợi ý nhà để giai đoạn sau!',
      feature: 'P0 MVP: Nhúng video + Chống trùng listing + Phân lead tự động',
      severity: 'high',
      emoji: '📋',
    },
  },

  // === Hồi 3: Về bàn, vấn đề vận hành sâu hơn ===
  { time: 34, who: 'tuan', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'huong', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'linh', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'mai', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'duc', action: { type: 'walk', target: 'desk' } },
  // (mục IX — lead quá 2 giờ bị thu hồi; KPI "liên hệ trong 2 giờ")
  {
    time: 39,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Theo quy trình lead, quá 2 giờ không gọi là bị thu hồi — nhưng app không báo Zalo, người phụ trách đâu có biết mà gọi!',
      feature: 'Thông báo lead realtime (Zalo) + đồng hồ đếm ngược SLA 2 giờ (mục IX)',
      severity: 'high',
      emoji: '⏰',
    },
  },
  // (mục VI — trạng thái giao dịch: còn bán / đã bán)
  {
    time: 42,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Khách hỏi căn Sư Vạn Hạnh còn không, web vẫn để badge "còn bán" dù chốt từ tuần trước — quê với khách lắm!',
      feature: 'Cập nhật trạng thái listing realtime (còn bán → đã bán)',
      severity: 'high',
      emoji: '😬',
    },
  },
  { time: 44, who: 'mai', action: { type: 'walk', target: 'coffee' } },
  { time: 46, who: 'linh', action: { type: 'walk', target: 'coffee' } },
  // (mục VII + XI — kho kiến thức là tài sản SEO dài hạn)
  {
    time: 47,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Mình định lấy Kho kiến thức làm tài sản SEO dài hạn, mà bài viết không có meta, không lên Google luôn.',
      feature: 'SEO meta + sitemap cho listing & bài kiến thức (mục VII, XI)',
      severity: 'medium',
      emoji: '🔍',
    },
  },
  // (mục XIII — soft-launch phải test giao diện mobile)
  {
    time: 50,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Trang admin duyệt nội dung mở trên điện thoại bị tràn ngang, bấm không trúng nút — soft-launch mình test mobile là toang.',
      feature: 'Admin/CRM responsive cho mobile (mục XIII)',
      severity: 'high',
      emoji: '📱',
    },
  },
  { time: 54, who: 'linh', action: { type: 'walk', target: 'desk' } },
  { time: 54, who: 'mai', action: { type: 'walk', target: 'desk' } },
  // (mục IV.6 / X — admin duyệt nội dung trước khi công khai)
  {
    time: 57,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Video em quay 3 ngày rồi mà chưa ai duyệt công khai, hết trend mất! Hàng đợi duyệt phải nhanh hơn anh ơi.',
      feature: 'Hàng đợi duyệt nội dung nhanh + duyệt được trên mobile',
      severity: 'high',
      emoji: '🔥',
    },
  },
  // (mục X + XV.1 — cấm CTV xuất data hàng loạt, phải ghi log)
  {
    time: 60,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Kế hoạch ghi rõ: CTV không được xuất danh sách khách hàng hàng loạt. App phải chặn + ghi log thao tác, không là lộ data chủ nhà với khách mua!',
      feature: 'Phân quyền chặt + log thao tác (rủi ro #1, mục X & XV)',
      severity: 'high',
      emoji: '🔒',
    },
  },
  // (mục VIII — cổng chủ nhà gửi bán phải tự tạo lead nguồn hàng)
  {
    time: 64,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Cổng "Chủ nhà gửi nhà bán" nhận form xong mà không tự tạo lead nguồn hàng trong admin, anh phải copy tay từng căn!',
      feature: 'Form chủ nhà → tự tạo lead nguồn hàng trong admin (mục VIII)',
      severity: 'high',
      emoji: '🏠',
    },
  },
]

export const SCRIPT_DURATION = 70 // seconds before loop
