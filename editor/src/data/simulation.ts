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
// Bối cảnh: Buổi phổ biến QUY ĐỊNH NHÓM khi vận hành trên App SKL (NhàPhốSG).
// Trưởng nhóm/Admin (Đức) đọc lại quy định, nhân viên & CTV hỏi đáp và xác nhận.
// Mọi câu thoại bám đúng quy chế trong kế hoạch: mục III (sở hữu dữ liệu),
// mục VI (1 căn 1 người phụ trách), mục IX (quy trình lead), mục X (quyền &
// giới hạn của nhân viên/CTV, cơ chế hoa hồng), mục XV (bảo mật dữ liệu).

export const SIMULATION_SCRIPT: ScriptEvent[] = [
  // === Hồi 1: Ở bàn — Admin nhắc quy định, nhân viên hỏi quyền của mình ===
  // (mục III — dữ liệu khách & chủ nhà thuộc nền tảng)
  {
    time: 4,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Quy định số 1 trên App SKL: dữ liệu khách mua và chủ nhà là tài sản của nền tảng — cấm sao chép hay lưu riêng ra ngoài.',
      feature: 'Quy định sở hữu dữ liệu thuộc nền tảng (mục III)',
      severity: 'high',
      emoji: '🔐',
    },
  },
  // (mục X — quyền của CTV: đăng video review + kiến thức)
  {
    time: 7,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Em là CTV thì theo quy định được đăng video review nhà và video kiến thức, được đề xuất listing mới đúng không anh?',
      feature: 'Làm rõ quyền của CTV trên App SKL (mục X)',
      severity: 'low',
      emoji: '✋',
    },
  },
  // (mục X — không tự công khai listing chưa duyệt)
  {
    time: 10,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Căn Sư Vạn Hạnh Q5 cô làm xong rồi, nhưng quy định là chưa Admin duyệt thì không được tự công khai, phải không?',
      feature: 'Quy định: không tự công khai listing chưa duyệt (mục X)',
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
  // (mục VI / X — 1 listing chỉ 1 người phụ trách)
  {
    time: 17,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Căn Nguyễn Đình Chiểu Q1 anh đang phụ trách rồi nha — quy định 1 căn chỉ 1 người, App SKL không cho nhận trùng.',
      feature: 'Quy định 1 listing = 1 người phụ trách (mục VI, X)',
      severity: 'high',
      emoji: '🧐',
    },
  },
  // (mục X — quyền lợi: ghi nhận người tạo nội dung mang lead)
  {
    time: 20,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Bài kiến thức em viết mà kéo được lead về thì theo quy định em có được ghi nhận công, tính quyền lợi không anh?',
      feature: 'Quyền lợi: ghi nhận người tạo nội dung mang lead (mục X)',
      severity: 'medium',
      emoji: '✍️',
    },
  },

  // === Hồi 2: Đức triệu tập họp — đọc lại bảng quy định nhóm ===
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
      msg: 'QUY ĐỊNH NHÓM khi dùng App SKL: 1·Dữ liệu thuộc nền tảng • 2·Duyệt trước khi công khai • 3·Lead 2 giờ phải gọi • 4·Hoa hồng theo giao dịch.',
      feature: 'Bảng quy định nhóm vận hành trên App SKL',
      severity: 'high',
      emoji: '📋',
    },
  },

  // === Hồi 3: Về bàn — áp dụng quy định lead, quyền lợi, bảo mật ===
  { time: 34, who: 'tuan', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'huong', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'linh', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'mai', action: { type: 'walk', target: 'desk' } },
  { time: 34, who: 'duc', action: { type: 'walk', target: 'desk' } },
  // (mục IX — lead quá 2 giờ không gọi bị thu hồi)
  {
    time: 39,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Quy định lead: nhận khách mua quá 2 giờ không liên hệ là bị thu hồi, chuyển cho người khác. App SKL tự đếm giờ cho từng lead.',
      feature: 'Quy định SLA lead 2 giờ + tự thu hồi (mục IX)',
      severity: 'high',
      emoji: '⏰',
    },
  },
  // (mục IX — pipeline trạng thái lead chuẩn)
  {
    time: 42,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Trạng thái lead mình cập nhật đúng các bước: mới → đã liên hệ → đang tư vấn → đã xem nhà → đàm phán → chốt, phải không anh?',
      feature: 'Chuẩn hoá pipeline trạng thái lead (mục IX)',
      severity: 'medium',
      emoji: '🔄',
    },
  },
  { time: 44, who: 'mai', action: { type: 'walk', target: 'coffee' } },
  { time: 46, who: 'linh', action: { type: 'walk', target: 'coffee' } },
  // (mục X — cơ chế quyền lợi: hoa hồng + ghi nhận nguồn)
  {
    time: 47,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Vậy quy định quyền lợi: hoa hồng chia theo từng giao dịch, còn nguồn listing và người mang lead đều được ghi nhận riêng đúng không?',
      feature: 'Quy định cơ chế hoa hồng & ghi nhận công (mục X)',
      severity: 'medium',
      emoji: '💰',
    },
  },
  // (mục X / XV — CTV không được xuất data hàng loạt)
  {
    time: 50,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'CTV tụi em theo quy định không được xuất danh sách khách hàng hàng loạt — cái này App SKL khoá quyền luôn cho chắc anh ha.',
      feature: 'Quy định cấm xuất data hàng loạt + khoá quyền (mục X, XV)',
      severity: 'high',
      emoji: '🔒',
    },
  },
  { time: 54, who: 'linh', action: { type: 'walk', target: 'desk' } },
  { time: 54, who: 'mai', action: { type: 'walk', target: 'desk' } },
  // (mục X — không dùng thương hiệu ngoài phạm vi thoả thuận)
  {
    time: 57,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Và quy định: em không được lấy thương hiệu NhàPhốSG đăng linh tinh ngoài phạm vi thoả thuận. Em nhớ rồi anh.',
      feature: 'Quy định dùng thương hiệu đúng phạm vi (mục X)',
      severity: 'medium',
      emoji: '🏷️',
    },
  },
  // (mục X / XV — không tự sửa data quan trọng, mọi thao tác ghi log)
  {
    time: 60,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Cuối cùng: không ai được tự sửa dữ liệu quan trọng của listing nếu không có quyền — mọi thao tác trên App SKL đều được ghi log.',
      feature: 'Quy định phân quyền sửa data + ghi log (mục X, XV)',
      severity: 'high',
      emoji: '📝',
    },
  },
  // Cả nhóm xác nhận đã nắm quy định
  {
    time: 64,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Rõ hết rồi anh. Cứ theo đúng quy định nhóm mà chạy trên App SKL là yên tâm, không sợ loạn dữ liệu.',
      feature: 'Cả nhóm nắm & cam kết tuân thủ quy định App SKL',
      severity: 'low',
      emoji: '✅',
    },
  },
]

export const SCRIPT_DURATION = 70 // seconds before loop
