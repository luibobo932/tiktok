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
  // ═══ Hồi 1 (0–22s): Ở bàn — mỗi người nói từ trải nghiệm của mình ═══
  {
    time: 4,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Họp nhanh, thực chất. Tôi cần số thật: tuần rồi ai dẫn bao nhiêu khách, gọi bao nhiêu chủ. Mỗi người cho tôi 3 căn có khả năng chốt thật sự tháng 6 — không phải căn đang rao mà chủ không muốn bán.',
      feature: 'Trưởng nhóm: yêu cầu số thật, không hứa suông',
      severity: 'high',
      emoji: '📊',
    },
  },
  {
    time: 6,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Anh gọi 12 chủ cũ tuần rồi, có 3 căn vừa mềm giá. Căn ngon nhất là hẻm Lê Văn Sỹ — từ 4,8 tỷ còn 4,2 tỷ, chủ đang cần tiền. Anh báo nhóm Bom Tấn trước sáng nay rồi, đang để 3 tiếng nội bộ khai thác.',
      feature: 'Tam Công: báo căn cụ thể, số thật, áp dụng đúng quy trình',
      severity: 'low',
      emoji: '🏆',
    },
  },
  {
    time: 8,
    who: 'huy',
    action: {
      type: 'speech',
      msg: 'Tháng 5 em trễ 9 lần, bị phạt 300k — em xin lỗi nhóm. Nguyên nhân là em đi thị trường từ 6h sáng, traffic kẹt về không kịp. Tháng này em đổi: sáng vào văn phòng đúng giờ trước, chiều mới ra thị trường.',
      feature: 'Huy nhận lỗi 9 lần trễ T5, đề xuất thay đổi lịch trình cụ thể',
      severity: 'medium',
      emoji: '🔧',
    },
  },
  {
    time: 10,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Tháng 4 anh chốt 170 triệu nhờ cái bảng pipeline anh tự làm. Mỗi thứ Hai update: khách nào đang nóng, căn nào đang mềm giá, ai đang đàm phán. Nhìn vào là biết ngay tuần này tập trung đâu — không đợi cuối tháng mới thấy hụt chỉ tiêu.',
      feature: 'Tuấn Dũng: pipeline tuần giúp chốt 170 triệu T4',
      severity: 'medium',
      emoji: '📈',
    },
  },
  {
    time: 12,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Em vào ngày 13/4. Tuần đầu em báo nhà kiểu "căn Lê Văn Sỹ 4 tỷ" — anh Duy bảo không hợp lệ. Hóa ra phải đủ địa chỉ, diện tích, kết cấu, giá, phí, tình trạng còn bán thì mới được tính 1%. Em rút kinh nghiệm từ cái đó.',
      feature: 'Thường: học báo hàng đúng chuẩn từ lỗi tuần đầu',
      severity: 'medium',
      emoji: '💡',
    },
  },
  { time: 13, who: 'linh', action: { type: 'walk', target: 'colleague', colleagueId: 'huong' } },
  { time: 14, who: 'duc', action: { type: 'walk', target: 'colleague', colleagueId: 'tuan' } },
  {
    time: 15,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Tuần trước anh làm giá căn này rồi báo nhóm Bom Tấn trước — 3 tiếng sau đã có khách nội bộ quan tâm, không cần đẩy ra nhóm chung. Cái ưu tiên 3 tiếng này anh thấy hiệu quả thật sự.',
      feature: 'Tam Công: ưu tiên 3 tiếng nội bộ đã chứng minh hiệu quả thực tế',
      severity: 'high',
      emoji: '⏱️',
    },
  },
  {
    time: 17,
    who: 'luan',
    action: {
      type: 'speech',
      msg: 'Lần trước em và anh Công cùng báo một căn — anh Công báo trước em đúng 3 tuần nên anh Công hưởng toàn bộ phần báo hàng. Cay lắm mà đúng. Từ đó em nhớ: timestamp Zalo quan trọng, 30 ngày trôi qua nhanh hơn mình nghĩ.',
      feature: 'Luân: bài học đắt từ case mất phần báo hàng vì chậm 3 tuần',
      severity: 'medium',
      emoji: '⚠️',
    },
  },
  {
    time: 19,
    who: 'tri',
    action: {
      type: 'speech',
      msg: 'Tháng 5 em nghỉ 12 ngày vì bệnh gút tái phát, phạt 450k. Tháng này em quay lại đủ sức rồi. Em sẽ tập trung gọi chủ cũ làm giá — nhà nào giảm trên 10% so với giá đã báo thì em cập nhật lên nhóm ngay, không để mất phần công làm giá.',
      feature: 'Trí: comeback sau nghỉ dài, kế hoạch cụ thể để gỡ điểm',
      severity: 'medium',
      emoji: '💪',
    },
  },
  {
    time: 21,
    who: 'mai',
    action: {
      type: 'speech',
      msg: 'Em trễ 10 lần tháng 5, bị phạt 350k — nhiều nhất nhóm. Không có lý do biện hộ. Tiền đã rút rồi, không lấy lại được. Em đặt báo thức trước giờ vào 30 phút, tháng này là việc em làm đầu tiên.',
      feature: 'Thắng: thẳng thắn nhận lỗi, không biện hộ, hành động cụ thể',
      severity: 'high',
      emoji: '🛠️',
    },
  },

  // ═══ Hồi 2 (23–33s): Triệu tập họp — TN chốt quy định ═══
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
      msg: 'Chốt 4 quy định nhóm: DS tính trên phí môi giới thực thu — không phải giá căn. Báo hàng đủ thông tin mới hưởng 1%. Giá tốt báo nhóm mình trước 3 tiếng. Trễ quá 4 lần là phạt — không có ngoại lệ.',
      feature: 'Trần Đăng Duy: 4 quy định cứng, không có ngoại lệ',
      severity: 'high',
      emoji: '📋',
    },
  },

  // ═══ Hồi 3 (34–72s): Về bàn — mỗi người nói về vấn đề của mình ═══
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
      msg: '618 triệu trong 5 tháng — 23,8% chỉ tiêu. Còn thiếu gần 2 tỷ. Tháng 6 tôi muốn ít nhất 6 người có giao dịch, không chỉ 4. Ai vẫn chưa có deal thì tôi ngồi riêng 15 phút để tìm ra vấn đề ở đâu.',
      feature: 'Trần Đăng Duy: số thật 23,8%, mục tiêu 6/9 người có DS tháng 6',
      severity: 'high',
      emoji: '🎯',
    },
  },
  {
    time: 41,
    who: 'huong',
    action: {
      type: 'speech',
      msg: 'Anh nhận ra khách theo anh lâu nhất là khách từ 3-6 tháng trước, không phải lead mới. Tháng này anh dành 40% thời gian gọi lại khách cũ — họ đã tin tưởng mình, chỉ cần có căn phù hợp là chốt ngay.',
      feature: 'Tuấn Dũng: insight — khách cũ 3-6 tháng có tỷ lệ chốt cao hơn',
      severity: 'medium',
      emoji: '🔍',
    },
  },
  {
    time: 43,
    who: 'khoa',
    action: {
      type: 'speech',
      msg: 'Em đã làm xong bảng Google Sheet theo dõi pipeline: cột khách nóng, nhà nóng, chủ đang đàm phán, xác suất chốt. Update mỗi sáng thứ Hai. Anh Duy muốn em share template lên nhóm Zalo cho cả nhóm dùng luôn không?',
      feature: 'Khoa: đã làm bảng pipeline xong, đề nghị share template cả nhóm',
      severity: 'medium',
      emoji: '📊',
    },
  },
  { time: 45, who: 'mai',      action: { type: 'walk', target: 'coffee' } },
  { time: 46, who: 'thanhduy', action: { type: 'walk', target: 'coffee' } },
  {
    time: 47,
    who: 'thanhduy',
    action: {
      type: 'speech',
      msg: 'Em thử quay clip review nhà tuần rồi rồi — một căn quay 3 góc khác nhau ra được 3 clip hợp lệ. Mic cài vào cổ áo là bắt buộc, không có mic là clip không được tính. Em đang nhắm giải Kim Cương 2 triệu luôn.',
      feature: 'Thanh Duy: đã thử clip, chia tactic 3 góc/căn, nhắm Kim Cương',
      severity: 'medium',
      emoji: '🎬',
    },
  },
  {
    time: 50,
    who: 'luan',
    action: {
      type: 'speech',
      msg: 'Em tính xong rồi: hoa hồng một căn 100 triệu thì người báo nhà được 1 triệu, người làm giá được 500k. Mục tiêu tháng này em chốt đủ 508 triệu để lấy thưởng 7,68 triệu. iPhone 17 Pro Max thì cần 708 triệu — để tháng sau tính.',
      feature: 'Luân: tự tính ngược từ thưởng, chốt mục tiêu 508 triệu tháng 6',
      severity: 'medium',
      emoji: '🧮',
    },
  },
  {
    time: 53,
    who: 'linh',
    action: {
      type: 'speech',
      msg: 'Em quan sát thấy anh Công và anh Dũng chốt được là vì không dẫn khách vào căn chưa xác nhận còn bán. Tuần này em áp dụng: gọi 5 chủ nhà xác nhận trước, dẫn khách vào căn nào thì căn đó phải đang thật sự bán.',
      feature: 'Thường: học từ quan sát người thành công, áp dụng ngay tuần này',
      severity: 'medium',
      emoji: '👁️',
    },
  },
  { time: 55, who: 'mai',      action: { type: 'walk', target: 'desk' } },
  { time: 55, who: 'thanhduy', action: { type: 'walk', target: 'desk' } },
  {
    time: 57,
    who: 'tri',
    action: {
      type: 'speech',
      msg: 'Lần trước căn em đang theo, hai người khác cùng gọi chủ — chủ bị nhiễu thông tin, kéo giá lên lại mất 200 triệu tiền hoa hồng tiềm năng. Từ đó em thấy rõ: mỗi căn phải có đúng một người phụ trách, không ai gọi chồng lên.',
      feature: 'Trí: mất deal thật vì gọi chồng chéo — bài học 200 triệu',
      severity: 'high',
      emoji: '🏠',
    },
  },
  {
    time: 59,
    who: 'huy',
    action: {
      type: 'speech',
      msg: 'Anh Duy kiến nghị ban lãnh đạo cho nhóm tiếp cận danh sách nguồn hàng tồn 6-12 tháng của công ty. Tụi em gọi làm giá, bán được thì trả bằng doanh số. Không xin tiền — chỉ xin data thôi.',
      feature: 'Huy: kiến nghị cụ thể — đổi data nguồn hàng tồn lấy doanh số',
      severity: 'medium',
      emoji: '📢',
    },
  },
  {
    time: 62,
    who: 'duc',
    action: {
      type: 'speech',
      msg: 'Tuần sau đào tạo viết hợp đồng đặt cọc. Ai đang có hồ sơ sắp chốt thì mang case thật vào — học từ tình huống thật, không học trên giấy. Anh chấm theo lỗi mỗi người hay mắc, không phải chấm lý thuyết chung.',
      feature: 'Đào tạo HĐ đặt cọc từ case thật, chấm theo lỗi cá nhân',
      severity: 'high',
      emoji: '📝',
    },
  },
  {
    time: 66,
    who: 'tuan',
    action: {
      type: 'speech',
      msg: 'Tháng 4 nhóm đạt 361 triệu — kỷ lục từ đầu năm. Không phải may. Tuần đó mọi người gọi nhiều chủ, làm giá thật, khách đã sẵn sàng. Tháng 6 mình làm đúng quy trình đó là tự nhiên ra kết quả — không cần hứa hão.',
      feature: 'Tam Công: tháng 4 đạt 361 triệu — lặp lại quy trình không hứa hão',
      severity: 'low',
      emoji: '🔑',
    },
  },
]

export const SCRIPT_DURATION = 72 // seconds before loop
