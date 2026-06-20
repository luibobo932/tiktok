// ─────────────────────────────────────────────────────────────────────────────
// Agenda họp phát triển nhóm Bom Tấn — dựng từ tình hình & "hàm ý quản trị" thật.
// Mỗi chủ đề: trưởng nhóm mở → các thành viên liên quan góp ý → thư ký rút việc cần làm.
// ─────────────────────────────────────────────────────────────────────────────

export interface AgendaTopic {
  id: string
  title: string // hiển thị trên UI
  focus: string // ngữ cảnh đưa vào prompt — đang đào sâu điều gì
  opener: string // gợi ý cách trưởng nhóm mở chủ đề
  participants: string[] // persona id nên góp ý (ngoài trưởng nhóm 'duc')
}

export const AGENDA: AgendaTopic[] = [
  {
    id: 'pipeline',
    title: 'Pipeline & doanh số tháng',
    focus:
      'Năm 2026 nhiều người chưa chốt căn nào. Cần số thật: tuần này mỗi người có mấy khách, căn nào sắp chốt, và làm gì để ra giao dịch trong 30 ngày tới. Mục tiêu nhóm 1.5 tỷ/quý.',
    opener: 'Yêu cầu từng người báo số thật: tuần này mấy khách, căn nào sắp chốt, vướng ở đâu.',
    participants: ['huong', 'tuan', 'luan', 'khoa'],
  },
  {
    id: 'closing-skill',
    title: 'Kỹ năng chốt & kèm người mới',
    focus:
      'Khoa vừa bể hồ sơ vì không báo Duy sớm; Luân còn phải bám Duy mỗi khi chốt. Cần quy trình escalation sớm (báo trưởng nhóm trước khi khách lung lay) và lịch kèm cặp 1-1.',
    opener: 'Bàn cách kèm chốt cho người mới và tránh lặp lại vụ bể hồ sơ vì báo trễ.',
    participants: ['khoa', 'luan', 'huong', 'tuan'],
  },
  {
    id: 'listings',
    title: 'Quản lý nguồn hàng',
    focus:
      'Phải báo nhà đều và ưu tiên nội bộ; không để nguồn công ty bị tuồn bán ra ngoài hay chia 50-50 với cò vườn. Cần cơ chế minh bạch nguồn nhà trên Landsoft.',
    opener: 'Siết kỷ luật nguồn hàng: báo nhà nội bộ trước, minh bạch trên Landsoft, không tuồn ra ngoài.',
    participants: ['mai', 'tuan', 'huy', 'huong'],
  },
  {
    id: 'content',
    title: 'Content & TikTok ra đơn',
    focus:
      'Clip Thanh Duy đạt 1 triệu view. Làm sao biến lượt xem thành khách xem nhà thật và giao dịch; Khoa làm content cùng; cả nhóm quay review nhà đều đặn.',
    opener: 'Bàn cách biến view TikTok thành khách thật, và nhân rộng cách làm content cho cả nhóm.',
    participants: ['thanhduy', 'khoa', 'tuan', 'huong'],
  },
  {
    id: 'discipline',
    title: 'Kỷ luật & tinh thần nhóm',
    focus:
      'Đi trễ, thái độ hợp tác, và xung đột nội bộ (vụ Zalo 18/6) đang ảnh hưởng nhóm. Cần kéo mọi người tập trung vào mục tiêu chung thay vì phe phái, xử lý bằng quy chế và bằng chứng.',
    opener: 'Nói thẳng về giờ giấc và thái độ phối hợp; nhóm cần đoàn kết hướng tới chỉ tiêu.',
    participants: ['tri', 'mai', 'huong', 'huy'],
  },
  {
    id: 'target',
    title: 'Chốt mục tiêu & cam kết quý',
    focus:
      'Chốt chỉ tiêu quý 1.5 tỷ, phân bổ cho từng người, và lấy cam kết con số cụ thể của mỗi người cho tháng này.',
    opener: 'Chốt mục tiêu quý 1.5 tỷ và xin cam kết con số cụ thể của từng người tháng này.',
    participants: ['huong', 'tuan', 'thanhduy', 'luan'],
  },
]

// Thư ký cuộc họp — rút 1 việc cần làm cụ thể cho trưởng nhóm sau mỗi chủ đề.
export const SECRETARY_PROMPT = `Bạn là thư ký cuộc họp nhóm môi giới BĐS Bom Tấn (Sài Gòn King Land). Dựa trên đoạn trao đổi vừa rồi về một chủ đề, hãy rút ra ĐÚNG MỘT việc cần làm cụ thể, khả thi cho trưởng nhóm Trần Đăng Duy để phát triển nhóm. Viết 1 câu ngắn (tối đa 22 từ) dạng hành động: làm gì, cho ai, khi nào nếu có. Bắt đầu bằng động từ. KHÔNG giải thích, KHÔNG xuống dòng, chỉ trả về đúng câu việc cần làm.`

// Cố vấn quản trị — "reflection" kiểu Stanford Generative Agents: tổng hợp nhiều
// việc lẻ thành 1 NHẬN ĐỊNH chiến lược tầm cao cho trưởng nhóm.
export const OBSERVER_PROMPT = `Bạn là cố vấn quản trị quan sát cuộc họp nhóm môi giới BĐS Bom Tấn. Nhiệm vụ: nhìn các việc cần làm rời rạc và CHỈ RA MỐI LIÊN HỆ ẨN giữa chúng — một quy luật/rủi ro/cơ hội ở tầng sâu mà từng việc lẻ không nói ra.
Ví dụ tốt: "Rủi ro: ba việc đều xoay quanh nhân viên giấu thông tin với sếp — đây là vấn đề văn hóa báo cáo, không phải kỹ năng."
Ví dụ XẤU (cấm tuyệt đối): "Phải làm ngay các việc để duy trì tiến độ", "Cần quyết tâm hơn" — loại câu chung chung vô giá trị.
Viết ĐÚNG 1 câu sắc bén, cụ thể (tối đa 28 từ), bắt đầu bằng "Quy luật:", "Rủi ro:" hoặc "Cơ hội:". Chỉ trả về đúng câu nhận định.`

// Cố vấn coaching — với mỗi người vừa phát biểu, gợi 1 nước đi quản trị cho Duy.
export const COACH_PROMPT = `Bạn là cố vấn quản trị cho trưởng nhóm Bom Tấn (Trần Đăng Duy). Với MỖI nhân viên vừa phát biểu, hãy cho Duy đúng 1 NƯỚC ĐI mà chính Duy nên làm với người đó (giao việc, kèm cặp, giao deadline, khen đúng lúc, nhắc nhở bằng quy chế...). Câu lệnh ngắn, bắt đầu bằng động từ, tối đa 16 từ, hợp tính cách người đó. CẤM lời động viên chung chung kiểu "tiếp tục cố gắng". Trả về mỗi người MỘT dòng đúng định dạng "Tên: nước đi", không thêm gì khác.`
